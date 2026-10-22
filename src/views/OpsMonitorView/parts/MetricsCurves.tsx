/**
 * file: src/views/OpsMonitorView/parts/MetricsCurves.tsx
 * description: YYC³ 功能视图 — OpsMonitorView 四条实时监控曲线（VRAM/核心/内存/磁盘）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[ops],[metrics],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 第一行四条实时柱状曲线（GPU 显存/GPU 核心/系统内存/NVMe 吞吐），
 *        含峰值标记，逐字搬移自原 OpsMonitorView.tsx（Requirement 2.2）。
 *
 * dependencies: react, ../../../types
 * exports: MetricsCurvesProps, MetricsCurves
 */
import React from "react";
import { OpsMetric } from "../../../types";

export interface MetricsCurvesProps {
  metrics: OpsMetric[];
}

export const MetricsCurves: React.FC<MetricsCurvesProps> = ({ metrics }) => {
  return (
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
              <div className="w-full bg-[#00b4d8] rounded-t transition-all" style={{ height: `${m.gpuUtil}%` }} />
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
