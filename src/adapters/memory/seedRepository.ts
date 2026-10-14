/**
 * file: src/adapters/memory/seedRepository.ts
 * description: YYC³ 适配器层 — 种子仓储 memory 实现（演示快照 + 采纳回写，断网默认）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[memory],[seed]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 种子仓储 memory 适配器 — 快照深拷贝出借 + 回写前置（契约 §2 #8）
 *
 * dependencies: ../../types, ../../domains/seed/ports, ../../data/seed
 * exports: createMemorySeedRepository
 */
import { INITIAL_SEEDS } from "../../data/seed"
import { SeedRepository } from "../../domains/seed/ports"
import { SeedItem } from "../../types"

/** 深拷贝 — BatchItem/SeedItem 均为 JSON 纯结构（无函数/循环引用），安全 */
function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * 内存快照版种子仓储（断网默认数据通道）。
 * `create` 对应人工质检采纳回写（POST /seeds 语义）：新种子前置入仓并对齐
 * App 现行 `setSeeds((prev) => [newSeed, ...prev])` 行为。
 */
export function createMemorySeedRepository(): SeedRepository {
  let snapshot: SeedItem[] = deepCopy(INITIAL_SEEDS)

  return {
    async listAll() {
      return deepCopy(snapshot)
    },
    async getById(id) {
      const found = snapshot.find((s) => s.id === id)
      return found ? deepCopy(found) : null
    },
    async create(seed) {
      const copy = deepCopy(seed)
      snapshot = [copy, ...snapshot]
      return deepCopy(copy)
    },
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
