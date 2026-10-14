/**
 * file: src/app/useOpsTelemetry.ts
 * description: YYC³ 应用层 — 遥测数据 Hook（四事件表状态 + 组合根端口消费）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [app],[hook],[telemetry]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测 Hook — 同步快照引导（零闪烁）+ 挂载后经 TelemetryPort 端口水合
 *        + resolveAlarm 处置写路径透传（06 契约 §2 #5）
 *
 * dependencies: react, ../data/ops, ./composition, ../types
 * exports: useOpsTelemetry
 */
import { useEffect, useMemo, useState } from "react"
import { INITIAL_LOGS, OPS_METRICS, SERVICES_LIST, SYSTEM_ALARMS } from "../data/ops"
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../types"
import { createPorts } from "./composition"

/**
 * 遥测域状态（服务 / 指标 / 告警 / 日志四事件表）：
 *
 * - 引导：同步自演示快照初始化（memory 适配器同源，零空态闪烁）；
 *   Registry BFF 落地后本引导天然回退（05 Runbook §7）。
 * - 水合：挂载后经组合根装配的 TelemetryPort 端口异步取数并收敛状态 —
 *   UI 展示端口返回的真实数据（05 §7 里程碑），memory 下内容与快照一致。
 * - 竞态防护：卸载取消（cancelled 旗标），StrictMode 双挂载幂等。
 */
export function useOpsTelemetry() {
  const telemetry = useMemo(() => createPorts().telemetry, [])

  const [services, setServices] = useState<ServiceStatus[]>(SERVICES_LIST)
  const [metrics, setMetrics] = useState<OpsMetric[]>(OPS_METRICS)
  const [alarms, setAlarms] = useState<AlarmItem[]>(SYSTEM_ALARMS)
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      telemetry.listServices(),
      telemetry.listMetrics(),
      telemetry.listAlarms(),
      telemetry.listLogs(),
    ]).then(([s, m, a, l]) => {
      if (cancelled) return
      setServices(s)
      setMetrics(m)
      setAlarms(a)
      setLogs(l)
    })
    return () => {
      cancelled = true
    }
  }, [telemetry])

  return {
    services,
    metrics,
    alarms,
    logs,
    /** 告警处置写路径（TelemetryPort.resolveAlarm，06 契约 §2 #5） */
    resolveAlarm: (id: string) => telemetry.resolveAlarm(id),
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
