/**
 * file: src/adapters/memory/batchRepository.ts
 * description: YYC³ 适配器层 — 批次仓储 memory 实现（演示快照，断网默认）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[memory],[batch]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 批次仓储 memory 适配器 — 快照深拷贝出借，读模型（契约 §2 #7）
 *
 * dependencies: ../../types, ../../domains/batch/ports, ../../data/batch
 * exports: createMemoryBatchRepository
 */
import { INITIAL_BATCHES } from "../../data/batch"
import { BatchRepository } from "../../domains/batch/ports"
import { BatchItem } from "../../types"

/** 深拷贝 — BatchItem/SeedItem 均为 JSON 纯结构（无函数/循环引用），安全 */
function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * 内存快照版批次仓储（断网默认数据通道）。
 * 以演示快照为种子，所有出借均为深拷贝，外部篡改不污染仓库状态。
 */
export function createMemoryBatchRepository(): BatchRepository {
  let snapshot: BatchItem[] = deepCopy(INITIAL_BATCHES)

  return {
    async listAll() {
      return deepCopy(snapshot)
    },
    async getById(id) {
      const found = snapshot.find((b) => b.id === id)
      return found ? deepCopy(found) : null
    },
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
