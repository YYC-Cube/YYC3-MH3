/**
 * file: src/adapters/observabilityBridge.ts
 * description: YYC³ 适配器层 — 可观测端口桥接实现（以遥测端口为真实落盘通道）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[observability],[port],[bridge],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0-5 可观测端口接线 — ObservabilityPort 的真实实现：
 *   - emitLog：经遥测端口 appendLog 直写（memory 内存 / IDB 落盘，随装配路径）
 *   - emitMetric：缓冲批量攒批（OPS 指标同源契约），flush 时经 appendMetrics
 *     批量写回遥测指标表（对齐 05 Runbook §5），避免逐条落盘放大 IO
 *   - 端口实现不反向依赖 app 层：sink 以结构化类型注入（组合根装配）
 *
 * dependencies: ../domains/platform/observability/ports, ../types
 * exports: ObservabilitySink, createTelemetryObservability
 */
import { ObservabilityPort } from "../domains/platform/observability/ports";
import { LogEntry, OpsMetric } from "../types";

/**
 * 可观测落盘 sink（结构化注入，与遥测端口 appendLog/appendMetrics 同型；
 * 适配器不反向依赖 app 层，组合根以真实遥测适配器装配）。
 */
export interface ObservabilitySink {
  appendLog(entry: LogEntry): Promise<LogEntry>;
  appendMetrics(items: OpsMetric[]): Promise<void>;
}

/**
 * 遥测支撑的可观测适配器：
 * - emitMetric 缓冲（batch 攒批），flush 批量写回指标表（空缓冲早退，幂等）
 * - emitLog 直写日志表（逐条留痕，失败向上抛由调用方兜底）
 * - 缓冲上限防御：超限自动触发 flush，防长会话内存无界增长
 */
export function createTelemetryObservability(sink: ObservabilitySink): ObservabilityPort {
  /** 指标缓冲上限（超限自动 flush，防无界增长） */
  const MAX_BUFFERED_METRICS = 128;
  let pendingMetrics: OpsMetric[] = [];

  /** 缓冲非空时批量写回并清空（空缓冲早退） */
  const flushMetrics = async (): Promise<void> => {
    if (pendingMetrics.length === 0) return;
    const batch = pendingMetrics;
    pendingMetrics = [];
    await sink.appendMetrics(batch);
  };

  return {
    async emitMetric(metric) {
      pendingMetrics.push(metric);
      if (pendingMetrics.length >= MAX_BUFFERED_METRICS) {
        await flushMetrics();
      }
    },
    async emitLog(entry) {
      await sink.appendLog(entry);
    },
    async flush() {
      await flushMetrics();
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
