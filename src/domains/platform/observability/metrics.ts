/**
 * file: src/domains/platform/observability/metrics.ts
 * description: YYC³ 可观测域 — 运行时指标核（错误率 / p95 分位 / 预算判定，纯函数零副作用）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[observability],[metrics],[p95],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 评分卡 P0-1 验收指标核 — 浏览器端真实数值采集：
 *   - 错误率 = errors / pageViews（目标 < 1%）
 *   - p95（最近秩法）＝ 导航耗时 < 2s ／ 长任务 < 50ms
 *   - 滑动窗口有界（默认 500 样本，防长会话内存无界）
 * 领域纯函数：无 window/DOM 依赖，app 层门面（runtimeMetrics）负责采集接线。
 *
 * dependencies: —（零依赖叶层）
 * exports: METRICS_BUDGETS, RuntimeMetricsSnapshot, MetricsWindow, MetricsWindowOptions, percentile, createMetricsWindow
 */

/** 评分卡运行时健康预算（唯一事实来源，snapshot.overBudget 与之对齐） */
export const METRICS_BUDGETS = {
  /** 错误率预算：< 1% */
  errorRate: 0.01,
  /** 导航耗时 p95 预算：< 2000ms */
  p95LatencyMs: 2000,
  /** 长任务 p95 预算：< 50ms */
  p95LongTaskMs: 50,
} as const;

/** 运行时指标快照（一次 snapshot = 评分卡运行时维度的一组真实数值） */
export interface RuntimeMetricsSnapshot {
  /** 页面视图计数（错误率分母） */
  pageViews: number;
  /** 客户端错误计数 */
  errors: number;
  /** 错误率（无页面视图时 0） */
  errorRate: number;
  /** 导航耗时 p95（ms；无样本时 0） */
  p95LatencyMs: number;
  /** 长任务 p95（ms；无样本时 0） */
  p95LongTaskMs: number;
  /** 当前窗口样本数（延迟 / 长任务） */
  latencySamples: number;
  longTaskSamples: number;
  /** 预算越界判定（三项与 METRICS_BUDGETS 对齐） */
  overBudget: {
    errorRate: boolean;
    p95LatencyMs: boolean;
    p95LongTaskMs: boolean;
  };
}

/** 指标窗口（有界采集 + 快照） */
export interface MetricsWindow {
  /** 记录一次页面视图（错误率分母 +1） */
  recordPageView(): void;
  /** 记录一次客户端错误 */
  recordError(): void;
  /** 记录一次导航耗时（ms） */
  recordLatency(ms: number): void;
  /** 记录一次长任务耗时（ms） */
  recordLongTask(ms: number): void;
  /** 快照当前指标（纯读取，不改窗口） */
  snapshot(): RuntimeMetricsSnapshot;
  /** 清空窗口（测试/会话边界用） */
  reset(): void;
}

/** 窗口选项 */
export interface MetricsWindowOptions {
  /** 滑动窗口容量（默认 500；超限淘汰最旧样本） */
  windowSize?: number;
}

/**
 * 最近秩百分位（输入须升序；空集返回 0）。
 * p95 of [1..100] → 95（ceil(0.95*100)=95，取第 95 小）。
 */
export function percentile(sortedAsc: readonly number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const rank = Math.min(sortedAsc.length, Math.max(1, Math.ceil(p * sortedAsc.length)));
  return sortedAsc[rank - 1] ?? 0;
}

/** 有界追加：超容量淘汰最旧（防 8h 长会话内存无界） */
function pushBounded(buf: number[], cap: number, value: number): void {
  buf.push(value);
  if (buf.length > cap) buf.shift();
}

/** 创建指标窗口（浏览器端错误率 / p95 唯一采集核，可注入容量便于测试） */
export function createMetricsWindow(options: MetricsWindowOptions = {}): MetricsWindow {
  const cap = options.windowSize ?? 500;
  const latencies: number[] = [];
  const longTasks: number[] = [];
  let pageViews = 0;
  let errors = 0;

  return {
    recordPageView() {
      pageViews += 1;
    },
    recordError() {
      errors += 1;
    },
    recordLatency(ms) {
      if (Number.isFinite(ms) && ms > 0) pushBounded(latencies, cap, ms);
    },
    recordLongTask(ms) {
      if (Number.isFinite(ms) && ms > 0) pushBounded(longTasks, cap, ms);
    },
    snapshot() {
      const errorRate = pageViews === 0 ? 0 : errors / pageViews;
      const sortedLatencies = [...latencies].sort((a, b) => a - b);
      const sortedLongTasks = [...longTasks].sort((a, b) => a - b);
      const p95LatencyMs = percentile(sortedLatencies, 0.95);
      const p95LongTaskMs = percentile(sortedLongTasks, 0.95);
      return {
        pageViews,
        errors,
        errorRate,
        p95LatencyMs,
        p95LongTaskMs,
        latencySamples: latencies.length,
        longTaskSamples: longTasks.length,
        overBudget: {
          errorRate: errorRate > METRICS_BUDGETS.errorRate,
          p95LatencyMs: p95LatencyMs >= METRICS_BUDGETS.p95LatencyMs,
          p95LongTaskMs: p95LongTaskMs > METRICS_BUDGETS.p95LongTaskMs,
        },
      };
    },
    reset() {
      latencies.length = 0;
      longTasks.length = 0;
      pageViews = 0;
      errors = 0;
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
