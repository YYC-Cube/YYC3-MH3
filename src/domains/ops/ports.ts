/**
 * file: src/domains/ops/ports.ts
 * description: YYC³ 领域层 — 遥测端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[port],[ops],[telemetry]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测端口 — 对应 05 Runbook §1/§4/§5/§6 事件表（告警/服务/指标/日志）
 *
 * dependencies: ../../types
 * exports: TelemetryPort
 */
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../../types"

/**
 * 遥测端口（四事件表读 + 处置留痕写）。
 *
 * 实现方：
 * - `adapters/memory`（演示快照，断网默认）
 * - `adapters/local`（Registry API 供数，待 BFF 落地，见 05 §7）
 *
 * 语义对齐 05 Runbook：§1 AlarmItem / §4 ServiceStatus / §5 OpsMetric /
 * §6 LogEntry。`appendLog` 承接 §3.3 处置留痕（stage + suggestion）与
 * 组合根声明的降级/恢复事件留痕。NotificationItem 为运行时 UI 态
 * （通知中心读写），不属于遥测快照，不入端口。
 */
export interface TelemetryPort {
  listServices(): Promise<ServiceStatus[]>
  listMetrics(): Promise<OpsMetric[]>
  listAlarms(): Promise<AlarmItem[]>
  listLogs(): Promise<LogEntry[]>
  /** 处置/降级留痕：存储前置（最新在前），原样返回副本 */
  appendLog(entry: LogEntry): Promise<LogEntry>
  /**
   * 告警处置写路径（06 契约 §2 #5 `PATCH /alarms/:id`，置 resolved=true）：
   * 命中返回翻转后 AlarmItem 副本；未命中返回 null（业务空值，06 §2 v1.0.1，
   * 不降级不留痕）；实现内部失败降级语义见各适配器（memory 直接落账 /
   * local 失败回退 memory 兜底）。
   */
  resolveAlarm(id: string): Promise<AlarmItem | null>
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
