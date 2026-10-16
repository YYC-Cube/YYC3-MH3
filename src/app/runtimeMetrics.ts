/**
 * file: src/app/runtimeMetrics.ts
 * description: YYC³ 应用层 — 运行时指标采集门面（单例窗口 + 浏览器调试探针）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[metrics],[facade],[observability],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0-1 运行时健康真实数值的唯一 app 侧入口 —
 *   - 单例 MetricsWindow（domains/platform/observability/metrics 纯核）
 *   - error-sink（错误计数）/ perf-sink（页面视图 + 导航耗时 + 长任务）接线
 *   - exposeRuntimeMetricsDebug：挂 window.__YYC3_RUNTIME_METRICS__()，
 *     供 playwright perf 断言与本地控制台取证（禁止"感觉良好"的数值出口）
 *
 * dependencies: ../domains/platform/observability/metrics
 * exports: getRuntimeMetricsWindow, recordClientPageView, recordClientError, recordClientLatency, recordClientLongTask, snapshotRuntimeMetrics, exposeRuntimeMetricsDebug
 */
import {
  MetricsWindow,
  RuntimeMetricsSnapshot,
  createMetricsWindow,
} from "../domains/platform/observability/metrics";

/** 模块级单例（同一页面会话共享同一窗口） */
let singleton: MetricsWindow | null = null;

/** 取运行时指标窗口（懒创建单例） */
export function getRuntimeMetricsWindow(): MetricsWindow {
  singleton ??= createMetricsWindow();
  return singleton;
}

/** 记录一次页面视图（PerfSink 挂载时） */
export function recordClientPageView(): void {
  getRuntimeMetricsWindow().recordPageView();
}

/** 记录一次客户端错误（error-sink 唯一入口处） */
export function recordClientError(): void {
  getRuntimeMetricsWindow().recordError();
}

/** 记录一次导航耗时（ms，p95 分位样本） */
export function recordClientLatency(ms: number): void {
  getRuntimeMetricsWindow().recordLatency(ms);
}

/** 记录一次长任务耗时（ms，p95 分位样本） */
export function recordClientLongTask(ms: number): void {
  getRuntimeMetricsWindow().recordLongTask(ms);
}

/** 快照当前运行时指标（错误率 / p95 / 越界判定） */
export function snapshotRuntimeMetrics(): RuntimeMetricsSnapshot {
  return getRuntimeMetricsWindow().snapshot();
}

/** 调试探针挂载状态（幂等防重复挂） */
let exposed = false;

/**
 * 挂浏览器调试探针：`window.__YYC3_RUNTIME_METRICS__()` 返回指标快照。
 * 供 e2e/perf.spec.ts 断言与本地取证；幂等，SSR 环境安全 no-op。
 */
export function exposeRuntimeMetricsDebug(): void {
  if (exposed || typeof window === "undefined") return;
  const host = window as unknown as {
    __YYC3_RUNTIME_METRICS__?: () => RuntimeMetricsSnapshot;
  };
  host.__YYC3_RUNTIME_METRICS__ = snapshotRuntimeMetrics;
  exposed = true;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
