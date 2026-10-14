/**
 * file: src/domains/pipeline/index.ts
 * description: YYC³ 领域层 — 五步闭环流水线规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[pipeline],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 五步闭环流水线领域规则 — 阶段顺序/循环推进/进度映射/执行推进
 *
 * dependencies: ../../types
 * exports: PIPELINE_STAGE_ORDER, getStageIndex, getNextStage, stageForProgress, advancePipeline, PipelineAdvanceResult
 */
import { PipelineStageKey } from "../../types"

/** 五步流水线阶段顺序 — 全项目单一事实来源（PipelineBar / 设计系统 / 执行循环共用） */
export const PIPELINE_STAGE_ORDER: readonly PipelineStageKey[] = [
  "generation",
  "scoring",
  "fine_eval",
  "analysis",
  "seed_iter",
] as const

/** 阶段索引（未知阶段返回 -1，与 Array.indexOf 语义一致） */
export function getStageIndex(stage: PipelineStageKey): number {
  return PIPELINE_STAGE_ORDER.indexOf(stage)
}

/** 循环推进至下一阶段（seed_iter 之后回到 generation，构成闭环） */
export function getNextStage(stage: PipelineStageKey): PipelineStageKey {
  const index = getStageIndex(stage)
  const next = PIPELINE_STAGE_ORDER[(index + 1) % PIPELINE_STAGE_ORDER.length]
  // 全联合成员均在 ORDER 中，取模结果恒存在（未知阶段回退首阶段）
  return next ?? "generation"
}

/** 进度 → 阶段阈值映射（生产规则：>80 种子迭代 / >60 缺陷归因 / >40 多模精评 / >20 口型初评，其余神经渲染） */
export function stageForProgress(progress: number): PipelineStageKey {
  if (progress > 80) return "seed_iter"
  if (progress > 60) return "analysis"
  if (progress > 40) return "fine_eval"
  if (progress > 20) return "scoring"
  return "generation"
}

/** 单次执行推进结果 */
export interface PipelineAdvanceResult {
  /** 推进后的总进度（完成时收敛为 100） */
  progress: number
  /** 推进后所处阶段 */
  stage: PipelineStageKey
  /** 是否已达 100%（流水线应停机并进入质检） */
  completed: boolean
}

/**
 * 执行循环单步推进（纯计算）：
 * 累加增量；达到 100% 时收敛并落至 seed_iter 完成态，否则按阈值映射阶段。
 */
export function advancePipeline(
  prev: number,
  increment = 5,
): PipelineAdvanceResult {
  const raw = prev + increment
  if (raw >= 100) {
    return { progress: 100, stage: "seed_iter", completed: true }
  }
  return { progress: raw, stage: stageForProgress(raw), completed: false }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
