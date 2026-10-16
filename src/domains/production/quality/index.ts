/**
 * file: src/domains/production/quality/index.ts
 * description: YYC³ 生产域 — 质量评分规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[production],[quality],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 质量评分领域规则 — 多维评分聚合 + 人工质检缺陷标记基线
 *
 * dependencies: —
 * exports: averageDimensionScore, DefectCheckTable, DEFAULT_DEFECT_CHECKS
 */

/**
 * 多维评分均分聚合。
 * 参数采用结构化最小契约（{ score }），与 RadarDimension 等任意评分维度结构兼容；
 * 空集合返回 0（避免 NaN 向上游泄漏）。
 */
export function averageDimensionScore(items: { score: number }[]): number {
  if (items.length === 0) return 0;
  return items.reduce((acc, curr) => acc + curr.score, 0) / items.length;
}

/** 人工质检缺陷标记表（键为缺陷项，值为是否通过） */
export type DefectCheckTable = Readonly<Record<string, boolean>>;

/**
 * 人工质检缺陷标记基线（四项缺省全通过；顶层冻结防就地污染，
 * 消费方初始化时浅拷贝出新对象）：
 * 口型精确 / 微表情自然 / 无时序闪烁 / 边缘锐化。
 */
export const DEFAULT_DEFECT_CHECKS: DefectCheckTable = Object.freeze({
  lipSyncAccurate: true,
  microExpressionNatural: true,
  noTemporalFlicker: true,
  edgeSharpened: true,
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
