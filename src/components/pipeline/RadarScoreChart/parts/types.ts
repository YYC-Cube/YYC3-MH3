/**
 * file: src/components/pipeline/RadarScoreChart/parts/types.ts
 * description: YYC³ 五步闭环流水线组件 — RadarScoreChart 类型契约（维度结构与图表入参）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[radar],[types],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 多维质量雷达图契约层 — 评分维度与图表入参类型（零 UI 依赖，供容器与 parts 共享）
 *
 * dependencies: —
 * exports: RadarDimension, RadarScoreChartProps
 */

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

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
