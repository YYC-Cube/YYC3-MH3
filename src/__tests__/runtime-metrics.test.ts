/**
 * file: src/__tests__/runtime-metrics.test.ts
 * description: YYC³ P0-1 运行时指标核测试（错误率 / p95 最近秩 / 预算判定 / 有界窗口 / 调试探针）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[metrics],[p95],[error-rate],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0-1 验收 —— 指标数学正确性：错误率（errors/pageViews）、
 *        最近秩 p95、预算越界判定对齐评分卡（1% / 2s / 50ms）、
 *        滑动窗口有界淘汰、app 门面采集与调试探针挂载（e2e 数值出口）。
 *
 * dependencies: vitest, ../app/runtimeMetrics, ../domains/platform/observability/metrics
 * exports: —
 */
import { beforeEach, describe, expect, it } from "vitest";

import {
  exposeRuntimeMetricsDebug,
  getRuntimeMetricsWindow,
  recordClientError,
  recordClientLatency,
  recordClientLongTask,
  recordClientPageView,
  snapshotRuntimeMetrics,
} from "../app/runtimeMetrics";
import {
  METRICS_BUDGETS,
  RuntimeMetricsSnapshot,
  createMetricsWindow,
  percentile,
} from "../domains/platform/observability/metrics";

describe("P0-1 运行时指标核", () => {
  beforeEach(() => {
    getRuntimeMetricsWindow().reset();
  });

  it("预算常量与评分卡目标一致（<1% / <2s / <50ms）", () => {
    expect(METRICS_BUDGETS.errorRate).toBe(0.01);
    expect(METRICS_BUDGETS.p95LatencyMs).toBe(2000);
    expect(METRICS_BUDGETS.p95LongTaskMs).toBe(50);
  });

  it("percentile 最近秩：空集 → 0；[1..100] 的 p95 → 95；p50 → 50", () => {
    expect(percentile([], 0.95)).toBe(0);
    const seq = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(percentile(seq, 0.95)).toBe(95);
    expect(percentile(seq, 0.5)).toBe(50);
  });

  it("错误率：100 视图 1 错误 = 1%（不越界）；2 错误 = 2%（越界）", () => {
    const w = createMetricsWindow();
    for (let i = 0; i < 100; i += 1) w.recordPageView();
    w.recordError();
    let snap = w.snapshot();
    expect(snap.errorRate).toBeCloseTo(0.01);
    expect(snap.overBudget.errorRate).toBe(false);

    w.recordError();
    snap = w.snapshot();
    expect(snap.errorRate).toBeCloseTo(0.02);
    expect(snap.overBudget.errorRate).toBe(true);
  });

  it("导航 p95：<2s 不越界；≥2s 判越界（p95 取分位样本）", () => {
    const w = createMetricsWindow();
    for (const ms of [800, 1200, 1600, 1800, 1900]) w.recordLatency(ms);
    expect(w.snapshot().p95LatencyMs).toBe(1900);
    expect(w.snapshot().overBudget.p95LatencyMs).toBe(false);

    w.recordLatency(2400);
    const snap = w.snapshot();
    expect(snap.p95LatencyMs).toBeGreaterThanOrEqual(2000);
    expect(snap.overBudget.p95LatencyMs).toBe(true);
  });

  it("长任务 p95：全样本 ≤50ms 不越界；超 50ms 判越界", () => {
    const w = createMetricsWindow();
    for (const ms of [12, 24, 36, 48]) w.recordLongTask(ms);
    expect(w.snapshot().overBudget.p95LongTaskMs).toBe(false);

    w.recordLongTask(80);
    const snap = w.snapshot();
    expect(snap.p95LongTaskMs).toBe(80);
    expect(snap.overBudget.p95LongTaskMs).toBe(true);
  });

  it("滑动窗口有界：容量 5 时仅保留最新 5 样本（旧样本淘汰）", () => {
    const w = createMetricsWindow({ windowSize: 5 });
    for (const ms of [1, 2, 3, 4, 5, 6, 7]) w.recordLatency(ms);
    const snap = w.snapshot();
    expect(snap.latencySamples).toBe(5);
    expect(snap.p95LatencyMs).toBe(7); // 保留 [3..7]
  });

  it("app 门面全链路：视图/错误/耗时计数 + 快照读数一致", () => {
    recordClientPageView();
    recordClientError();
    recordClientLatency(1500);
    recordClientLongTask(80);

    const snap: RuntimeMetricsSnapshot = snapshotRuntimeMetrics();
    expect(snap.pageViews).toBe(1);
    expect(snap.errors).toBe(1);
    expect(snap.p95LatencyMs).toBe(1500);
    expect(snap.p95LongTaskMs).toBe(80);
    expect(snap.overBudget.errorRate).toBe(true); // 1/1 = 100%
  });

  it("调试探针：window.__YYC3_RUNTIME_METRICS__() 返回同一快照（e2e 数值出口）", () => {
    recordClientPageView();
    exposeRuntimeMetricsDebug();
    const probe = (window as unknown as { __YYC3_RUNTIME_METRICS__?: () => RuntimeMetricsSnapshot })
      .__YYC3_RUNTIME_METRICS__;
    expect(typeof probe).toBe("function");
    expect(probe!().pageViews).toBe(snapshotRuntimeMetrics().pageViews);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
