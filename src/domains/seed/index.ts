/**
 * file: src/domains/seed/index.ts
 * description: YYC³ 领域层 — Seed 种子规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[seed],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Seed 种子领域规则 — 8 位种子号生成 / 优质回写种子构造
 *
 * dependencies: ../../types
 * exports: generateSeedNumber, createSeedFromAdoption
 */
import { SeedItem } from "../../types"

/**
 * 生成 8 位探索种子号，值域 [10000000, 99999999]。
 */
export function generateSeedNumber(): number {
  return Math.floor(Math.random() * 89999999) + 10000000
}

/**
 * 人工质检通过后的优质回写种子构造规则：
 * 以工作台采纳数据回填缺省字段（S 级基线 + 推荐模型 + 默认参数组）。
 */
export function createSeedFromAdoption(
  adopted: Partial<SeedItem>,
): SeedItem {
  return {
    id: `SEED-${adopted.seedNumber || Date.now()}`,
    seedNumber: adopted.seedNumber || 81923011,
    name: adopted.name || "优质回写种子",
    tier: "S",
    avgScore: adopted.avgScore || 95.0,
    generationCount: 1,
    lastUsed: "刚刚",
    tags: adopted.tags || ["五步闭环沉淀", "优质回写"],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
    params: adopted.params || {
      guidanceScale: 7.5,
      steps: 30,
      denoiseStrength: 0.65,
      motionScale: 1.0,
      cfgLipSync: 8.5,
    },
    notes: "由流水线工作台人工质检复核后一键反哺沉淀，已作为优质基线。",
    isFavorite: true,
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
