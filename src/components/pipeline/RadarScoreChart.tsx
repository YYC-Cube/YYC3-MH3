/**
 * file: src/components/pipeline/RadarScoreChart.tsx
 * description: YYC³ 五步闭环流水线组件 — RadarDimension
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[pipeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 五步闭环流水线组件 — RadarDimension
 *
 * dependencies: react, lucide-react
 * exports: RadarDimension, RadarScoreChartProps, DEFAULT_DIMENSIONS, RadarScoreChart
 */
import { Info } from "lucide-react";
import React, { useState } from "react";
import { averageDimensionScore } from "../../domains/quality";

export interface RadarDimension {
  key: string;
  label: string;
  score: number; // 0 - 100
  benchmark: number; // Historical mean
  threshold: number; // Quality pass threshold, default 85
  advice: string;
}

export interface RadarScoreChartProps {
  dimensions?: RadarDimension[];
  showBenchmark?: boolean;
  onDimensionSelect?: (dimension: RadarDimension) => void;
  className?: string;
}

export const DEFAULT_DIMENSIONS: RadarDimension[] = [
  {
    key: "lipSync",
    label: "口型吻合度",
    score: 95.8,
    benchmark: 88.4,
    threshold: 85,
    advice: "SyncNet 唇齿微运动特征对齐极佳，保持当前 CFG 权重即可。",
  },
  {
    key: "expression",
    label: "表情自然度",
    score: 92.4,
    benchmark: 89.1,
    threshold: 85,
    advice: "眼睑微闭与微笑转折流畅，建议维持 Guidance Scale 在 7.0-7.5 范围。",
  },
  {
    key: "stability",
    label: "姿态稳定性",
    score: 97.2,
    benchmark: 92.0,
    threshold: 85,
    advice: "中景镜头头部无剧烈时序晃动，肩部边缘无抗撕裂失真。",
  },
  {
    key: "coherence",
    label: "时序一致性",
    score: 93.5,
    benchmark: 86.8,
    threshold: 85,
    advice: "帧间扩散平滑度良好，无闪烁色块或发丝跳帧。",
  },
  {
    key: "fidelity",
    label: "超清画质",
    score: 96.0,
    benchmark: 91.5,
    threshold: 85,
    advice: "4K超分辨率重构面容毛孔与毛发边缘清晰度符合超清标准。",
  },
];

export const RadarScoreChart: React.FC<RadarScoreChartProps> = ({
  dimensions = DEFAULT_DIMENSIONS,
  showBenchmark = true,
  onDimensionSelect,
  className = "",
}) => {
  const [activeDim, setActiveDim] = useState<RadarDimension | null>(dimensions[0] ?? null);
  const [hoveredDim, setHoveredDim] = useState<RadarDimension | null>(null);

  // SVG Geometry
  const size = 260;
  const center = size / 2;
  const radius = size * 0.38;
  const total = dimensions.length;
  const angleStep = (Math.PI * 2) / total;

  // Calculate polygon points
  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const currentPoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.score, i);
      return `${x},${y}`;
    })
    .join(" ");

  const benchmarkPoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.benchmark, i);
      return `${x},${y}`;
    })
    .join(" ");

  const thresholdPoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.threshold, i);
      return `${x},${y}`;
    })
    .join(" ");

  const avgScore = averageDimensionScore(dimensions).toFixed(1);

  // dimensions 具备 DEFAULT_DIMENSIONS 默认值恒非空，尾兜底安全
  const selectedDim = hoveredDim || activeDim || dimensions[0]!;

  return (
    <div
      className={`p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] flex flex-col ${className}`}
    >
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
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Background circular web */}
            {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
              <polygon
                key={idx}
                points={dimensions
                  .map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = level * radius;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#1c2d48"
                strokeWidth={idx === 3 ? 1.5 : 1}
                strokeDasharray={idx < 3 ? "3 3" : undefined}
              />
            ))}

            {/* Axis radial lines */}
            {dimensions.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#1c2d48"
                  strokeWidth="1"
                />
              );
            })}

            {/* Pass Threshold Baseline (85) */}
            <polygon
              points={thresholdPoints}
              fill="none"
              stroke="#EE4C2C"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />

            {/* Benchmark History Polygon */}
            {showBenchmark && (
              <polygon
                points={benchmarkPoints}
                fill="rgba(0, 180, 216, 0.08)"
                stroke="#00b4d8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Current Batch Polygon */}
            <polygon
              points={currentPoints}
              fill="rgba(0, 212, 170, 0.22)"
              stroke="#00d4aa"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_10px_rgba(0,212,170,0.5)]"
            />

            {/* Dimension Dots and Labels */}
            {dimensions.map((dim, i) => {
              const { x, y } = getCoordinates(dim.score, i);
              const isBelow = dim.score < dim.threshold;
              const isHighlighted = selectedDim.key === dim.key;

              // Outer label position
              const labelAngle = i * angleStep - Math.PI / 2;
              const labelR = radius + 22;
              const lx = center + labelR * Math.cos(labelAngle);
              const ly = center + labelR * Math.sin(labelAngle);

              return (
                <g key={dim.key} className="cursor-pointer">
                  {/* Point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHighlighted ? 6 : 4}
                    fill={isBelow ? "#EE4C2C" : "#00d4aa"}
                    stroke="#071425"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredDim(dim)}
                    onMouseLeave={() => setHoveredDim(null)}
                    onClick={() => {
                      setActiveDim(dim);
                      onDimensionSelect?.(dim);
                    }}
                    className="transition-all duration-150"
                  />
                  {/* Label */}
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHighlighted ? "#00d4aa" : "#8b949e"}
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                    fontWeight={isHighlighted ? "600" : "400"}
                    onMouseEnter={() => setHoveredDim(dim)}
                    onMouseLeave={() => setHoveredDim(null)}
                    onClick={() => {
                      setActiveDim(dim);
                      onDimensionSelect?.(dim);
                    }}
                  >
                    {dim.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Dimension Insight Card */}
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
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
