/**
 * file: src/views/DashboardView/parts/HardwareGauges.tsx
 * description: YYC³ 功能视图 — DashboardView 本地硬件算力负载实时计量条
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[dashboard],[hardware],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 第二行右列（lg:col-span-4）本地硬件负载仪表（GPU/显存/内存），
 *        含全屏监控大图触发，逐字搬移自原 DashboardView.tsx（Row 2）。
 *
 * dependencies: react, ../../../types
 * exports: HardwareGaugesProps, HardwareGauges
 */
import React from "react";
import { NavigateExtra, NavTabId } from "../../../types";

export interface HardwareGaugesProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onOpenModal: () => void;
}

export const HardwareGauges: React.FC<HardwareGaugesProps> = ({ onNavigate, onOpenModal }) => {
  return (
    <div className="lg:col-span-4 p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#e8f0f8]">本地硬件算力负载</h2>
        <button
          onClick={onOpenModal}
          className="text-[11px] text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer"
        >
          全屏监控大图 →
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
        <div>
          <div className="flex justify-between text-[#8a97a8] mb-1">
            <span>GPU 核心利用率 (RTX 4090)</span>
            <span className="font-mono text-[#00e0b8] font-bold">91%</span>
          </div>
          <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00e0b8] h-full shadow-[0_0_8px_rgba(0,224,184,0.6)]"
              style={{ width: "91%" }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#8a97a8] mb-1">
            <span>显存占用 (FP8 缓冲已启用)</span>
            <span className="font-mono text-[#00b4d8] font-bold">19.4 / 24.0 GB</span>
          </div>
          <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00b4d8] h-full shadow-[0_0_8px_rgba(0,180,216,0.6)]"
              style={{ width: "80.8%" }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#8a97a8] mb-1">
            <span>系统内存 (DDR5 64GB)</span>
            <span className="font-mono text-[#e8f0f8] font-semibold">26.2 / 64.0 GB</span>
          </div>
          <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
            <div className="bg-[#9d7cd8] h-full" style={{ width: "40.9%" }} />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between text-[11px] text-[#8b949e]">
        <span>看门狗探活周期: 1000ms</span>
        <button
          onClick={() => onNavigate("ops")}
          className="text-[#00b4d8] hover:underline cursor-pointer"
        >
          运维大屏 →
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
