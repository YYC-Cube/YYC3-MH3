/**
 * file: src/domains/platform/observability/export.ts
 * description: YYC³ 可观测域 — 结构化出口纯函数（Prometheus exposition + Loki push 载荷）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[observability],[prometheus],[loki],[export],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-2 可观测出口 — 把真实采集数值渲染为业界标准线格式（wire format）：
 *   - renderRuntimePrometheus：运行时指标快照 → Prometheus 文本暴露格式
 *     （/metrics scrape 端点与 window 探针共用；HELP/TYPE + 指标样本行）
 *   - toLokiPushPayload：结构化 LogEntry（含 traceId）→ Loki /loki/api/v1/push
 *     请求载荷（纳秒时间戳 + logfmt 行，traceId 可检索）
 *   纯函数零副作用：无 fetch/window 依赖，适配器层负责真实传输。
 *
 * dependencies: ./metrics, ../../../types
 * exports: renderRuntimePrometheus, toLokiPushPayload, LokiPushPayload, LokiLabels
 */
import type { LogEntry } from "../../../types";
import type { RuntimeMetricsSnapshot } from "./metrics";

/* ---------------- Prometheus 文本暴露格式 ---------------- */

/** Prometheus 指标名合法性（[a-zA-Z_:][a-zA-Z0-9_:]*），防御非法字符注入 exposition */
function sanitizeMetricName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_:]/g, "_");
  return /^[a-zA-Z_:]/.test(cleaned) ? cleaned : `yyc3_${cleaned}`;
}

/** 数值 → exposition 样本值（有限数直出；NaN/Infinity → +Inf/-Inf/NaN 规范词） */
function formatSampleValue(value: number): string {
  if (Number.isNaN(value)) return "NaN";
  if (value === Number.POSITIVE_INFINITY) return "+Inf";
  if (value === Number.NEGATIVE_INFINITY) return "-Inf";
  return String(value);
}

/**
 * 运行时指标快照 → Prometheus 文本暴露格式（text/plain; version=0.0.4）。
 *
 * 指标族（与 METRICS_BUDGETS 三预算一一对应，overBudget 判定单列一族）：
 * - yyc3_runtime_page_views_total（counter）
 * - yyc3_runtime_client_errors_total（counter）
 * - yyc3_runtime_error_rate（gauge，ratio）
 * - yyc3_runtime_nav_latency_p95_ms / yyc3_runtime_long_task_p95_ms（gauge）
 * - yyc3_runtime_budget_violations（gauge，0-3，越界预算数）
 */
export function renderRuntimePrometheus(snapshot: RuntimeMetricsSnapshot): string {
  const violations =
    (snapshot.overBudget.errorRate ? 1 : 0) +
    (snapshot.overBudget.p95LatencyMs ? 1 : 0) +
    (snapshot.overBudget.p95LongTaskMs ? 1 : 0);
  const families: Array<{ name: string; type: "counter" | "gauge"; help: string; value: number }> = [
    {
      name: "yyc3_runtime_page_views_total",
      type: "counter",
      help: "页面视图累计（错误率分母）",
      value: snapshot.pageViews,
    },
    {
      name: "yyc3_runtime_client_errors_total",
      type: "counter",
      help: "客户端错误累计（error-sink 上报）",
      value: snapshot.errors,
    },
    {
      name: "yyc3_runtime_error_rate",
      type: "gauge",
      help: "错误率（errors/pageViews，预算 <0.01）",
      value: snapshot.errorRate,
    },
    {
      name: "yyc3_runtime_nav_latency_p95_ms",
      type: "gauge",
      help: "导航耗时 p95（ms，预算 <2000）",
      value: snapshot.p95LatencyMs,
    },
    {
      name: "yyc3_runtime_long_task_p95_ms",
      type: "gauge",
      help: "长任务 p95（ms，预算 <50）",
      value: snapshot.p95LongTaskMs,
    },
    { name: "yyc3_runtime_budget_violations", type: "gauge", help: "越界预算计数（0-3）", value: violations },
  ];
  const lines: string[] = [];
  for (const family of families) {
    const name = sanitizeMetricName(family.name);
    lines.push(`# HELP ${name} ${family.help}`);
    lines.push(`# TYPE ${name} ${family.type}`);
    lines.push(`${name} ${formatSampleValue(family.value)}`);
  }
  return `${lines.join("\n")}\n`;
}

/* ---------------- Loki push 载荷格式 ---------------- */

/** Loki 流标签（静态标签面：应用标识 + 来源通道） */
export interface LokiLabels {
  app: string;
  source: string;
}

/** Loki /loki/api/v1/push 请求载荷（values: [纳秒时间戳字符串, logfmt 行]） */
export interface LokiPushPayload {
  streams: Array<{
    stream: LokiLabels;
    values: Array<[string, string]>;
  }>;
}

/** ISO 时间戳 → Loki 纳秒时间戳字符串（解析失败回退 0，不伪造时间） */
function toNanoseconds(iso: string): string {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? String(ms * 1_000_000) : "0";
}

/** logfmt 值转义（含空白或引号的值以引号包裹，内部引号反斜杠转义） */
function logfmtValue(value: string): string {
  return /\s|"/.test(value) ? `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : value;
}

/** 单条 LogEntry → logfmt 行（traceId 在行内可检索，P0-2 全链路串联口径） */
function toLogfmtLine(entry: LogEntry): string {
  const parts = [
    `level=${logfmtValue(entry.level)}`,
    `stage=${logfmtValue(entry.stage)}`,
    `msg=${logfmtValue(entry.message)}`,
  ];
  if (entry.traceId) parts.push(`traceId=${logfmtValue(entry.traceId)}`);
  return parts.join(" ");
}

/**
 * 结构化日志批次 → Loki push 载荷。
 * 单标签流（同 labels 同流）多值批量；空批次返回空 streams（调用方无需发送）。
 */
export function toLokiPushPayload(entries: readonly LogEntry[], labels: LokiLabels): LokiPushPayload {
  if (entries.length === 0) return { streams: [] };
  return {
    streams: [
      {
        stream: labels,
        values: entries.map((entry) => [toNanoseconds(entry.timestamp), toLogfmtLine(entry)]),
      },
    ],
  };
}

/** 毫秒时间戳 → Loki 纳秒时间戳字符串（非法值回退 0，不伪造时间） */
function msToNanoseconds(ms: number): string {
  return Number.isFinite(ms) ? String(Math.floor(ms) * 1_000_000) : "0";
}

/**
 * 运行时指标快照 → Loki push 载荷（指标即日志，单一 logfmt 行）。
 * 指标字段为**顶层** logfmt 字段（非嵌在 msg 内），Loki filter/logfmt 解析
 * 可直接按字段提取序列；六个指标族与 renderRuntimePrometheus 一一对应，
 * 另附 heapMb（浏览器堆内存，探测不到时省略字段）。
 */
export function toLokiMetricsPayload(
  snapshot: RuntimeMetricsSnapshot,
  labels: LokiLabels,
  options: { at?: Date; heapMb?: number | null } = {},
): LokiPushPayload {
  const violations =
    (snapshot.overBudget.errorRate ? 1 : 0) +
    (snapshot.overBudget.p95LatencyMs ? 1 : 0) +
    (snapshot.overBudget.p95LongTaskMs ? 1 : 0);
  const fields = [
    "level=info",
    "stage=metrics:runtime",
    `pageViews=${snapshot.pageViews}`,
    `errors=${snapshot.errors}`,
    `errorRate=${Math.round(snapshot.errorRate * 10_000) / 10_000}`,
    `navP95Ms=${snapshot.p95LatencyMs}`,
    `longTaskP95Ms=${snapshot.p95LongTaskMs}`,
    `budgetViolations=${violations}`,
  ];
  if (typeof options.heapMb === "number" && Number.isFinite(options.heapMb)) {
    fields.push(`heapMb=${options.heapMb}`);
  }
  const at = options.at ?? new Date();
  return {
    streams: [{ stream: labels, values: [[msToNanoseconds(at.getTime()), fields.join(" ")]] }],
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
