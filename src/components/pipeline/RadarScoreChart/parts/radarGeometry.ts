/**
 * file: src/components/pipeline/RadarScoreChart/parts/radarGeometry.ts
 * description: YYC³ 五步闭环流水线组件 — 雷达多边形几何构造（纯函数）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[radar],[geometry],[pure],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 由评分维度集合推导雷达坐标系（尺寸/圆心/半径/角步长）、坐标换算，
 *        以及当前批次 / 历史均值 / 阈值基线的多边形点串（零副作用）。
 *
 * dependencies: ./types
 * exports: RadarGeometry, buildRadarGeometry
 */
import type { RadarDimension } from "./types";

export interface RadarGeometry {
  size: number;
  center: number;
  radius: number;
  angleStep: number;
  getCoordinates: (value: number, index: number) => { x: number; y: number };
  currentPoints: string;
  benchmarkPoints: string;
  thresholdPoints: string;
}

export function buildRadarGeometry(dimensions: RadarDimension[]): RadarGeometry {
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

  return {
    size,
    center,
    radius,
    angleStep,
    getCoordinates,
    currentPoints,
    benchmarkPoints,
    thresholdPoints,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
