/**
 * file: src/adapters/indexeddb/batchRepository.ts
 * description: YYC³ 适配器层 — 批次仓储 IndexedDB 实现（离线落盘持久化，P4-1）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[indexeddb],[batch],[repository]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 批次仓储 IDB 适配器 — 实现 BatchRepository 端口 + save 写回扩展
 *        （批次创建落盘，P4-2 Hook 写回通道）；首次初始化 store 为空时自
 *        memory 夹具播种（写入 IDB 后再读，首启即有演示数据），之后一切
 *        读写走 IDB。展示序经信封 seq 对齐 memory 基线（夹具原序 + 新前置）。
 *
 * dependencies: ../../types, ../../domains/production/batch/ports, ../memory/fixtures/batch, ./db, ./records
 * exports: createIndexeddbBatchRepository
 */
import { BatchRepository } from "../../domains/production/batch/ports";
import { BatchItem } from "../../types";
import { INITIAL_BATCHES } from "../memory/fixtures/batch";
import { DbBackend } from "./db";
import { envelope, seedIfEmpty, SEQ_SEED_BASE, unwrap, unwrapAll } from "./records";

/**
 * IndexedDB 版批次仓储（读模型 + 创建写回扩展）：
 *
 * - listAll / getById：懒播种后读 IDB，出借结构化克隆副本（外部篡改不污染）
 * - save（端口外写回扩展，BatchWritePort 结构契约）：新批次自基线递减续号
 *   入仓，升序读取恒排最前（对齐 App `setBatches((prev) => [batch, ...prev])`）
 * - seq 计数器自读取路径持续同步（跨实例写入不冲突：新实例读即感知存量最小序号）
 */
export function createIndexeddbBatchRepository(
  db: DbBackend,
): BatchRepository & { save(batch: BatchItem): Promise<void> } {
  let seedPromise: Promise<void> | null = null;
  let nextSeq = SEQ_SEED_BASE;

  /** 懒播种（失败重置允许重试；成功后本进程内仅执行一次） */
  const ensureSeeded = (): Promise<void> => {
    if (seedPromise === null) {
      seedPromise = seedIfEmpty(db, "batches", INITIAL_BATCHES, (b) => b.id).catch((err: unknown) => {
        seedPromise = null;
        throw err;
      });
    }
    return seedPromise;
  };

  /** 自存量信封同步序号下界（新实例首读即对齐既有最小 seq，防写回撞号） */
  const syncSeqFloor = (rows: readonly unknown[]): void => {
    for (const row of rows) {
      if (typeof row === "object" && row !== null) {
        const seq = (row as Record<string, unknown>).seq;
        if (typeof seq === "number") nextSeq = Math.min(nextSeq, seq);
      }
    }
  };

  return {
    async listAll() {
      await ensureSeeded();
      const rows = await db.getAll("batches");
      syncSeqFloor(rows);
      return unwrapAll<BatchItem>(rows);
    },
    async getById(id) {
      await ensureSeeded();
      return unwrap<BatchItem>(await db.get("batches", id));
    },
    async save(batch) {
      await ensureSeeded();
      nextSeq -= 1;
      await db.put("batches", envelope(batch.id, nextSeq, batch));
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
