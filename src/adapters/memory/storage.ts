/**
 * file: src/adapters/memory/storage.ts
 * description: YYC³ 适配器层 — 本地持久化 StoragePort memory 实现（进程内键值，断网默认）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[memory],[storage],[kv]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 键值存储内存适配器 — 实现 StoragePort 端口（load/save/remove），
 *        进程内 Map 承载；SSR/测试/旧浏览器（无 indexedDB）路径的组合根
 *        兜底装配，与 indexeddb/kv 同接口同语义（克隆隔离），刷新即失（内存态）。
 *
 * dependencies: ../../domains/platform/storage/ports
 * exports: createMemoryStorage
 */
import { StoragePort } from "../../domains/platform/storage/ports";

/** JSON 深拷贝 — 与 IDB 结构化克隆同语义（外部篡改不污染存储态） */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * 内存键值存储（组合根 memory 路径兜底装配）：
 * - load：未命中返回 null（业务空值，不抛错）
 * - save：覆盖写；remove：幂等删除
 */
export function createMemoryStorage(): StoragePort {
  const table = new Map<string, unknown>();
  return {
    async load<T>(key: string): Promise<T | null> {
      const value = table.get(key);
      return value === undefined ? null : cloneJson<T>(value as T);
    },
    async save<T>(key: string, value: T): Promise<void> {
      table.set(key, cloneJson(value));
    },
    async remove(key: string): Promise<void> {
      table.delete(key);
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
