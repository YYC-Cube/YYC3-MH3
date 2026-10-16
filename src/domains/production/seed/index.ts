/**
 * file: src/domains/production/seed/index.ts
 * description: YYC³ 生产域 — Seed 种子规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[production],[seed],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Seed 种子领域规则 — 8 位种子号生成 / 优质回写种子构造 / 工作台采纳草稿构造
 *        与回写成功通知文案 / 探索 Seed 重摇通知文案
 *
 * dependencies: ../../../types
 * exports: generateSeedNumber, createSeedFromAdoption, AdoptionSeedDraftInput, adoptionSeedDraft, ADOPTION_NOTICE, randomSeedNotice
 */
import { BatchMode, SeedItem } from "../../../types";

/**
 * 生成 8 位探索种子号，值域 [10000000, 99999999]。
 */
export function generateSeedNumber(): number {
  return Math.floor(Math.random() * 89999999) + 10000000;
}

/**
 * 人工质检通过后的优质回写种子构造规则：
 * 以工作台采纳数据回填缺省字段（S 级基线 + 推荐模型 + 默认参数组）。
 */
export function createSeedFromAdoption(adopted: Partial<SeedItem>): SeedItem {
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
  };
}

/** 工作台采纳草稿入参（现场采样参数 + 当前批次上下文） */
export interface AdoptionSeedDraftInput {
  /** 当前工作台种子号 */
  seedNumber: number;
  /** 当前批次名（截取前 8 字符派生回写名） */
  batchName: string;
  /** 当前批次总分（0/缺省时回退演示基线 95.2） */
  batchScore: number;
  /** 当前批次生成模式（进入基线标签） */
  mode: BatchMode;
  /** 工作台现场采样参数（回写时补全 motionScale/cfgLipSync 生产默认） */
  params: { guidanceScale: number; steps: number; denoiseStrength: number };
}

/** 优质回写成功通知（域语义文案） */
export const ADOPTION_NOTICE = {
  title: "优质 Seed 成功回写种子库！",
  detail: "已作为基线沉淀，可随时发起衍生变异。",
} as const;

/**
 * 人工质检通过的采纳回写草稿构造（纯展示面 Partial<SeedItem>）：
 * 名称取批次名前 8 字符派生「-优质基因回写」，S 级，均分回退 95.2，
 * 标签为「人工复核通过 / 口型S级 / {mode}基线」三元组。
 */
export function adoptionSeedDraft(input: AdoptionSeedDraftInput): Partial<SeedItem> {
  return {
    seedNumber: input.seedNumber,
    name: `${input.batchName.slice(0, 8)}-优质基因回写`,
    tier: "S",
    avgScore: input.batchScore || 95.2,
    tags: ["人工复核通过", "口型S级", `${input.mode}基线`],
    params: {
      guidanceScale: input.params.guidanceScale,
      steps: input.params.steps,
      denoiseStrength: input.params.denoiseStrength,
      motionScale: 1.05,
      cfgLipSync: 8.8,
    },
  };
}

/**
 * 探索 Seed 重摇通知（域语义文案）：
 * 标题宣告全新探索种子生成，副标携带 `Seed: #{n}` 明细。
 */
export function randomSeedNotice(seedNumber: number): { title: string; detail: string } {
  return {
    title: "已生成全新探索 Seed",
    detail: `Seed: #${seedNumber}`,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
