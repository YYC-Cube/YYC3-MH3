/**
 * file: src/views/OpsMonitorView/parts/OpsHeader.tsx
 * description: YYC³ 功能视图 — OpsMonitorView 顶部标题与值守/时段控制区
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[ops],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 顶部头栏（标题徽标 / 夜间低蓝光值守模式 / 时段切换 / 刷新），
 *        逐字搬移自原 OpsMonitorView.tsx（Requirement 2.2）。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: OpsHeaderProps, OpsHeader
 */
import { Moon, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";

export interface OpsHeaderProps {
  isNightShiftMode: boolean;
  onToggleNightShiftMode: () => void;
  timeRange: "1h" | "6h" | "24h" | "7d";
  onTimeRangeChange: (range: "1h" | "6h" | "24h" | "7d") => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const OpsHeader: React.FC<OpsHeaderProps> = ({
  isNightShiftMode,
  onToggleNightShiftMode,
  timeRange,
  onTimeRangeChange,
  onShowToast,
}) => {
  return (
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
          onClick={onToggleNightShiftMode}
        >
          {isNightShiftMode ? "标准模式" : "夜间低蓝光值守模式"}
        </Button>

        <div className="flex rounded-lg bg-[#15294a] p-0.5 border border-[#1e2f47] text-xs">
          {(["1h", "6h", "24h", "7d"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTimeRangeChange(t)}
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
