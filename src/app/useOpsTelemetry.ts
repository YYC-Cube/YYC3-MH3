/**
 * file: src/app/useOpsTelemetry.ts
 * description: YYC³ 应用层 — 遥测数据 Hook（四事件表状态 + 组合根端口消费 + 持久化留痕）
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [app],[hook],[telemetry]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测 Hook — 同步快照引导（零闪烁）+ 挂载后经 TelemetryPort 端口水合
 *        （P4-2：IDB 模式下整体替换为落盘真值，处置/留痕跨刷新存活）
 *        + resolveAlarm 处置写路径透传（06 契约 §2 #5）；端口失败不阻塞 UI，
 *        console.warn + reportClientError 同级留痕
 *
 * dependencies: react, ../adapters/memory/fixtures/ops, ./composition, ./error-sink, ../types
 * exports: useOpsTelemetry
 */
import { useEffect, useMemo, useState } from "react";
import {
  INITIAL_LOGS,
  OPS_METRICS,
  SERVICES_LIST,
  SYSTEM_ALARMS,
} from "../adapters/memory/fixtures/ops";
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../types";
import { getPorts } from "./composition";
import { reportClientError } from "./error-sink";

/** 端口读写失败留痕：不阻塞 UI —— console.warn + 客户端错误 sink 同级留痕 */
function tracePortFailure(scope: string, err: unknown): void {
  console.warn(`[useOpsTelemetry] 端口操作失败（${scope}），保留内存态继续运行`, err);
  reportClientError(
    `遥测端口操作失败（${scope}）：${err instanceof Error ? err.message : String(err)}`,
    "本地持久化通道异常，演示数据仍可交互",
  );
}

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
  // P2：组合根单例 —— 降级状态机与留痕日志全局一份
  const telemetry = useMemo(() => getPorts().telemetry, []);

  // 夹具顶层冻结：拷贝出可变副本引导（防就地污染，StrictMode 双挂载安全）
  const [services, setServices] = useState<ServiceStatus[]>(() =>
    SERVICES_LIST.map((s) => ({ ...s })),
  );
  const [metrics, setMetrics] = useState<OpsMetric[]>(() => OPS_METRICS.map((m) => ({ ...m })));
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => SYSTEM_ALARMS.map((a) => ({ ...a })));
  const [logs, setLogs] = useState<LogEntry[]>(() => INITIAL_LOGS.map((l) => ({ ...l })));

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      telemetry.listServices(),
      telemetry.listMetrics(),
      telemetry.listAlarms(),
      telemetry.listLogs(),
    ])
      .then(([s, m, a, l]) => {
        if (cancelled) return;
        setServices(s);
        setMetrics(m);
        setAlarms(a);
        setLogs(l);
      })
      .catch((err: unknown) => tracePortFailure("数据水合", err));
    return () => {
      cancelled = true;
    };
  }, [telemetry]);

  return {
    services,
    metrics,
    alarms,
    logs,
    /** 告警处置写路径（TelemetryPort.resolveAlarm，06 契约 §2 #5） */
    resolveAlarm: (id: string) => telemetry.resolveAlarm(id),
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
