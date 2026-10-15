/**
 * file: src/app/ops-monitor/page.tsx
 * description: 系统运维监控路由页（ops · Watchdog）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[ops-monitor]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "ops" → 路由 "/ops-monitor"；
 *        遥测四事件表 + 告警处置写路径经 OpsTelemetry Context 装配（视图零改动）
 *
 * dependencies: @/views/OpsMonitorView, ../contexts, ../navigation
 * exports: default (Page)
 */
"use client";

import { OpsMonitorView } from "@/views/OpsMonitorView";
import { useOpsTelemetryContext, useToastContext } from "../contexts";
import { useAppNavigate } from "../navigation";

export default function Page() {
  const { showToast } = useToastContext();
  const navigate = useAppNavigate();
  const { services, metrics, alarms, logs, resolveAlarm } = useOpsTelemetryContext();

  return (
    <OpsMonitorView
      onNavigate={navigate}
      onShowToast={showToast}
      metrics={metrics}
      services={services}
      logs={logs}
      initialAlarms={alarms}
      resolveAlarm={resolveAlarm}
    />
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
