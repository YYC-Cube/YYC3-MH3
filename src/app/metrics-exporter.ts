/**
 * file: src/app/metrics-exporter.ts
 * description: YYC³ 应用层 — 运行时指标定时导出调度器（探针窗口 → Loki 周期 push）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[metrics],[exporter],[loki],[scheduler],[observability],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 第七批 ② — 运行时指标定时导出（观测缺口收尾）：
 *   - 调度核心 startMetricsExporter：周期快照 → toLokiMetricsPayload → push，
 *     快照/推送全部可注入（vitest 假时钟 + 测试替身），单次失败静默不级联
 *   - 配置 readMetricsExportConfig：环境变量显式启用（默认关 = 零公网不变）：
 *       NEXT_PUBLIC_LOKI_ENDPOINT（必须回环，createLokiSink 构造期二次守卫）
 *       NEXT_PUBLIC_METRICS_EXPORT_MS（间隔，5s–1h 钳制，默认 60s）
 *   - 默认接线 startRuntimeMetricsExport：PerfSink 挂载时调用，浏览器堆内存
 *     随行（performance.memory 探测不到则字段省略）；非回环端点构造期抛错
 *     → 拒绝启用（零公网守卫双保险）
 *
 * dependencies: ../adapters/lokiSink, ../domains/platform/observability/export,
 *               ../domains/platform/observability/metrics, ./runtimeMetrics
 * exports: MetricsExportConfig, readMetricsExportConfig, startMetricsExporter, startRuntimeMetricsExport
 */
import { createLokiSink, LokiPushResult } from "../adapters/lokiSink";
import { toLokiMetricsPayload } from "../domains/platform/observability/export";
import type { LokiLabels, LokiPushPayload } from "../domains/platform/observability/export";
import type { RuntimeMetricsSnapshot } from "../domains/platform/observability/metrics";
import { snapshotRuntimeMetrics } from "./runtimeMetrics";

/** 导出配置（enabled 语义：端点存在即启用，零公网由回环守卫兜底） */
export interface MetricsExportConfig {
  enabled: boolean;
  /** Loki push 端点（回环；disabled 时为 null） */
  endpoint: string | null;
  /** 导出间隔（ms，钳制 5s–1h） */
  intervalMs: number;
}

/** 导出间隔默认值（60s：Loki 单行/分钟，观测粒度与 soak 采样对齐） */
export const METRICS_EXPORT_INTERVAL_MS = 60_000;
const MIN_INTERVAL_MS = 5_000;
const MAX_INTERVAL_MS = 3_600_000;

/** 非标准 performance.memory 结构（Chromium 私有，结构化窄化） */
interface PerfMemory {
  usedJSHeapSize: number;
}

/** 读浏览器堆内存（MB，一位小数）；无 performance.memory 返回 null */
function readHeapMb(): number | null {
  if (typeof performance === "undefined") return null;
  const mem = (performance as Performance & { memory?: PerfMemory }).memory;
  if (!mem || typeof mem.usedJSHeapSize !== "number") return null;
  return Math.round((mem.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
}

/**
 * 读定时导出配置（纯函数，env 可注入测试）：
 * - 端点缺省/空串 → disabled（默认关，零公网）
 * - 间隔非法/越界 → 钳制到 [5s, 1h]，默认 60s
 */
export function readMetricsExportConfig(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): MetricsExportConfig {
  const endpoint = env.NEXT_PUBLIC_LOKI_ENDPOINT?.trim() || null;
  const raw = Number(env.NEXT_PUBLIC_METRICS_EXPORT_MS);
  const intervalMs = Number.isFinite(raw) && raw > 0 ? raw : METRICS_EXPORT_INTERVAL_MS;
  return {
    enabled: endpoint !== null,
    endpoint,
    intervalMs: Math.min(Math.max(intervalMs, MIN_INTERVAL_MS), MAX_INTERVAL_MS),
  };
}

/**
 * 启动定时导出（返回停止函数；disabled 时为 no-op stop）：
 * 每 intervalMs 快照一次 → 指标 logfmt 行 → push。快照抛错/推送拒绝均
 * 静默吞（采集通道自身失败不引发二次错误，与 perf-sink 同口径）。
 */
export function startMetricsExporter(options: {
  config: MetricsExportConfig;
  labels: LokiLabels;
  /** Loki push 通道（pushPayload 载荷语义） */
  push: (payload: LokiPushPayload) => Promise<LokiPushResult>;
  /** 指标快照（默认运行时窗口单例） */
  snapshot?: () => RuntimeMetricsSnapshot;
  /** 堆内存读数（MB；默认 performance.memory 探测） */
  readHeapMb?: () => number | null;
  /** 时间源（默认 new Date；测试注入固定时点） */
  now?: () => Date;
}): () => void {
  const { config, labels, push } = options;
  if (!config.enabled || config.endpoint === null) return () => {};
  const snapshot = options.snapshot ?? snapshotRuntimeMetrics;
  const readHeap = options.readHeapMb ?? readHeapMb;
  const now = options.now ?? (() => new Date());

  const timer = setInterval(() => {
    try {
      const payload = toLokiMetricsPayload(snapshot(), labels, { at: now(), heapMb: readHeap() });
      void push(payload).catch(() => {
        /* 推送失败静默：下一个周期重试，不级联 */
      });
    } catch {
      /* 快照失败静默（jsdom/异常窗口），不中断调度 */
    }
  }, config.intervalMs);

  return () => clearInterval(timer);
}

/** 指标流标签（与 soak/check-obs 的 app 标识同源） */
const EXPORT_LABELS: LokiLabels = { app: "yyc3-mh3", source: "metrics-exporter" };

/**
 * 默认接线（PerfSink 挂载时调用）：读环境配置 → 启用则装配回环 Loki sink
 * 并启动调度。非回环端点在 createLokiSink 构造期抛错 → 此处捕获拒绝启用
 * （零公网守卫双保险：配置校验 + sink 构造校验）。
 */
export function startRuntimeMetricsExport(): () => void {
  const config = readMetricsExportConfig();
  if (!config.enabled || config.endpoint === null) return () => {};
  let sink: ReturnType<typeof createLokiSink>;
  try {
    sink = createLokiSink({ enabled: true, endpoint: config.endpoint, labels: EXPORT_LABELS });
  } catch {
    /* 非回环端点：构造期拒绝（零公网守卫），本次会话不导出 */
    return () => {};
  }
  return startMetricsExporter({
    config,
    labels: EXPORT_LABELS,
    push: (payload) => sink.pushPayload(payload),
  });
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
