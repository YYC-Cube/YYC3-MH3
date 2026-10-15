/**
 * file: src/adapters/local/batchRepository.ts
 * description: YYC³ 适配器层 — 批次 local 实现（Registry API 供数，失败降级 memory + 留痕）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[local],[batch]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 批次 local 适配器 — GET /batches(+:id) 供数，404 业务空值，失败降级 memory（06 §2 #7）
 *
 * dependencies: ../../types, ../../domains/batch/ports, ../../domains/ops/ports, ../memory/batchRepository, ./http
 * exports: LocalBatchOptions, createLocalBatchRepository
 */
import type { BatchRepository } from "../../domains/batch/ports";
import type { TelemetryPort } from "../../domains/ops/ports";
import type { BatchItem } from "../../types";
import { createMemoryBatchRepository } from "../memory/batchRepository";
import {
  createResilientGateway,
  makeTraceEntry,
  RegistryError,
  type LocalAdapterOptions,
} from "./http";

export interface LocalBatchOptions extends LocalAdapterOptions {
  /** 降级回退通道（缺省自建 memory） */
  memory?: BatchRepository;
  /** 降级/恢复留痕通道（组合根注入共享遥测实例） */
  telemetry?: Pick<TelemetryPort, "appendLog">;
}

/**
 * Registry API 版批次适配器（06 契约 §2 #7）：
 *
 * - listAll → GET /batches；getById → GET /batches/:id
 * - `:id` 404 为业务空值 → null（不降级不留痕，06 §2 v1.0.1 细化）
 * - 其余失败回退 memory 同型方法；降级/恢复经 telemetry.appendLog 留痕
 */
export function createLocalBatchRepository(options: LocalBatchOptions = {}): BatchRepository {
  const memory = options.memory ?? createMemoryBatchRepository();
  const gateway = createResilientGateway(options, (t) => {
    void options.telemetry?.appendLog(makeTraceEntry("批次仓储", t.degraded, t.detail));
  });

  return {
    listAll: () => gateway<BatchItem[]>("/batches").catch(() => memory.listAll()),
    getById: async (id: string) => {
      try {
        return await gateway<BatchItem>(`/batches/${encodeURIComponent(id)}`);
      } catch (err) {
        if (err instanceof RegistryError && err.kind === "not_found") return null;
        return memory.getById(id);
      }
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
