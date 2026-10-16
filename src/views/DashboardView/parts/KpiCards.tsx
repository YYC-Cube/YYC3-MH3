/**
 * file: src/views/DashboardView/parts/KpiCards.tsx
 * description: YYC³ 功能视图 — DashboardView 四大 KPI 指标卡（渐变面积迷你曲线）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[dashboard],[kpi],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 第一行四张 KPI 卡（产出批次 / 达标率 / 推理耗时 / 显存负载），
 *        SVG 渐变面积曲线逐字搬移自原 DashboardView.tsx（Row 1）。
 *
 * dependencies: react, lucide-react
 * exports: KpiCardsProps, KpiCards
 */
import { ArrowUpRight } from "lucide-react";
import React from "react";

export interface KpiCardsProps {
  trendPeriod: "weekly" | "monthly";
}

export const KpiCards: React.FC<KpiCardsProps> = ({ trendPeriod }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1 */}
      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8a97a8]">
          <span>产出批次总数 ({trendPeriod === "weekly" ? "本周" : "本月"})</span>
          <span className="text-[#00e0b8] flex items-center font-mono">
            +18.4%
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#e8f0f8] font-mono drop-shadow-[0_0_12px_rgba(0,224,184,0.4)]">
            128
          </span>
          <span className="text-xs text-[#8a97a8]">批次</span>
        </div>
        {/* SVG Gradient Area Sparkline */}
        <div className="mt-3 h-8 w-full">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e0b8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00e0b8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0 20 Q 25 15, 50 10 T 100 4 L 100 24 L 0 24 Z" fill="url(#grad1)" />
            <path d="M 0 20 Q 25 15, 50 10 T 100 4" fill="none" stroke="#00e0b8" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Card 2 */}
      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8a97a8]">
          <span>流水线达标率</span>
          <span className="text-[#00e0b8] flex items-center font-mono">
            +0.4%
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#00e0b8] font-mono drop-shadow-[0_0_12px_rgba(0,224,184,0.5)]">
            98.6%
          </span>
          <span className="text-xs text-[#8a97a8]">≥85分达标</span>
        </div>
        <div className="mt-3 h-8 w-full">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0 18 Q 30 14, 60 8 T 100 5 L 100 24 L 0 24 Z" fill="url(#grad2)" />
            <path d="M 0 18 Q 30 14, 60 8 T 100 5" fill="none" stroke="#00b4d8" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Card 3 */}
      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8a97a8]">
          <span>平均单批推理耗时</span>
          <span className="text-[#00e0b8] flex items-center font-mono">-6.2s</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#e8f0f8] font-mono drop-shadow-[0_0_12px_rgba(157,124,216,0.35)]">
            42.8s
          </span>
          <span className="text-xs text-[#8a97a8]">/ 10s 4K</span>
        </div>
        <div className="mt-3 h-8 w-full">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9d7cd8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9d7cd8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0 6 Q 35 12, 70 16 T 100 20 L 100 24 L 0 24 Z" fill="url(#grad3)" />
            <path d="M 0 6 Q 35 12, 70 16 T 100 20" fill="none" stroke="#9d7cd8" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Card 4 */}
      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8a97a8]">
          <span>显存负载 (RTX 4090)</span>
          <span className="text-[#00e0b8] font-mono">80.8%</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#00e0b8] font-mono drop-shadow-[0_0_12px_rgba(0,224,184,0.4)]">
            19.4
          </span>
          <span className="text-xs text-[#8a97a8]">/ 24.0 GB</span>
        </div>
        <div className="mt-3 w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#00e0b8] to-[#00b4d8] h-full"
            style={{ width: "80.8%" }}
          />
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
