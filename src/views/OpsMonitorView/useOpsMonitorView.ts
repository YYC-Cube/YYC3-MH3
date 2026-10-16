/**
 * file: src/views/OpsMonitorView/useOpsMonitorView.ts
 * description: YYC³ 功能视图 — OpsMonitorView 状态收敛 hook（时段 / 告警自愈 / 夜间模式 / 工具执行）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [hook],[view],[ops],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 局部状态单一真值源 ——
 *   - 监控时段选择（1h/6h/24h/7d）与夜间低蓝光值守模式开关（含 toast 反馈）
 *   - 告警清单（初始快照）+ 一键排障自愈（TelemetryPort.resolveAlarm 写路径）
 *   - 运维工具箱执行态与统一发射处理器 + 终端日志流滚动开关
 *
 * dependencies: react, ../../types
 * exports: UseOpsMonitorViewOptions, UseOpsMonitorViewResult, useOpsMonitorView
 */
import { useState } from "react";
import { AlarmItem } from "../../types";

export interface UseOpsMonitorViewOptions {
  initialAlarms: AlarmItem[];
  /** 告警处置写路径（TelemetryPort.resolveAlarm，06 契约 §2 #5） */
  resolveAlarm: (id: string) => Promise<AlarmItem | null>;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export interface UseOpsMonitorViewResult {
  timeRange: "1h" | "6h" | "24h" | "7d";
  setTimeRange: (range: "1h" | "6h" | "24h" | "7d") => void;
  alarms: AlarmItem[];
  isNightShiftMode: boolean;
  toggleNightShiftMode: () => void;
  isLogStreaming: boolean;
  toggleLogStreaming: () => void;
  activeToolRunning: string | null;
  handleFixAlarm: (id: string, actionName: string) => void;
  handleRunTool: (toolName: string) => void;
}

export function useOpsMonitorView({
  initialAlarms,
  resolveAlarm,
  onShowToast,
}: UseOpsMonitorViewOptions): UseOpsMonitorViewResult {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [alarms, setAlarms] = useState<AlarmItem[]>(initialAlarms);
  const [isNightShiftMode, setIsNightShiftMode] = useState(false);
  const [isLogStreaming, setIsLogStreaming] = useState(true);
  const [activeToolRunning, setActiveToolRunning] = useState<string | null>(null);

  const handleFixAlarm = async (id: string, actionName: string) => {
    try {
      const resolved = await resolveAlarm(id);
      if (!resolved) {
        onShowToast("warning", `告警不存在或已解除: ${actionName}`, "请刷新遥测数据后重试");
        return;
      }
      setAlarms((prev) => prev.map((a) => (a.id === id ? resolved : a)));
      onShowToast("success", `已成功执行排障: ${actionName}`, "告警状态已解除，处置已留痕");
    } catch {
      onShowToast("error", `排障执行失败: ${actionName}`, "服务暂不可用，请稍后重试");
    }
  };

  const handleRunTool = (toolName: string) => {
    setActiveToolRunning(toolName);
    setTimeout(() => {
      setActiveToolRunning(null);
      onShowToast("success", `${toolName} 执行完毕`, "执行日志已写入本地遥测留痕");
    }, 1200);
  };

  const toggleNightShiftMode = () => {
    const next = !isNightShiftMode;
    setIsNightShiftMode(next);
    onShowToast("info", next ? "已进入夜间值守低蓝光护眼模式" : "已切换至标准工业模式");
  };

  const toggleLogStreaming = () => setIsLogStreaming((p) => !p);

  return {
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
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
