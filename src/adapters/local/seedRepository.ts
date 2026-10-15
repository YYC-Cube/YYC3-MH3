/**
 * file: src/adapters/local/seedRepository.ts
 * description: YYC³ 适配器层 — 种子 local 实现（Registry API 供数，失败降级 memory + 留痕）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[local],[seed]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 种子 local 适配器 — GET /seeds + POST /seeds 供数/回写；getById 经列表消化（契约无 :id 端点）
 *
 * dependencies: ../../types, ../../domains/seed/ports, ../../domains/ops/ports, ../memory/seedRepository, ./http
 * exports: LocalSeedOptions, createLocalSeedRepository
 */
import type { SeedRepository } from "../../domains/seed/ports";
import type { TelemetryPort } from "../../domains/ops/ports";
import type { SeedItem } from "../../types";
import { createMemorySeedRepository } from "../memory/seedRepository";
import { createResilientGateway, makeTraceEntry, type LocalAdapterOptions } from "./http";

export interface LocalSeedOptions extends LocalAdapterOptions {
  /** 降级回退通道（缺省自建 memory） */
  memory?: SeedRepository;
  /** 降级/恢复留痕通道（组合根注入共享遥测实例） */
  telemetry?: Pick<TelemetryPort, "appendLog">;
}

/**
 * Registry API 版种子适配器（06 契约 §2 #8）：
 *
 * - listAll → GET /seeds；create → POST /seeds（采纳回写）
 * - getById：契约未定义 GET /seeds/:id，经列表本地查找消化（不虚构端点），
 *   列表获取失败时回退 memory.getById
 * - 其余失败回退 memory 同型方法（含 create 本地落账，断网可采纳种子）；
 *   降级/恢复经 telemetry.appendLog 留痕
 */
export function createLocalSeedRepository(options: LocalSeedOptions = {}): SeedRepository {
  const memory = options.memory ?? createMemorySeedRepository();
  const gateway = createResilientGateway(options, (t) => {
    void options.telemetry?.appendLog(makeTraceEntry("种子仓储", t.degraded, t.detail));
  });

  return {
    listAll: () => gateway<SeedItem[]>("/seeds").catch(() => memory.listAll()),
    getById: async (id: string) => {
      try {
        const list = await gateway<SeedItem[]>("/seeds");
        return list.find((seed) => seed.id === id) ?? null;
      } catch {
        return memory.getById(id);
      }
    },
    create: (seed: SeedItem) =>
      gateway<SeedItem>("/seeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seed),
      }).catch(() => memory.create(seed)),
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
