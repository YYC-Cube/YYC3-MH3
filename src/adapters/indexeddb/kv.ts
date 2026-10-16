/**
 * file: src/adapters/indexeddb/kv.ts
 * description: YYC³ 适配器层 — 本地持久化 StoragePort IndexedDB 实现（kv store，P4-1）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[indexeddb],[storage],[kv]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 键值存储 IDB 适配器 — 实现 StoragePort 端口（load/save/remove），
 *        基于 kv store（keyPath「key」，记录形如 { key, value }）；值为 JSON
 *        可序列化纯结构（结构化克隆天然隔离副本）。P4-3 导出导入将经本端口
 *        读写持久化快照。
 *
 * dependencies: ../../domains/platform/storage/ports, ./db
 * exports: createIndexeddbStorage
 */
import { StoragePort } from "../../domains/platform/storage/ports";
import { DbBackend } from "./db";

/** kv store 记录形状（keyPath「key」+ 任意 JSON 值） */
interface KvRecord {
  key: string;
  value: unknown;
}

/** 记录形状守卫（防异形记录混入读取路径） */
function isKvRecord(row: unknown): row is KvRecord {
  return typeof row === "object" && row !== null && "key" in row && "value" in row;
}

/**
 * IndexedDB 版键值存储（离线落盘持久化）：
 *
 * - load：未命中/异形返回 null（业务空值，不抛错）
 * - save：按 key upsert（覆盖旧值）
 * - remove：删除不存在键亦静默（幂等）
 */
export function createIndexeddbStorage(db: DbBackend): StoragePort {
  return {
    async load<T>(key: string): Promise<T | null> {
      const row = await db.get<KvRecord>("kv", key);
      return isKvRecord(row) ? (row.value as T) : null;
    },
    async save<T>(key: string, value: T): Promise<void> {
      await db.put("kv", { key, value });
    },
    async remove(key: string): Promise<void> {
      await db.delete("kv", key);
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
