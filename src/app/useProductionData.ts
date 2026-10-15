/**
 * file: src/app/useProductionData.ts
 * description: YYC³ 应用层 — 生产数据 Hook（批次/种子状态 + 组合根端口消费）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [app],[hook],[data]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 生产数据 Hook — 同步快照引导（零闪烁）+ 采纳回写经 SeedRepository 端口
 *
 * dependencies: react, ../data/batch, ../data/seed, ../domains/batch, ../domains/seed, ./composition, ../types
 * exports: useProductionData
 */
import { useMemo, useState } from "react";
import { INITIAL_BATCHES } from "../data/batch";
import { INITIAL_SEEDS } from "../data/seed";
import { createBatchItem } from "../domains/batch";
import { createSeedFromAdoption } from "../domains/seed";
import { BatchItem, NewBatchDraft, SeedItem } from "../types";
import { createPorts } from "./composition";

/**
 * 生产数据域状态（批次 / 种子 / 当前选中批次）：
 *
 * - 引导：同步自领域快照初始化（memory 适配器同源，零空态闪烁）；
 *   Registry BFF 落地后切换为端口异步水合 + 快照回退（06 契约 §4）。
 * - 采纳回写：经组合根装配的 SeedRepository（POST /seeds 语义），
 *   端口返回副本前置入 UI 投影 — 仓库与投影同序演进。
 * - 批次创建：构造规则在领域层（createBatchItem），本 Hook 只做状态前置与选中。
 */
export function useProductionData() {
  const seedRepo = useMemo(() => createPorts().seeds, []);

  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [seeds, setSeeds] = useState<SeedItem[]>(INITIAL_SEEDS);
  const [activeBatchId, setActiveBatchId] = useState<string>(
    INITIAL_BATCHES[0]!.id, // mock 常量数组恒非空，静态首索引安全
  );

  /** 人工质检采纳 → 端口回写 → 返回副本前置入 UI 投影 */
  const adoptSeed = (newSeedData: Partial<SeedItem>) => {
    void seedRepo.create(createSeedFromAdoption(newSeedData)).then((created) => {
      setSeeds((prev) => [created, ...prev]);
    });
  };

  /** 领域构造新批次 + UI 前置 + 选中，返回创建结果供调用方编排导航/通知 */
  const createBatch = (draft: NewBatchDraft): BatchItem => {
    const batch = createBatchItem(draft, batches.length);
    setBatches((prev) => [batch, ...prev]);
    setActiveBatchId(batch.id);
    return batch;
  };

  return {
    batches,
    seeds,
    activeBatchId,
    setActiveBatchId,
    adoptSeed,
    createBatch,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
