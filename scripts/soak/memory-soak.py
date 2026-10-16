#!/usr/bin/env python3
"""
file: scripts/soak/memory-soak.py
description: YYC³ 8h 内存浸泡观测 — chromium 长驻采样 + 增长斜率判定（NDJSON 归档）
author: YanYuCloudCube Team
version: v1.0.0
created: 2026-10-16
updated: 2026-10-16
status: active
tags: [soak],[memory],[observability],[p2]

copyright: YanYuCloudCube Team
license: MIT

brief: P2-3 例行化内存观测（禁止"感觉良好"的数值出口）—
  复用 e2e/offline-server.mjs 服务 out/ 生产产物，playwright（.venv）启动
  chromium 长驻加载首页，每 interval 秒采样：
    - performance.memory.usedJSHeapSize（Chromium 堆字节数）
    - window.__YYC3_RUNTIME_METRICS__()（应用运行时指标快照）
  NDJSON 逐行落盘 reports/soak/<时间戳>.ndjson，结束后写
  <时间戳>.summary.json：样本数 / 堆增长斜率（线性回归，bytes/min）/ 判定。
  判定阈值：斜率 > 512 KiB/min → "leak-suspected"（退出码 1）；
  运行时长 < 30min → "insufficient-duration"（短程实证不判泄漏，退出码 0）。

usage:
  pnpm test:soak          # 默认 8h（--duration-minutes 480 --interval-seconds 60）
  pnpm test:soak:short    # 1min 短程实证（--duration-minutes 1 --interval-seconds 10）

dependencies: playwright（.venv，e2e:setup 预装）
"""

from __future__ import annotations

import argparse
import json
import signal
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "reports" / "soak"
SERVER_URL = "http://127.0.0.1:4173/"
SERVER_STARTUP_TIMEOUT_S = 30
PROBE_TIMEOUT_MS = 30_000
LEAK_SLOPE_BYTES_PER_MIN = 512 * 1024
MIN_MINUTES_FOR_VERDICT = 30


def wait_server_ready(timeout_s: int) -> None:
    """轮询 offline-server 直到 200（zero-dep 服务器无就绪回执，以可访问为准）"""
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        try:
            with urlopen(SERVER_URL, timeout=1) as resp:  # noqa: S310（固定回环地址）
                if resp.status == 200:
                    return
        except (URLError, OSError):
            time.sleep(0.25)
    raise RuntimeError(f"offline-server {SERVER_URL} {timeout_s}s 内未就绪")


def linear_slope_bytes_per_ms(points: list[tuple[float, float]]) -> float:
    """最小二乘斜率（bytes per ms）；样本 < 2 或 x 全同时返回 0.0"""
    if len(points) < 2:
        return 0.0
    n = len(points)
    mean_x = sum(x for x, _ in points) / n
    mean_y = sum(y for _, y in points) / n
    cov = sum((x - mean_x) * (y - mean_y) for x, y in points)
    var = sum((x - mean_x) ** 2 for x, _ in points)
    if var == 0:
        return 0.0
    return cov / var


def main() -> int:
    parser = argparse.ArgumentParser(description="YYC³ 8h 内存浸泡观测")
    parser.add_argument("--duration-minutes", type=float, default=480.0, help="观测时长（分钟，默认 480 = 8h）")
    parser.add_argument("--interval-seconds", type=float, default=60.0, help="采样间隔（秒，默认 60）")
    parser.add_argument("--out", type=Path, default=None, help="NDJSON 输出路径（默认 reports/soak/<ts>.ndjson）")
    args = parser.parse_args()

    if not (ROOT / "out" / "index.html").exists():
        print("[soak] out/ 不存在 — 先运行 pnpm build 生成生产产物", file=sys.stderr)
        return 2

    duration_s = args.duration_minutes * 60.0
    interval_s = args.interval_seconds
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    ndjson_path = args.out if args.out else OUT_DIR / f"{stamp}.ndjson"
    summary_path = ndjson_path.with_suffix(".summary.json")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    server = subprocess.Popen(
        ["node", str(ROOT / "e2e" / "offline-server.mjs")],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    interrupted = False

    def on_signal(_signum: Any, _frame: Any) -> None:
        nonlocal interrupted
        interrupted = True

    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGTERM, on_signal)

    samples: list[dict[str, Any]] = []
    try:
        wait_server_ready(SERVER_STARTUP_TIMEOUT_S)
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--enable-precise-memory-info"],
            )
            page = browser.new_page()
            page.goto(SERVER_URL, wait_until="load", timeout=60_000)
            # 运行时探针由 perf-sink 挂载（生产构建含）；等待水合完成
            page.wait_for_function(
                "() => typeof window.__YYC3_RUNTIME_METRICS__ === 'function'",
                timeout=PROBE_TIMEOUT_MS,
            )
            print(f"[soak] 观测开始 duration={args.duration_minutes}min interval={interval_s}s → {ndjson_path.name}")
            with ndjson_path.open("w", encoding="utf-8") as fh:
                deadline = time.monotonic() + duration_s
                while time.monotonic() < deadline and not interrupted:
                    record: dict[str, Any] = page.evaluate(
                        "() => ({"
                        " ts: Date.now(),"
                        " heap: (performance.memory && performance.memory.usedJSHeapSize) ?? null,"
                        " snapshot: window.__YYC3_RUNTIME_METRICS__()"
                        " })"
                    )
                    fh.write(json.dumps(record, ensure_ascii=False) + "\n")
                    fh.flush()
                    samples.append(record)
                    slice_end = time.monotonic() + interval_s
                    while time.monotonic() < slice_end and not interrupted and time.monotonic() < deadline:
                        time.sleep(0.5)
            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()

    heap_points = [
        (float(rec["ts"]), float(rec["heap"]))
        for rec in samples
        if rec.get("heap") is not None
    ]
    slope_bytes_per_min = linear_slope_bytes_per_ms(heap_points) * 60_000.0
    heaps = [y for _, y in heap_points]
    if args.duration_minutes < MIN_MINUTES_FOR_VERDICT:
        verdict = "insufficient-duration"
    elif slope_bytes_per_min > LEAK_SLOPE_BYTES_PER_MIN:
        verdict = "leak-suspected"
    else:
        verdict = "stable"

    summary = {
        "started_at": stamp,
        "duration_minutes": args.duration_minutes,
        "interval_seconds": args.interval_seconds,
        "samples": len(samples),
        "heap_samples": len(heap_points),
        "heap_min_bytes": min(heaps) if heaps else None,
        "heap_max_bytes": max(heaps) if heaps else None,
        "slope_bytes_per_minute": round(slope_bytes_per_min, 1),
        "threshold_bytes_per_minute": LEAK_SLOPE_BYTES_PER_MIN,
        "verdict": verdict,
        "interrupted": interrupted,
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if verdict == "leak-suspected":
        print(f"[soak] 判定 leak-suspected：斜率 {slope_bytes_per_min:.0f} B/min 超阈值", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
