/**
 * file: src/app/useProductionData.ts
 * description: YYC³ 应用层 — 生产数据 Hook（批次/种子状态 + 组合根端口消费 + 持久化写回）
 * author: YanYuCloudCube Team
 * version: v2.0.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [app],[hook],[data]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 生产数据 Hook — 同步快照引导（零闪烁）+ 挂载后端口水合（P4-2 持久化
 *        生效点：IDB 模式下整体替换为落盘真值）+ 变更写回（createBatch 落盘 /
 *        adoptSeed 经 SeedRepository.create 回写）；端口失败不阻塞 UI，
 *        console.warn + reportClientError 同级留痕
 *
 * dependencies: react, ../adapters/memory/fixtures/batch, ../adapters/memory/fixtures/seed, ../domains/production/batch, ../domains/production/seed, ./composition, ./error-sink, ../types
 * exports: useProductionData
 */
import { useEffect, useMemo, useState } from "react";
import { INITIAL_BATCHES } from "../adapters/memory/fixtures/batch";
import { INITIAL_SEEDS } from "../adapters/memory/fixtures/seed";
import { createBatchItem } from "../domains/production/batch";
import { createSeedFromAdoption } from "../domains/production/seed";
import { BatchItem, NewBatchDraft, SeedItem } from "../types";
import { getPorts } from "./composition";
import { reportClientError } from "./error-sink";

/** 端口读写失败留痕：不阻塞 UI —— console.warn + 客户端错误 sink 同级留痕 */
function tracePortFailure(scope: string, err: unknown): void {
  console.warn(`[useProductionData] 端口操作失败（${scope}），保留内存态继续运行`, err);
  reportClientError(
    `生产数据端口操作失败（${scope}）：${err instanceof Error ? err.message : String(err)}`,
    "本地持久化通道异常，演示数据仍可交互",
  );
}

/**
 * 生产数据域状态（批次 / 种子 / 当前选中批次）：
 *
 * - 引导：同步自领域快照初始化（memory 适配器同源，零空态闪烁，SSR 首屏不变）；
 * - 水合（P4-2）：挂载后经组合根端口 listX() 异步取数并【整体替换】状态 ——
 *   IDB 模式下即持久化真值（跨刷新存活的关键）；失败保留引导态不阻塞 UI。
 * - 采纳回写：经组合根装配的 SeedRepository（POST /seeds 语义），
 *   端口返回副本前置入 UI 投影 — 仓库与投影同序演进；IDB 模式下同步落盘。
 * - 批次创建：构造规则在领域层（createBatchItem），本 Hook 做状态前置、选中
 *   与落盘写回（BatchWritePort.save 可选调用，memory 路径天然跳过）。
 */
export function useProductionData() {
  // P2：组合根单例 —— 全树共享装配（AppProviders 与视图水合同源）
  const ports = useMemo(() => getPorts(), []);
  const seedRepo = ports.seeds;

  const [batches, setBatches] = useState<BatchItem[]>(
    () => INITIAL_BATCHES.map((b) => ({ ...b })), // 夹具冻结：拷贝出可变副本引导（防就地污染）
  );
  const [seeds, setSeeds] = useState<SeedItem[]>(() => INITIAL_SEEDS.map((s) => ({ ...s })));
  const [activeBatchId, setActiveBatchId] = useState<string>(
    INITIAL_BATCHES[0]!.id, // mock 常量数组恒非空，静态首索引安全
  );

  // P4-2 持久化水合：端口真值整体替换（竞态防护：卸载取消，StrictMode 双挂载幂等）
  useEffect(() => {
    let cancelled = false;
    void Promise.all([ports.batches.listAll(), ports.seeds.listAll()])
      .then(([persistedBatches, persistedSeeds]) => {
        if (cancelled) return;
        setBatches(persistedBatches);
        setSeeds(persistedSeeds);
      })
      .catch((err: unknown) => tracePortFailure("数据水合", err));
    return () => {
      cancelled = true;
    };
  }, [ports]);

  /** 人工质检采纳 → 端口回写（IDB 落盘）→ 返回副本前置入 UI 投影 */
  const adoptSeed = (newSeedData: Partial<SeedItem>) => {
    void seedRepo
      .create(createSeedFromAdoption(newSeedData))
      .then((created) => {
        setSeeds((prev) => [created, ...prev]);
      })
      .catch((err: unknown) => tracePortFailure("种子采纳回写", err));
  };

  /** 领域构造新批次 + UI 前置 + 选中 + 端口落盘写回（fire-and-forget 不阻塞 UI） */
  const createBatch = (draft: NewBatchDraft): BatchItem => {
    const batch = createBatchItem(draft, batches.length);
    setBatches((prev) => [batch, ...prev]);
    setActiveBatchId(batch.id);
    void ports.batches.save?.(batch).catch((err: unknown) => tracePortFailure("批次创建落盘", err));
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
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
