/**
 * file: src/domains/production/pipeline/index.ts
 * description: YYC³ 生产域 — 五步闭环流水线规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[production],[pipeline],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 五步闭环流水线领域规则 —
 *   - 阶段顺序/循环推进/进度映射/执行推进（advancePipeline，+5%/s 仿真步进）
 *   - 执行请求留痕日志构造（executionRequestLogEntry，时钟字段注入保持纯度）
 *   - 完机通知文案（PIPELINE_COMPLETION_NOTICE）与重启归零规则（resetProgressIfComplete）
 *   - 启动/模板载入通知文案（runStartNotice / templateLoadedNotice）
 *   - v2.0 黄金基线参数锚点与回滚规则（GOLDEN_BASELINE_V2 / rollbackToGoldenBaseline）
 *
 * dependencies: ../../../types
 * exports: PIPELINE_STAGE_ORDER, getStageIndex, getNextStage, stageForProgress, advancePipeline, PipelineAdvanceResult, PipelineLogStamp, executionRequestLogEntry, PIPELINE_COMPLETION_NOTICE, resetProgressIfComplete, runStartNotice, templateLoadedNotice, GOLDEN_BASELINE_V2, rollbackToGoldenBaseline, GOLDEN_BASELINE_NOTICE, DEFAULT_NEGATIVE_PROMPT
 */
import { LogEntry, PipelineStageKey } from "../../../types";

/** 五步流水线阶段顺序 — 全项目单一事实来源（PipelineBar / 设计系统 / 执行循环共用） */
export const PIPELINE_STAGE_ORDER: readonly PipelineStageKey[] = [
  "generation",
  "scoring",
  "fine_eval",
  "analysis",
  "seed_iter",
] as const;

/** 阶段索引（未知阶段返回 -1，与 Array.indexOf 语义一致） */
export function getStageIndex(stage: PipelineStageKey): number {
  return PIPELINE_STAGE_ORDER.indexOf(stage);
}

/** 循环推进至下一阶段（seed_iter 之后回到 generation，构成闭环） */
export function getNextStage(stage: PipelineStageKey): PipelineStageKey {
  const index = getStageIndex(stage);
  const next = PIPELINE_STAGE_ORDER[(index + 1) % PIPELINE_STAGE_ORDER.length];
  // 全联合成员均在 ORDER 中，取模结果恒存在（未知阶段回退首阶段）
  return next ?? "generation";
}

/** 进度 → 阶段阈值映射（生产规则：>80 种子迭代 / >60 缺陷归因 / >40 多模精评 / >20 口型初评，其余神经渲染） */
export function stageForProgress(progress: number): PipelineStageKey {
  if (progress > 80) return "seed_iter";
  if (progress > 60) return "analysis";
  if (progress > 40) return "fine_eval";
  if (progress > 20) return "scoring";
  return "generation";
}

/** 单次执行推进结果 */
export interface PipelineAdvanceResult {
  /** 推进后的总进度（完成时收敛为 100） */
  progress: number;
  /** 推进后所处阶段 */
  stage: PipelineStageKey;
  /** 是否已达 100%（流水线应停机并进入质检） */
  completed: boolean;
}

/**
 * 执行循环单步推进（纯计算）：
 * 累加增量；达到 100% 时收敛并落至 seed_iter 完成态，否则按阈值映射阶段。
 */
export function advancePipeline(prev: number, increment = 5): PipelineAdvanceResult {
  const raw = prev + increment;
  if (raw >= 100) {
    return { progress: 100, stage: "seed_iter", completed: true };
  }
  return { progress: raw, stage: stageForProgress(raw), completed: false };
}

/** 执行日志时钟戳（由调用方注入，域内零时钟副作用） */
export interface PipelineLogStamp {
  /** 日志唯一标识（如 `LOG-${Date.now()}`） */
  id: string;
  /** 展示时间戳（如 toLocaleTimeString()） */
  timestamp: string;
}

/**
 * 执行请求留痕日志构造（纯函数）：
 * 生成引擎受理口径 — 消息模板含 Steps/CFG/Seed 三参数约束，逐字为工作台启动分支文案。
 */
export function executionRequestLogEntry(
  params: { steps: number; guidanceScale: number; seedNumber: number },
  stamp: PipelineLogStamp,
): LogEntry {
  return {
    id: stamp.id,
    timestamp: stamp.timestamp,
    level: "info",
    stage: "生成引擎",
    message: `[DiffSynth] 接收到执行请求，参数：Steps=${params.steps}, CFG=${params.guidanceScale}, Seed=${params.seedNumber}`,
  };
}

/** 流水线完机通知（域语义文案：完机 → 聚合评分 → 人工质检验收） */
export const PIPELINE_COMPLETION_NOTICE = {
  title: "五步闭环流水线生成完毕",
  detail: "已自动聚合多维评分，等待人工质检验收",
} as const;

/** 重启归零规则：已达 100% 的进度在再次启动时归零重跑，未满进度原地续跑 */
export function resetProgressIfComplete(progress: number): number {
  return progress >= 100 ? 0 : progress;
}

/** 流水线启动通知（域语义文案：启动标题 + Seed 约束副标） */
export function runStartNotice(seedNumber: number): { title: string; detail: string } {
  return {
    title: "启动生成批次",
    detail: `采用 Seed #${seedNumber} 进行五步闭环生产`,
  };
}

/** 模板快速载入通知（域语义文案：`已载入模板: {name}`） */
export function templateLoadedNotice(name: string): string {
  return `已载入模板: ${name}`;
}

/** v2.0 黄金基线采样参数（参数版本回滚锚点，工作台与对比弹窗共用） */
export const GOLDEN_BASELINE_V2 = {
  steps: 32,
  guidanceScale: 7.2,
} as const;

/**
 * 回滚至 v2.0 黄金基线（纯函数）：
 * 返回基线参数的可变浅拷贝，调用方直接落 setState，域内零状态副作用。
 */
export function rollbackToGoldenBaseline(): { steps: number; guidanceScale: number } {
  return { ...GOLDEN_BASELINE_V2 };
}

/** 黄金基线回滚成功通知（域语义文案） */
export const GOLDEN_BASELINE_NOTICE = {
  title: "已回滚到 v2.0 黄金基线参数",
} as const;

/**
 * 生成引擎负面提示词基线（纯文案常量）：
 * 收敛口型/表情/时序闪烁六类缺陷排除项，工作台初始态与模板系统共用。
 */
export const DEFAULT_NEGATIVE_PROMPT =
  "blurry, deformed mouth, low resolution, bad teeth alignment, unnatural eye movement, flickering hair";

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
