# -*- coding: utf-8 -*-
"""
YYC³-MH3 · E2E 浏览器冒烟（Track B 静态导出产物，IDB 真实路径 + prod CSP）

阶段：
  S1 静态伺服 out/（.html 回退映射，自管线程，端口 8899）
  S2 IDB 端到端闭环 12 项：登录 → 建批次 → IDB 直读 → 刷新存活 → 导出信封三验
     → 清库夹具重播 → 导入水合 → 刷新复活
  S3 prod CSP：meta 为 prod 面（无 unsafe-eval）+ 零违规 + 零 JS 错误

用法（先 pnpm build）：
  .venv/bin/python scripts/e2e/smoke.py
依赖：pip install -r scripts/e2e/requirements.txt && python -m playwright install chromium
（一键：pnpm e2e:setup && pnpm test:e2e）
"""
import json
import re
import sys
import threading
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "out"
PORT = 8899
BASE = f"http://127.0.0.1:{PORT}"
SMOKE_NAME = "SMOKE-冒烟批次-001"
EXPORT_PATH = "/tmp/yyc3-smoke-export.json"
FAILS: list[str] = []


def check(label: str, cond: bool, detail: str = "") -> None:
    tag = "PASS" if cond else "FAIL"
    print(f"[{tag}] {label}" + (f" · {detail}" if detail else ""))
    if not cond:
        FAILS.append(f"{label} {detail}")


def read_idb(page, store: str = "batches") -> list:
    return page.evaluate(
        """(store) => new Promise((resolve, reject) => {
            const req = indexedDB.open('yyc3-mh3');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction(store, 'readonly');
                const all = tx.objectStore(store).getAll();
                all.onsuccess = () => { db.close(); resolve(all.result); };
                all.onerror = () => { db.close(); reject(String(all.error)); };
            };
            req.onerror = () => reject(String(req.error));
        })""",
        store,
    )


def wipe_db(page) -> None:
    page.evaluate(
        """() => new Promise((resolve) => {
            const req = indexedDB.deleteDatabase('yyc3-mh3');
            req.onsuccess = () => resolve('deleted');
            req.onerror = () => resolve('error');
            req.onblocked = () => resolve('blocked');
        })"""
    )


def envelope_names(rows: list) -> list[str]:
    names = []
    for r in rows:
        v = r.get("value", r) if isinstance(r, dict) else None
        if isinstance(v, dict) and v.get("name"):
            names.append(v["name"])
    return names


def login(page) -> None:
    """应用默认已登录；若登录守卫开启则先走登录表单（六步闭环 setTimeout 链留时）。"""
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1500)
    login_btn = page.locator("button:has-text('登录本地生产线')")
    if login_btn.count() > 0 and login_btn.first.is_visible():
        login_btn.first.click()
        page.wait_for_timeout(2500)
    page.wait_for_selector("button:has-text('新建批次')", timeout=90000)


def open_data_tab(page) -> None:
    """P3 路由化后 settings 为独立路由（/settings）：直达并切至「数据主权（本地持久化）」分区。

    延迟水合（DCL+250ms 注入真实脚本）在 IDB 已有批次数据时水合偏慢：
    先等 window.next 水合证据，再等页签/分区按钮（各 60s，防 CI 慢机误报）。"""
    page.goto(BASE + "/settings", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_function("() => Boolean(window.next)", timeout=60000)
    page.wait_for_selector("button:has-text('数据主权（本地持久化）')", timeout=60000)
    page.click("button:has-text('数据主权（本地持久化）')")
    page.wait_for_selector("button:has-text('导出全部数据')", timeout=60000)


class HtmlFallbackHandler(SimpleHTTPRequestHandler):
    """静态伺服：/settings → settings.html 回退（Next 静态导出无目录 index）。"""

    def translate_path(self, path: str) -> str:
        resolved = super().translate_path(path)
        candidate = Path(resolved)
        if candidate.is_dir():
            index = candidate / "index.html"
            if index.exists():
                return str(index)
        if not candidate.exists() and candidate.suffix == "":
            html = candidate.with_suffix(".html")
            if html.exists():
                return str(html)
        return resolved

    def log_message(self, format: str, *args) -> None:  # noqa: A002 基类签名对齐；静默访问日志
        return


def start_server() -> ThreadingHTTPServer:
    handler = partial(HtmlFallbackHandler, directory=str(OUT))
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    print(f"[srv] 静态伺服 out/ → {BASE}")
    return httpd


def stage_idb_loop(page) -> None:
    """S2：IDB 端到端闭环（落盘/存活/导出/清库/导入复活）。"""
    login(page)
    check("T1 应用外壳可达（新建批次入口）", page.locator("button:has-text('新建批次')").is_visible())

    page.click("button:has-text('新建批次')")
    page.wait_for_selector("text=创建新数字人生产批次", timeout=30000)
    dialog = page.locator("div.fixed.inset-0.z-50").first
    dialog.locator("input").first.fill(SMOKE_NAME)
    page.click("button:has-text('创建并立即启动五步流水线')")
    page.wait_for_selector("text=已创建并启动", timeout=15000)
    check("T2 新建批次提交成功（toast 反馈）", True)

    names = envelope_names(read_idb(page))
    check("T3 IDB 直读：批次已落盘", SMOKE_NAME in names, f"库内批次={names}")

    page.reload(wait_until="domcontentloaded")
    login(page)
    names = envelope_names(read_idb(page))
    check("T4 刷新后批次存活（IDB 持久化）", SMOKE_NAME in names, f"库内批次={names}")

    page.goto(BASE + "/settings", wait_until="domcontentloaded", timeout=60000)
    open_data_tab(page)
    badge = page.wait_for_selector("text=IndexedDB 本地持久化", timeout=30000)
    check("T5 设置页持久化徽标 = IndexedDB", badge.is_visible())

    with page.expect_download(timeout=30000) as dl_info:
        page.click("button:has-text('导出全部数据')")
    dl = dl_info.value
    check(
        "T6 导出文件名符合规范",
        bool(re.match(r"yyc3-mh3-export-\d{8}-\d{6}\.json", dl.suggested_filename)),
        dl.suggested_filename,
    )
    dl.save_as(EXPORT_PATH)
    envelope = json.load(open(EXPORT_PATH, encoding="utf-8"))
    exported_names = [b.get("name", "") for b in envelope.get("batches", [])]
    check(
        "T7 信封 format/version",
        envelope.get("format") == "yyc3-mh3-export" and envelope.get("version") == 1,
        f"format={envelope.get('format')}",
    )
    check("T8 信封含冒烟批次", SMOKE_NAME in exported_names)
    page.wait_for_selector("text=数据导出成功", timeout=15000)

    wipe_db(page)
    page.reload(wait_until="domcontentloaded")
    login(page)
    time.sleep(0.5)
    names = envelope_names(read_idb(page))
    check("T9 清库后冒烟批次消失（仅夹具重播）", SMOKE_NAME not in names, f"库内批次={names}")

    page.goto(BASE + "/settings", wait_until="domcontentloaded", timeout=60000)
    open_data_tab(page)
    page.set_input_files("input[type='file']", EXPORT_PATH)
    page.wait_for_selector("text=数据导入成功", timeout=20000)
    check("T10 导入 toast 成功反馈", True)

    page.reload(wait_until="domcontentloaded")
    login(page)
    names = envelope_names(read_idb(page))
    check("T11 刷新后导入批次复活（端到端水合）", SMOKE_NAME in names, f"库内批次={names}")


def stage_prod_csp(page) -> None:
    """S3：prod CSP meta 为收紧面 + 零违规 + 零 JS 错误。"""
    console_logs: list[str] = []
    page.on("console", lambda m: console_logs.append(f"{m.type}: {m.text[:200]}"))
    page.on("pageerror", lambda e: console_logs.append(f"PAGEERROR: {str(e)[:300]}"))

    page.goto(BASE + "/", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2000)
    csp = page.evaluate(
        "document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')?.content || 'MISSING'"
    )
    check("T12 CSP meta 在位（prod 面）", csp != "MISSING")
    check("T13 prod CSP 无 unsafe-eval", "unsafe-eval" not in csp)
    script_src = next(
        (part for part in csp.split(";") if part.strip().startswith("script-src")), ""
    )
    check(
        "T14 CSP script-src 为 self+哈希 最小面（段内无 unsafe-inline）",
        "script-src 'self'" in script_src
        and "sha256-" in script_src
        and "unsafe-inline" not in script_src,
    )
    violations = [l for l in console_logs if "Content Security Policy" in l]
    check("T15 零 CSP 违规", len(violations) == 0, f"{len(violations)} 条")
    js_errors = [
        l for l in console_logs if l.startswith("error") or l.startswith("PAGEERROR")
    ]
    check("T16 零页面/控制台严重错误", len(js_errors) == 0, f"{len(js_errors)} 条")
    for e in (violations + js_errors)[:8]:
        print(f"   ! {e[:200]}")


def main() -> int:
    if not OUT.exists():
        print("❌ out/ 不存在：请先 pnpm build（静态导出产物为冒烟对象）")
        return 2
    httpd = start_server()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            stage_idb_loop(page)
            stage_prod_csp(page)
            browser.close()
    finally:
        httpd.shutdown()

    print("\n===== 冒烟结论 =====")
    if FAILS:
        print(f"❌ {len(FAILS)} 项失败：")
        for f in FAILS:
            print(f"   - {f}")
        return 1
    print("✅ 16 项检查全部通过：IDB 真实路径端到端 + prod CSP 收紧面")
    return 0


if __name__ == "__main__":
    sys.exit(main())
