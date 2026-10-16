/**
 * file: src/adapters/indexeddb/db.ts
 * description: YYC³ 适配器层 — IndexedDB 薄封装（零依赖 promise 化存储后端，可注入内存替身）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[indexeddb],[storage],[platform]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: IndexedDB 薄封装 — 库 `yyc3-mh3` v1，七个 object store（batches/seeds/
 *        logs/metrics/services/alarms/kv），promise 化 get/put/getAll/delete/clear；
 *        后端句柄接口最小化（DbBackend），测试以内存 Map 替身同接口驱动（jsdom 无 IDB）。
 *
 *        记录主键约定：六记录库以 in-line keyPath「id」取主键（记录须为含 id 的
 *        对象）；kv 库 keyPath「key」。真实 IDB 经结构化克隆天然隔离副本；内存
 *        替身以 JSON 深拷贝模拟同等语义（仓库数据均为 JSON 纯结构，安全）。
 *
 * dependencies: —
 * exports: StoreName, DbBackend, STORE_KEY_PATHS, DB_NAME, DB_VERSION, openDatabase, createInMemoryDbBackend
 */

/** object store 名称（与 STORE_KEY_PATHS 一一对应） */
export type StoreName = "batches" | "seeds" | "logs" | "metrics" | "services" | "alarms" | "kv";

/**
 * 存储后端句柄（最小接口，promise 化）。
 *
 * 实现方：
 * - `openDatabase()`：真实 IndexedDB 后端（浏览器运行时）
 * - `createInMemoryDbBackend()`：内存 Map 替身（测试 / 无 IDB 环境注入）
 *
 * `get` 未命中返回 `null`（业务空值，不抛错）；`put` 为按主键 upsert，
 * 主键自 value[keyPath] 提取（缺主键视为编程错误，直接抛错暴露）。
 */
export interface DbBackend {
  get<T = unknown>(store: StoreName, key: string): Promise<T | null>;
  put(store: StoreName, value: object): Promise<void>;
  getAll<T = unknown>(store: StoreName): Promise<T[]>;
  delete(store: StoreName, key: string): Promise<void>;
  clear(store: StoreName): Promise<void>;
}

/** 数据库名（P4 本地持久化基建约定） */
export const DB_NAME = "yyc3-mh3";

/** 数据库版本（升级回调在此建 store，后续演进 +1 并追加迁移分支） */
export const DB_VERSION = 1;

/** store → in-line keyPath 映射（六记录库主键 id；kv 主键 key） */
export const STORE_KEY_PATHS: Readonly<Record<StoreName, string>> = {
  batches: "id",
  seeds: "id",
  logs: "id",
  metrics: "id",
  services: "id",
  alarms: "id",
  kv: "key",
};

/** 单事务执行器：等待库就绪 → 开事务 → 包 promis request */
function runRequest<T>(
  ready: Promise<IDBDatabase>,
  store: StoreName,
  mode: IDBTransactionMode,
  exec: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return ready.then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = exec(tx.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error(`IndexedDB ${store} 操作失败`));
      }),
  );
}

/** 真实 IndexedDB 后端（全部操作挂起至 open 完成后再执行） */
function createIdbBackend(ready: Promise<IDBDatabase>): DbBackend {
  return {
    get: (store, key) =>
      runRequest(ready, store, "readonly", (os) => os.get(key)).then((row) =>
        row === undefined ? null : row,
      ),
    put: (store, value) =>
      runRequest(ready, store, "readwrite", (os) => os.put(value)).then(() => undefined),
    getAll: (store) =>
      runRequest(ready, store, "readonly", (os) => os.getAll()).then((rows) => [...rows]),
    delete: (store, key) =>
      runRequest(ready, store, "readwrite", (os) => os.delete(key)).then(() => undefined),
    clear: (store) =>
      runRequest(ready, store, "readwrite", (os) => os.clear()).then(() => undefined),
  };
}

/**
 * 打开真实 IndexedDB（同步返回句柄 — 内部以 Promise 惰性等待 open 完成，
 * 组合根可同步装配；升级回调按 STORE_KEY_PATHS 建齐七个 store）。
 */
export function openDatabase(name = DB_NAME, version = DB_VERSION): DbBackend {
  const ready = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const [store, keyPath] of Object.entries(STORE_KEY_PATHS)) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 打开失败（yyc3-mh3）"));
  });
  return createIdbBackend(ready);
}

/** JSON 深拷贝 — 模拟真实 IDB 结构化克隆（仓库数据均为 JSON 纯结构） */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 内存 Map 替身（测试 / 无 IDB 环境注入）：同 DbBackend 接口 + 克隆隔离语义 */
export function createInMemoryDbBackend(): DbBackend {
  const tables = new Map<StoreName, Map<string, unknown>>();
  const tableOf = (store: StoreName): Map<string, unknown> => {
    const existing = tables.get(store);
    if (existing) return existing;
    const created = new Map<string, unknown>();
    tables.set(store, created);
    return created;
  };
  const keyOf = (store: StoreName, value: object): string => {
    const key = (value as Record<string, unknown>)[STORE_KEY_PATHS[store]];
    if (key === undefined || key === null) {
      throw new Error(`内存后端记录缺少主键 ${STORE_KEY_PATHS[store]}（store=${store}）`);
    }
    return String(key);
  };
  return {
    get: async <T>(store: StoreName, key: string): Promise<T | null> => {
      const row = tableOf(store).get(key);
      return row === undefined ? null : cloneJson<T>(row as T);
    },
    put: async (store: StoreName, value: object): Promise<void> => {
      tableOf(store).set(keyOf(store, value), cloneJson(value));
    },
    getAll: async <T>(store: StoreName): Promise<T[]> =>
      [...tableOf(store).values()].map((row) => cloneJson<T>(row as T)),
    delete: async (store: StoreName, key: string): Promise<void> => {
      tableOf(store).delete(key);
    },
    clear: async (store: StoreName): Promise<void> => {
      tableOf(store).clear();
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
