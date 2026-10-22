/**
 * file: src/components/platform/DispatchModule/parts/GpuSlotsSection.tsx
 * description: YYC³ 平台分区 — DispatchModule 多卡分布式算力调度槽位
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[platform],[part],[dispatch],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 DispatchModule「多卡分布式算力调度槽位」逐字提取的槽位卡 JSX（零重设计）。
 *
 * dependencies: react, ../../../common, ../../../../types, lucide-react
 * exports: GpuSlotsSectionProps, GpuSlotsSection
 */
import { Cpu } from "lucide-react";
import React from "react";
import type { ShowToast } from "../../../../types";
import { Badge, Button, Card } from "../../../common";

/** 多卡算力槽位展示元数据（与 GpuSlot 契约互补的展示字段：配色/状态文案/功耗） */
const GPU_SLOT_RENDER_META = [
  {
    device: "CUDA:0 (RTX 4090)",
    accent: "text-[#00e0b8]",
    barColor: "bg-[#00e0b8]",
    variant: "brand" as const,
    statusLabel: "渲染中",
    power: "340W",
    job: "BATCH-089 (金融早报)",
    usedGb: 19.4,
    totalGb: 24.0,
    utilization: 91,
    temperature: 68,
    shimmer: true,
  },
  {
    device: "CUDA:1 (RTX 4090)",
    accent: "text-[#00b4d8]",
    barColor: "bg-[#00b4d8]",
    variant: "info" as const,
    statusLabel: "长镜头",
    power: "280W",
    job: "BATCH-088 (CEO演说)",
    usedGb: 14.2,
    totalGb: 24.0,
    utilization: 62,
    temperature: 62,
    shimmer: true,
  },
  {
    device: "CUDA:2 (RTX 4080)",
    accent: "text-[#9d7cd8]",
    barColor: "bg-[#9d7cd8]",
    variant: "purple" as const,
    statusLabel: "转码待命",
    power: "190W",
    job: "超分与背景转码池",
    usedGb: 6.8,
    totalGb: 16.0,
    utilization: 45,
    temperature: 54,
    shimmer: false,
  },
];

export interface GpuSlotsSectionProps {
  onShowToast: ShowToast;
}

export const GpuSlotsSection: React.FC<GpuSlotsSectionProps> = ({ onShowToast }) => {
  return (
    <Card
      title="多卡分布式算力调度槽位 (Multi-GPU Distributed Slots)"
      subtitle="支持 CUDA:0 / CUDA:1 / CUDA:2 多卡并行调度与动态抢占 · 显存实时分级管控"
      action={
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="xs">
            3 卡在线负载均衡
          </Badge>
          <Button variant="secondary" size="xs" onClick={() => onShowToast("info", "多卡并行负载已自动再平衡")}>
            算力动态再平衡
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {GPU_SLOT_RENDER_META.map((slot) => (
          <div
            key={slot.device}
            className={`p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2${slot.shimmer ? " card-running-shimmer" : ""}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-bold text-[#e8f0f8]">
                <Cpu className={`w-4 h-4 ${slot.accent}`} />
                <span>{slot.device}</span>
              </div>
              <Badge variant={slot.variant} size="xs">
                {slot.utilization}% {slot.statusLabel}
              </Badge>
            </div>
            <div className="space-y-1 text-[11px] text-[#8a97a8]">
              <div className="flex justify-between">
                <span>显存使用:</span>
                <span className={`${slot.accent} font-bold`}>
                  {slot.usedGb.toFixed(1)} / {slot.totalGb.toFixed(1)} GB
                </span>
              </div>
              <div className="w-full bg-[#0a1628] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${slot.barColor} h-full`}
                  style={{ width: `${(slot.usedGb / slot.totalGb) * 100}%` }}
                />
              </div>
              <div className="flex justify-between pt-1">
                <span>绑定作业:</span>
                <span className="text-[#e8f0f8] font-sans">{slot.job}</span>
              </div>
              <div className="flex justify-between">
                <span>温度/功耗:</span>
                <span className="text-[#e8f0f8]">
                  {slot.temperature}°C · {slot.power}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
