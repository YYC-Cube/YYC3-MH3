/**
 * file: src/adapters/indexeddb/seedRepository.ts
 * description: YYC³ 适配器层 — 种子仓储 IndexedDB 实现（离线落盘 + 采纳回写，P4-1）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[indexeddb],[seed],[repository]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 种子仓储 IDB 适配器 — 实现 SeedRepository 端口（listAll/getById/create）；
 *        首次初始化 store 为空时自 memory 夹具播种，之后一切读写走 IDB；
 *        create 采纳回写自基线递减续号前置，对齐 App `setSeeds((prev) => [newSeed, ...prev])`。
 *
 * dependencies: ../../types, ../../domains/production/seed/ports, ../memory/fixtures/seed, ./db, ./records
 * exports: createIndexeddbSeedRepository
 */
import { SeedRepository } from "../../domains/production/seed/ports";
import { SeedItem } from "../../types";
import { INITIAL_SEEDS } from "../memory/fixtures/seed";
import { DbBackend } from "./db";
import { envelope, seedIfEmpty, SEQ_SEED_BASE, unwrap, unwrapAll } from "./records";

/** JSON 深拷贝 — 出借/回执与 IDB 结构化克隆同语义（入参篡改不污染仓库） */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * IndexedDB 版种子仓储（读 + 采纳回写）：
 *
 * - listAll / getById：懒播种后读 IDB，出借副本
 * - create：对应人工质检采纳回写（POST /seeds 语义），信封自基线递减续号
 *   入仓并原样返回入参副本 — 升序读取新种子恒排最前，与 memory 基线一致
 */
export function createIndexeddbSeedRepository(db: DbBackend): SeedRepository {
  let seedPromise: Promise<void> | null = null;
  let nextSeq = SEQ_SEED_BASE;

  /** 懒播种（失败重置允许重试） */
  const ensureSeeded = (): Promise<void> => {
    if (seedPromise === null) {
      seedPromise = seedIfEmpty(db, "seeds", INITIAL_SEEDS, (s) => s.id).catch((err: unknown) => {
        seedPromise = null;
        throw err;
      });
    }
    return seedPromise;
  };

  return {
    async listAll() {
      await ensureSeeded();
      const rows = await db.getAll("seeds");
      for (const row of rows) {
        const seq = (row as Record<string, unknown>).seq;
        if (typeof seq === "number") nextSeq = Math.min(nextSeq, seq);
      }
      return unwrapAll<SeedItem>(rows);
    },
    async getById(id) {
      await ensureSeeded();
      return unwrap<SeedItem>(await db.get("seeds", id));
    },
    async create(seed) {
      await ensureSeeded();
      const record = cloneJson(seed);
      nextSeq -= 1;
      await db.put("seeds", envelope(record.id, nextSeq, record));
      return cloneJson(record);
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
