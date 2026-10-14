/**
 * file: src/adapters/local/telemetryRepository.ts
 * description: YYC³ 适配器层 — 遥测 local 实现（Registry API 供数，失败降级 memory + 留痕）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[local],[telemetry]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测 local 适配器 — 三读+处置写经 BFF（services/metrics/alarms/PATCH），
 *        日志走本地留痕通道（06 §4 v1.0.1）
 *
 * dependencies: ../../types, ../../domains/ops/ports, ../memory/telemetryRepository, ./http
 * exports: LocalTelemetryOptions, createLocalTelemetry
 */
import { TelemetryPort } from "../../domains/ops/ports"
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../../types"
import { createMemoryTelemetry } from "../memory/telemetryRepository"
import {
  createResilientGateway,
  makeTraceEntry,
  RegistryError,
  type LocalAdapterOptions,
} from "./http"

export interface LocalTelemetryOptions extends LocalAdapterOptions {
  /** 降级回退与留痕通道（缺省自建；组合根可注入共享实例） */
  memory?: TelemetryPort
}

/**
 * Registry API 版遥测适配器（06 契约 §2 #2/#3/#4/#5 供数 + §4 降级）：
 *
 * - listServices / listMetrics / listAlarms：per-call fetch，失败回退 memory 同型方法
 * - resolveAlarm：PATCH /alarms/:id（06 §2 #5），404 → null（业务空值，
 *   不降级不留痕）；其余失败回退 memory.resolveAlarm 兜底落账
 * - listLogs / appendLog：本地留痕通道（内存可变日志表），保证降级/恢复与
 *   处置条目强一致可见；`GET /logs` 端点保留给真实采集阶段（06 §4 v1.0.1）
 * - 降级/恢复事件经 memory.appendLog 留痕（Runbook §3.3），状态翻转口径
 */
export function createLocalTelemetry(options: LocalTelemetryOptions = {}): TelemetryPort {
  const memory = options.memory ?? createMemoryTelemetry()
  const gateway = createResilientGateway(options, (t) => {
    void memory.appendLog(makeTraceEntry("遥测聚合", t.degraded, t.detail))
  })

  return {
    listServices: () =>
      gateway<ServiceStatus[]>("/services").catch(() => memory.listServices()),
    listMetrics: () =>
      gateway<OpsMetric[]>("/metrics").catch(() => memory.listMetrics()),
    listAlarms: () =>
      gateway<AlarmItem[]>("/alarms").catch(() => memory.listAlarms()),
    resolveAlarm: (id: string) =>
      gateway<AlarmItem>(`/alarms/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      }).catch((err: unknown) => {
        if (err instanceof RegistryError && err.kind === "not_found") return null
        return memory.resolveAlarm(id)
      }),
    listLogs: () => memory.listLogs(),
    appendLog: (entry: LogEntry) => memory.appendLog(entry),
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
