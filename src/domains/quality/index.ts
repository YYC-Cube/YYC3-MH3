/**
 * file: src/domains/quality/index.ts
 * description: YYC³ 领域层 — 质量评分规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[quality],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 质量评分领域规则 — 多维评分聚合
 *
 * dependencies: —
 * exports: averageDimensionScore
 */

/**
 * 多维评分均分聚合。
 * 参数采用结构化最小契约（{ score }），与 RadarDimension 等任意评分维度结构兼容；
 * 空集合返回 0（避免 NaN 向上游泄漏）。
 */
export function averageDimensionScore(items: { score: number }[]): number {
  if (items.length === 0) return 0
  return items.reduce((acc, curr) => acc + curr.score, 0) / items.length
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
