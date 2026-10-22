/**
 * file: e2e/perf.spec.ts
 * description: YYC³ 运行时健康 E2E — 真实浏览器数值断言（错误率 / p95 / 长任务）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [e2e],[perf],[observability],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 评分卡 P0-1 验收命令 — `pnpm test:perf`：
 *   真实 Chromium 加载首页，经 window.__YYC3_RUNTIME_METRICS__() 取
 *   runtimeMetrics 快照，断言 ① 有页面视图计数 ② 错误率 ≤ 1%
 *   ③ 导航 p95 < 2s（有样本时）④ 长任务 p95 ≤ 50ms（有样本时）。
 *   指标窗口为滑动有界（500 样本），快照即评分卡运行时维度的真实数值。
 *
 * dependencies: @playwright/test
 * exports: —
 */
import { expect, test } from "@playwright/test";

/** 运行时指标快照（对齐 RuntimeMetricsSnapshot 判读子集） */
interface Snapshot {
  pageViews: number;
  errors: number;
  errorRate: number;
  p95LatencyMs: number;
  p95LongTaskMs: number;
}

test("运行时健康预算：错误率 ≤1%，导航 p95 <2s，长任务 p95 ≤50ms", async ({ page }) => {
  await page.goto("/");

  // 等待 PerfSink 挂载并暴露调试探针
  await page.waitForFunction(
    () => typeof (window as { __YYC3_RUNTIME_METRICS__?: unknown }).__YYC3_RUNTIME_METRICS__ === "function",
  );

  // 观察窗口：等待导航耗时样本与可能的长任务样本落窗
  await page.waitForTimeout(1500);

  const snap = (await page.evaluate(() =>
    (window as unknown as { __YYC3_RUNTIME_METRICS__: () => Snapshot }).__YYC3_RUNTIME_METRICS__(),
  )) as Snapshot;
  // 评分卡取证：输出本轮真实数值（错误率 / p95）
  console.log("[runtime-metrics]", JSON.stringify(snap));

  // ① 页面视图计数到位（错误率分母真实）
  expect(snap.pageViews).toBeGreaterThanOrEqual(1);
  // ② 错误率 ≤ 1%（评分卡运行时健康目标）
  expect(snap.errorRate).toBeLessThanOrEqual(0.01);
  // ③ 导航 p95 < 2s（有真实样本时判预算）
  if (snap.p95LatencyMs > 0) {
    expect(snap.p95LatencyMs).toBeLessThan(2000);
  }
  // ④ 长任务 p95 ≤ 50ms（有真实样本时判预算）
  if (snap.p95LongTaskMs > 0) {
    expect(snap.p95LongTaskMs).toBeLessThanOrEqual(50);
  }
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
