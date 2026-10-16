/**
 * file: src/domains/platform/observability/ports.ts
 * description: YYC³ 基础设施域 — 可观测端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[port],[platform],[observability]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 可观测端口 — 指标/日志发射与批量落盘（emitMetric / emitLog / flush）
 *
 * dependencies: ../../../types
 * exports: ObservabilityPort
 */
import type { LogEntry, OpsMetric } from "../../../types";

/**
 * 可观测端口（结构化指标与日志发射 + 批量刷盘）。
 *
 * 实现方：
 * - `adapters/memory`（内存缓冲，断网默认）
 * - `adapters/indexeddb`（落盘留痕，P4 落地；面板数据真实化）
 *
 * `flush` 将缓冲的指标/日志经存储端口持久化（实现方决定缓冲与批量粒度）。
 */
export interface ObservabilityPort {
  emitMetric(metric: OpsMetric): Promise<void>;
  emitLog(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
