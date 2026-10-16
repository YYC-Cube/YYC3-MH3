/**
 * file: src/views/OpsMonitorView/index.tsx
 * description: YYC³ 功能视图 — OpsMonitorView（系统运维与算力监控容器 · 状态装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.1.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[container],[ops],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 入口容器 —— props/状态装配与布局编排，
 *        大块 JSX 下沉至 ./parts（头栏 / 监控曲线 / 服务表 / 告警自愈 / 工具箱 / 日志流），
 *        状态由 ./useOpsMonitorView 收敛（时段 / 告警自愈 / 夜间模式 / 工具执行 / 滚动）。
 *
 * dependencies: react, ../../types, ./useOpsMonitorView, ./parts/*
 * exports: OpsMonitorViewProps, OpsMonitorView
 */
import React from "react";
import {
  AlarmItem,
  LogEntry,
  NavigateExtra,
  NavTabId,
  OpsMetric,
  ServiceStatus,
} from "../../types";
import { useOpsMonitorView } from "./useOpsMonitorView";
import { AlarmsPanel } from "./parts/AlarmsPanel";
import { LogStream } from "./parts/LogStream";
import { MetricsCurves } from "./parts/MetricsCurves";
import { OpsHeader } from "./parts/OpsHeader";
import { OpsToolbox } from "./parts/OpsToolbox";
import { ServicesTable } from "./parts/ServicesTable";

export interface OpsMonitorViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  metrics: OpsMetric[];
  services: ServiceStatus[];
  logs: LogEntry[];
  initialAlarms: AlarmItem[];
  /** 告警处置写路径（TelemetryPort.resolveAlarm，06 契约 §2 #5） */
  resolveAlarm: (id: string) => Promise<AlarmItem | null>;
}

export const OpsMonitorView: React.FC<OpsMonitorViewProps> = ({
  onShowToast,
  metrics,
  services,
  logs,
  initialAlarms,
  resolveAlarm,
}) => {
  const {
    timeRange,
    setTimeRange,
    alarms,
    isNightShiftMode,
    toggleNightShiftMode,
    isLogStreaming,
    toggleLogStreaming,
    activeToolRunning,
    handleFixAlarm,
    handleRunTool,
  } = useOpsMonitorView({ initialAlarms, resolveAlarm, onShowToast });

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 space-y-6 transition-colors duration-300 ${
        isNightShiftMode ? "bg-[#040c17]" : "bg-[#0a1628]"
      }`}
    >
      {/* Top Header & 7x24 Duty Mode Toggle (Requirement 2.2) */}
      <OpsHeader
        isNightShiftMode={isNightShiftMode}
        onToggleNightShiftMode={toggleNightShiftMode}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onShowToast={onShowToast}
      />

      {/* 4 Live Curves with Gradient Area Charts & Peak Markers (Requirement 2.2) */}
      <MetricsCurves metrics={metrics} />

      {/* Row 2: Service Watchdog Status Table with 7-Day Stability Micro-Bars (Requirement 2.2) */}
      <ServicesTable services={services} onShowToast={onShowToast} />

      {/* Row 3: Live Alarms Carousel & Complete Ops Toolbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AlarmsPanel alarms={alarms} onFixAlarm={handleFixAlarm} />
        <OpsToolbox activeToolRunning={activeToolRunning} onRunTool={handleRunTool} />
      </div>

      {/* Row 4: Terminal Log Stream for Big Screen Ops Duty (Requirement 2.2) */}
      <LogStream
        logs={logs}
        isLogStreaming={isLogStreaming}
        onToggleLogStreaming={toggleLogStreaming}
        onShowToast={onShowToast}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
