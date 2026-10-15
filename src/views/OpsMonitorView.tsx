/**
 * file: src/views/OpsMonitorView.tsx
 * description: YYC³ 功能视图 — OpsMonitorView
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-11
 * updated: 2026-10-12
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — OpsMonitorView
 *
 * dependencies: react, ../types, ../components/common, lucide-react
 * exports: OpsMonitorViewProps, OpsMonitorView
 */
import {
  Activity,
  Download,
  HardDrive,
  Moon,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Badge, Button, Card } from "../components/common";
import { AlarmItem, LogEntry, NavigateExtra, NavTabId, OpsMetric, ServiceStatus } from "../types";

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
      onShowToast("success", `${toolName} 执行完毕`, "执行日志已沉淀至本地 WAL 审计");
    }, 1200);
  };

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 space-y-6 transition-colors duration-300 ${
        isNightShiftMode ? "bg-[#040c17]" : "bg-[#0a1628]"
      }`}
    >
      {/* Top Header & 7x24 Duty Mode Toggle (Requirement 2.2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#e8f0f8]">系统运维与算力监控 · Ops Monitor</h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono shadow-[0_0_8px_rgba(0,224,184,0.2)]">
              7×24H 智能守望值守
            </span>
          </div>
          <p className="text-xs text-[#8a97a8] mt-1">
            全链路监控本地 CUDA 显存、常驻进程探活、看门狗自愈与低蓝光大屏展示
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2.5">
          <Button
            variant={isNightShiftMode ? "primary" : "secondary"}
            size="sm"
            icon={<Moon className="w-3.5 h-3.5" />}
            onClick={() => {
              setIsNightShiftMode((p) => !p);
              onShowToast(
                "info",
                isNightShiftMode ? "已切换至标准工业模式" : "已进入夜间值守低蓝光护眼模式",
              );
            }}
          >
            {isNightShiftMode ? "标准模式" : "夜间低蓝光值守模式"}
          </Button>

          <div className="flex rounded-lg bg-[#15294a] p-0.5 border border-[#1e2f47] text-xs">
            {(["1h", "6h", "24h", "7d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  timeRange === t ? "bg-[#00e0b8] text-[#0a1628] font-bold" : "text-[#8a97a8]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("info", "监控指标已刷新")}
          >
            刷新
          </Button>
        </div>
      </div>

      {/* 4 Live Curves with Gradient Area Charts & Peak Markers (Requirement 2.2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPU VRAM Curve */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 card-running-shimmer">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8a97a8]">GPU 显存占用 (VRAM)</span>
            <span className="font-mono text-[#00e0b8] font-bold">19.4 / 24G</span>
          </div>
          <div className="h-20 w-full flex items-end gap-1.5 pt-2">
            {metrics.map((m, idx) => {
              const isPeak = m.gpuVram > 22;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {isPeak && (
                    <span className="absolute -top-3 text-[9px] font-mono text-[#ff7a45] font-bold animate-bounce">
                      22.8G
                    </span>
                  )}
                  <div
                    className={`w-full rounded-t transition-all ${
                      isPeak ? "bg-[#ff7a45] shadow-[0_0_8px_rgba(255,122,69,0.8)]" : "bg-[#00e0b8]"
                    }`}
                    style={{ height: `${(m.gpuVram / 24) * 100}%` }}
                  />
                  <span className="text-[9px] font-mono text-[#8b949e]">{m.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GPU Compute Core Curve */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 card-running-shimmer">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8a97a8]">GPU 核心利用率</span>
            <span className="font-mono text-[#00b4d8] font-bold">91% (峰值 98%)</span>
          </div>
          <div className="h-20 w-full flex items-end gap-1.5 pt-2">
            {metrics.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-[#00b4d8] rounded-t transition-all"
                  style={{ height: `${m.gpuUtil}%` }}
                />
                <span className="text-[9px] font-mono text-[#8b949e]">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CPU Memory Curve */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 card-running-shimmer">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8a97a8]">系统内存 (DDR5)</span>
            <span className="font-mono text-[#9d7cd8] font-bold">26.2 GB</span>
          </div>
          <div className="h-20 w-full flex items-end gap-1.5 pt-2">
            {metrics.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-[#9d7cd8] rounded-t transition-all"
                  style={{ height: `${(m.memUtil / 64) * 100}%` }}
                />
                <span className="text-[9px] font-mono text-[#8b949e]">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disk IOPS Curve */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 card-running-shimmer">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8a97a8]">NVMe 磁盘吞吐 (IOPS)</span>
            <span className="font-mono text-[#e8f0f8] font-bold">420 MB/s · 68°C</span>
          </div>
          <div className="h-20 w-full flex items-end gap-1.5 pt-2">
            {metrics.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-[#1e2f47] rounded-t transition-all group-hover:bg-[#00e0b8]"
                  style={{ height: `${(m.diskIops / 600) * 100}%` }}
                />
                <span className="text-[9px] font-mono text-[#8b949e]">{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Service Watchdog Status Table with 7-Day Stability Micro-Bars (Requirement 2.2) */}
      <Card
        title="本地微服务看门狗监控 (Services Watchdog)"
        subtitle="TelemetryPort 本地遥测聚合 · memory 演示快照供数"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
                <th className="py-2.5 px-3">服务名称 / Service ID</th>
                <th className="py-2.5 px-3">端口</th>
                <th className="py-2.5 px-3">运行状态</th>
                <th className="py-2.5 px-3">近7天稳定性柱图 (缺柱即异常)</th>
                <th className="py-2.5 px-3">正常运行时间</th>
                <th className="py-2.5 px-3">进程 PIDs</th>
                <th className="py-2.5 px-3">内存占用</th>
                <th className="py-2.5 px-3 text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2f47]/50">
              {services.map((srv, idx) => (
                <tr key={srv.serviceId} className="hover:bg-[#15294a]/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#e8f0f8]">{srv.name}</div>
                    <div className="font-mono text-[10px] text-[#8a97a8]">{srv.serviceId}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#00b4d8]">:{srv.port}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="brand" size="xs" pulse>
                      在线运行中
                    </Badge>
                  </td>
                  {/* Micro Pillar Bar Chart (Requirement 2.2) */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-end gap-1 h-4 w-28" title="近7天运行稳定性">
                      {[100, 100, idx === 1 ? 75 : 100, 100, 100, 100, 100].map((val, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-xs transition-all ${
                            val === 100 ? "bg-[#00e0b8]" : "bg-[#ff7a45]"
                          }`}
                          style={{ height: `${val}%` }}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#8a97a8] font-mono">{srv.uptime}</td>
                  <td className="py-2.5 px-3 text-[#8a97a8] font-mono">{srv.pids}</td>
                  <td className="py-2.5 px-3 font-mono text-[#e8f0f8]">{srv.memory}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onShowToast("info", `已触发服务平滑重载: ${srv.name}`)}
                    >
                      平滑重载
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 3: Live Alarms Carousel & Complete Ops Toolbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alarms list with 1-click self healing */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ff7a45]" />
              <span className="text-xs font-semibold text-[#e8f0f8]">
                实时告警与自愈中心 (Incidents)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8a97a8]">
              未解除告警: {alarms.filter((a) => !a.resolved).length}
            </span>
          </div>

          <div className="space-y-2.5">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  alarm.resolved
                    ? "bg-[#15294a]/30 border-[#1e2f47] opacity-50"
                    : "bg-[#15294a] border-[#ff7a45] shadow-[0_0_16px_rgba(255,122,69,0.25)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={alarm.level === "critical" ? "danger" : "warning"} size="xs">
                      {alarm.resolved ? "已自愈解决" : alarm.level.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-[#e8f0f8]">{alarm.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8a97a8]">{alarm.timestamp}</span>
                </div>

                <p className="text-[#8a97a8] leading-relaxed mb-2">{alarm.description}</p>

                <div className="pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#00e0b8]">
                    排障建议：{alarm.recommendation}
                  </span>
                  {!alarm.resolved && alarm.actionLabel && (
                    <Button
                      variant="danger"
                      size="xs"
                      icon={<Wrench className="w-3 h-3" />}
                      onClick={() => handleFixAlarm(alarm.id, alarm.actionLabel!)}
                    >
                      {alarm.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Ops Toolbox with circular progress simulation (Requirement 2.2) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-[#1e2f47] mb-3">
              <Wrench className="w-4 h-4 text-[#00e0b8]" />
              <span className="font-semibold text-[#e8f0f8]">运维工具箱全功能集 (Ops Toolbox)</span>
            </div>

            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                icon={<Trash2 className="w-3.5 h-3.5 text-[#ff7a45]" />}
                loading={activeToolRunning === "cache"}
                onClick={() => handleRunTool("cache")}
              >
                一键清理 24h 前临时切片缓存 (释放98GB)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                icon={<Zap className="w-3.5 h-3.5 text-[#00e0b8]" />}
                loading={activeToolRunning === "defrag"}
                onClick={() => handleRunTool("defrag")}
              >
                一键显存碎片整理 (VRAM Defrag)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                icon={<Activity className="w-3.5 h-3.5 text-[#00b4d8]" />}
                loading={activeToolRunning === "env"}
                onClick={() => handleRunTool("env")}
              >
                一键环境健康体检
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                icon={<HardDrive className="w-3.5 h-3.5 text-[#9d7cd8]" />}
                loading={activeToolRunning === "backup"}
                onClick={() => handleRunTool("backup")}
              >
                导出系统快照与配置备份
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a1628] border border-[#1e2f47] text-[11px] text-[#8a97a8] space-y-1">
            <span className="text-[#00e0b8] font-semibold">本地优先保障</span>
            <p>所有日志与监控数据均保留在本地 IndexedDB 与 WAL 磁盘目录，不发起任何外网回传。</p>
          </div>
        </div>
      </div>

      {/* Row 4: Terminal Log Stream for Big Screen Ops Duty (Requirement 2.2) */}
      <Card
        title="值守大屏实时终端日志流 (Live Terminal Stream)"
        subtitle="按时间升序流式刷新 · 错误标红高亮"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              icon={isLogStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              onClick={() => setIsLogStreaming((p) => !p)}
            >
              {isLogStreaming ? "暂停滚动" : "继续滚动"}
            </Button>
            <Button
              variant="secondary"
              size="xs"
              icon={<Download className="w-3 h-3" />}
              onClick={() => onShowToast("success", "全量运维日志已导出")}
            >
              导出日志
            </Button>
          </div>
        }
      >
        <div className="p-3 rounded-xl bg-[#071222] border border-[#1e2f47] font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 leading-relaxed">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-2 text-[11px]">
              <span className="text-[#8b949e]">{log.timestamp}</span>
              <span
                className={`px-1 rounded text-[10px] uppercase font-bold ${
                  log.level === "error"
                    ? "bg-[#ff7a45]/20 text-[#ff7a45]"
                    : log.level === "warn"
                      ? "bg-[#ffb830]/20 text-[#ffb830]"
                      : "bg-[#00e0b8]/20 text-[#00e0b8]"
                }`}
              >
                {log.level}
              </span>
              <span className="text-[#8a97a8]">[{log.stage}]</span>
              <span className={log.level === "error" ? "text-[#ff7a45]" : "text-[#e8f0f8]"}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
