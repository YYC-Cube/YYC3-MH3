/**
 * file: src/components/pipeline/RadarScoreChart/parts/DimensionInsightCard.tsx
 * description: YYC³ 五步闭环流水线组件 — 选中维度洞察卡（分值/历史均值/阈值/调优建议）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[radar],[insight],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 雷达图右侧选中维度的洞察卡 — 展示当前分值等级、历史均值基线、
 *        阈值达标判定与调优建议文案。
 *
 * dependencies: react, lucide-react, ./types
 * exports: DimensionInsightCard, DimensionInsightCardProps
 */
import { Info } from "lucide-react";
import type React from "react";
import type { RadarDimension } from "./types";

export interface DimensionInsightCardProps {
  selectedDim: RadarDimension;
}

export const DimensionInsightCard: React.FC<DimensionInsightCardProps> = ({ selectedDim }) => {
  return (
    <div className="flex-1 w-full bg-[#122340]/70 border border-[#30363d] rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#e6edf3]">{selectedDim.label}</span>
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
              selectedDim.score >= selectedDim.threshold
                ? "bg-[#00d4aa]/20 text-[#00d4aa]"
                : "bg-[#EE4C2C]/20 text-[#EE4C2C]"
            }`}
          >
            {selectedDim.score} 分
          </span>
        </div>
        <div className="text-[11px] text-[#8b949e]">
          历史均值: <span className="font-mono text-[#00b4d8]">{selectedDim.benchmark}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-1.5 text-[11px] text-[#8b949e]">
          <Info className="w-3.5 h-3.5 text-[#00b4d8] flex-shrink-0 mt-0.5" />
          <span>
            基线阈值: {selectedDim.threshold} 分 (
            {selectedDim.score >= selectedDim.threshold ? "达标" : "未达标"})
          </span>
        </div>
        <div className="p-2 rounded bg-[#071425]/60 border border-[#30363d]/60 text-[11px] text-[#e6edf3] leading-relaxed">
          <span className="text-[#00d4aa] font-medium">调优建议：</span>
          {selectedDim.advice}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
