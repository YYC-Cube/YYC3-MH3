/**
 * file: src/domains/seed/ports.ts
 * description: YYC³ 领域层 — 种子仓储端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[port],[seed]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 种子仓储端口 — 对应 06 契约 §2 #8（GET /seeds、POST /seeds）
 *
 * dependencies: ../../types
 * exports: SeedRepository
 */
import { SeedItem } from "../../types"

/**
 * 种子仓储端口（读 + 采纳回写）。
 *
 * 实现方：
 * - `adapters/memory`（内存快照，断网默认）
 * - `adapters/local`（Registry API `GET /seeds`、`POST /seeds`，待 BFF 落地）
 *
 * 未命中返回 `null`（对应契约 404 错误约定）；`create` 对应人工质检采纳后的
 * 优质种子回写（POST /seeds），实现方需持久化至自身快照并原样返回。
 */
export interface SeedRepository {
  listAll(): Promise<SeedItem[]>
  getById(id: string): Promise<SeedItem | null>
  create(seed: SeedItem): Promise<SeedItem>
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
