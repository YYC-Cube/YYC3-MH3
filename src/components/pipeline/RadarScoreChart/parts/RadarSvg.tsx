/**
 * file: src/components/pipeline/RadarScoreChart/parts/RadarSvg.tsx
 * description: YYC³ 五步闭环流水线组件 — 雷达 SVG 图层（底盘/轴线/三多边形/维度点与标签）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[radar],[svg],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 多维质量雷达 SVG 绘制层 — 背景网格、径向轴线、阈值/历史/当前三多边形、
 *        维度点与外围标签；交互（悬浮/选中）经回调上抛，状态由容器单点持有。
 *
 * dependencies: react, ./types, ./radarGeometry
 * exports: RadarSvg, RadarSvgProps
 */
import type React from "react";
import type { RadarDimension } from "./types";
import type { RadarGeometry } from "./radarGeometry";

export interface RadarSvgProps {
  dimensions: RadarDimension[];
  geometry: RadarGeometry;
  showBenchmark: boolean;
  selectedDim: RadarDimension;
  onHoverDim: (dimension: RadarDimension | null) => void;
  onSelectDim: (dimension: RadarDimension) => void;
}

export const RadarSvg: React.FC<RadarSvgProps> = ({
  dimensions,
  geometry,
  showBenchmark,
  selectedDim,
  onHoverDim,
  onSelectDim,
}) => {
  const { size, center, radius, angleStep, getCoordinates, currentPoints, benchmarkPoints, thresholdPoints } = geometry;

  return (
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
          return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="#1c2d48" strokeWidth="1" />;
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
                onMouseEnter={() => onHoverDim(dim)}
                onMouseLeave={() => onHoverDim(null)}
                onClick={() => {
                  onSelectDim(dim);
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
                onMouseEnter={() => onHoverDim(dim)}
                onMouseLeave={() => onHoverDim(null)}
                onClick={() => {
                  onSelectDim(dim);
                }}
              >
                {dim.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
