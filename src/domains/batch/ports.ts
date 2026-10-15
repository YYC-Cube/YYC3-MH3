/**
 * file: src/domains/batch/ports.ts
 * description: YYC³ 领域层 — 批次仓储端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [domain],[port],[batch]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 批次仓储端口 — 对应 06 契约 §2 #7（GET /batches、GET /batches/:id）
 *
 * dependencies: ../../types
 * exports: BatchRepository
 */
import { BatchItem } from "../../types";

/**
 * 批次仓储端口（读模型 — 契约仅定义 GET，批次创建属运行时 UI 态）。
 *
 * 实现方：
 * - `adapters/memory`（内存快照，断网默认）
 * - `adapters/local`（Registry API `GET /batches`、`GET /batches/:id`，待 BFF 落地）
 *
 * 未命中返回 `null`（对应契约 404 错误约定，适配器内部消化，不向 UI 泄露细节）。
 * async 签名与 local 适配器对齐，memory 实现以已决 Promise 包装。
 */
export interface BatchRepository {
  listAll(): Promise<BatchItem[]>;
  getById(id: string): Promise<BatchItem | null>;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
