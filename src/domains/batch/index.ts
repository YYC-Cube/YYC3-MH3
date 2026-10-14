/**
 * file: src/domains/batch/index.ts
 * description: YYC³ 领域层 — 生产批次规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[batch],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 生产批次领域规则 — 当前批次定位 / 批次编号生成
 *
 * dependencies: ../../types
 * exports: findCurrentBatch, createBatchId, createBatchItem
 */
import { BatchItem, NewBatchDraft } from "../../types"

/**
 * 定位当前批次：优先精确匹配 activeId，未命中回退首个批次。
 * 返回 undefined 仅当批次库为空（调用方据此渲染空态守卫）。
 */
export function findCurrentBatch(
  batches: BatchItem[],
  activeId?: string,
): BatchItem | undefined {
  if (!activeId) return batches[0]
  return batches.find((b) => b.id === activeId) ?? batches[0]
}

/**
 * 批次编号生成规则：BATCH-YYYYMMDD-NNN（NNN 由既有数量偏移 90 起算，三位补零）。
 * now 参数注入便于测试确定性，默认当前时间。
 */
export function createBatchId(existingCount: number, now = new Date()): string {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "")
  const seqPart = String(existingCount + 90).padStart(3, "0")
  return `BATCH-${datePart}-${seqPart}`
}

/**
 * 新批次出厂构造规则：
 * 以 S 级演示基线分启动（95.2），五步流水线自 generation 起步，10% 进度入列。
 * 编号沿用 createBatchId；now 参数注入便于测试确定性。
 */
export function createBatchItem(
  draft: NewBatchDraft,
  existingCount: number,
  now = new Date(),
): BatchItem {
  return {
    id: createBatchId(existingCount, now),
    name: draft.name,
    mode: draft.mode,
    seed: draft.seed,
    prompt: draft.prompt,
    status: "running",
    progress: 10,
    currentStage: "generation",
    startTime: now.toLocaleTimeString(),
    duration: "00:15",
    score: 95.2,
    lipSyncScore: 96.0,
    expressionScore: 93.5,
    stabilityScore: 97.0,
    coherenceScore: 94.0,
    fidelityScore: 95.5,
    resolution: "1080x1920",
    fps: 30,
    vramUsageGb: 19.4,
    previewThumbnail: "/placeholders/person.svg",
    tags: [draft.mode, "五步流水线"],
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
