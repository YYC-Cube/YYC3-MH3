/**
 * file: src/domains/platform/storage/ports.ts
 * description: YYC³ 基础设施域 — 本地持久化端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[port],[platform],[storage]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 本地持久化端口 — 键值读写删（数据主权：离线可拥有，见 P4）
 *
 * dependencies: —
 * exports: StoragePort
 */

/**
 * 本地持久化端口（键值读写删）。
 *
 * 实现方：
 * - `adapters/memory`（内存快照，断网默认）
 * - `adapters/indexeddb`（离线可读写落盘，P4 落地）
 *
 * `load` 未命中返回 `null`（业务空值，不抛错）；值为 JSON 可序列化纯结构。
 */
export interface StoragePort {
  load<T>(key: string): Promise<T | null>;
  save<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
