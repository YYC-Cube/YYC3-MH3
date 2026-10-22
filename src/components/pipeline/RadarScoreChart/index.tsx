/**
 * file: src/components/pipeline/RadarScoreChart/index.tsx
 * description: YYC³ 五步闭环流水线组件 — 多维质量雷达图容器（状态装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[radar],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 多维质量雷达评估容器 — 收敛选中/悬浮维度单一真值，装配雷达 SVG 与洞察卡；
 *        大块绘制与卡片 JSX 分别下沉至 parts（RadarSvg / DimensionInsightCard）。
 *
 * dependencies: react, ../../../domains/production/quality, ./parts/types, ./parts/dimensions, ./parts/radarGeometry, ./parts/RadarSvg, ./parts/DimensionInsightCard
 * exports: RadarDimension, RadarScoreChartProps, DEFAULT_DIMENSIONS, RadarScoreChart
 */
import React, { useState } from "react";
import { averageDimensionScore } from "../../../domains/production/quality";
import type { RadarDimension, RadarScoreChartProps } from "./parts/types";
import { DEFAULT_DIMENSIONS } from "./parts/dimensions";
import { buildRadarGeometry } from "./parts/radarGeometry";
import { RadarSvg } from "./parts/RadarSvg";
import { DimensionInsightCard } from "./parts/DimensionInsightCard";

export type { RadarDimension, RadarScoreChartProps } from "./parts/types";
export { DEFAULT_DIMENSIONS } from "./parts/dimensions";

export const RadarScoreChart: React.FC<RadarScoreChartProps> = ({
  dimensions = DEFAULT_DIMENSIONS,
  showBenchmark = true,
  onDimensionSelect,
  className = "",
}) => {
  const [activeDim, setActiveDim] = useState<RadarDimension | null>(dimensions[0] ?? null);
  const [hoveredDim, setHoveredDim] = useState<RadarDimension | null>(null);

  const geometry = buildRadarGeometry(dimensions);
  const avgScore = averageDimensionScore(dimensions).toFixed(1);

  // dimensions 具备 DEFAULT_DIMENSIONS 默认值恒非空，尾兜底安全
  const selectedDim = hoveredDim || activeDim || dimensions[0]!;

  return (
    <div className={`p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#e6edf3]">多维质量雷达评估</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#122340] text-[#00d4aa] border border-[#30363d]">
            综合加权: {avgScore} 分
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8b949e]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#00d4aa] rounded-sm inline-block" />
            当前批次
          </span>
          {showBenchmark && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#00b4d8] border border-dashed rounded-sm inline-block" />
              历史均值
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* SVG Radar */}
        <RadarSvg
          dimensions={dimensions}
          geometry={geometry}
          showBenchmark={showBenchmark}
          selectedDim={selectedDim}
          onHoverDim={setHoveredDim}
          onSelectDim={(dim) => {
            setActiveDim(dim);
            onDimensionSelect?.(dim);
          }}
        />

        {/* Selected Dimension Insight Card */}
        <DimensionInsightCard selectedDim={selectedDim} />
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
