/**
 * file: src/__tests__/adapters.memory.test.ts
 * description: memory 适配器单元测试 — 快照隔离 / 契约语义（404→null / 回写前置）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[adapter],[memory]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: memory 快照适配器测试（断网默认数据通道的行为基线）
 *
 * dependencies: vitest, ../adapters/memory/*, ../app/composition, ../data/batch, ../data/seed, ../domains/seed
 * exports: —
 */
import { describe, expect, it } from "vitest"
import { createMemoryBatchRepository } from "../adapters/memory/batchRepository"
import { createMemorySeedRepository } from "../adapters/memory/seedRepository"
import { createPorts } from "../app/composition"
import { INITIAL_BATCHES } from "../data/batch"
import { INITIAL_SEEDS } from "../data/seed"
import { createSeedFromAdoption } from "../domains/seed"

/* ---------------- batch：快照读模型（契约 §2 #7） ---------------- */

describe("adapters/memory · batchRepository", () => {
  it("listAll 返回演示快照全量批次", async () => {
    const repo = createMemoryBatchRepository()
    const list = await repo.listAll()
    expect(list).toHaveLength(INITIAL_BATCHES.length)
    expect(list[0]!.id).toBe(INITIAL_BATCHES[0]!.id)
  })

  it("listAll 返回深拷贝 — 外部篡改不污染仓库快照", async () => {
    const repo = createMemoryBatchRepository()
    const first = await repo.listAll()
    first[0]!.name = "外部篡改"
    const second = await repo.listAll()
    expect(second[0]!.name).toBe(INITIAL_BATCHES[0]!.name)
  })

  it("getById 精确命中返回批次副本", async () => {
    const repo = createMemoryBatchRepository()
    const target = INITIAL_BATCHES[1]!
    const found = await repo.getById(target.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(target.id)
    // 副本语义：篡改返回值不影响仓库
    found!.name = "副本篡改"
    expect((await repo.getById(target.id))!.name).toBe(target.name)
  })

  it("getById 未命中返回 null（契约 404 约定）", async () => {
    const repo = createMemoryBatchRepository()
    expect(await repo.getById("BATCH-NOT-EXIST")).toBeNull()
  })
})

/* ---------------- seed：快照读 + 采纳回写（契约 §2 #8） ---------------- */

describe("adapters/memory · seedRepository", () => {
  it("listAll 返回演示快照全量种子", async () => {
    const repo = createMemorySeedRepository()
    const list = await repo.listAll()
    expect(list).toHaveLength(INITIAL_SEEDS.length)
  })

  it("getById 命中返回副本 / 未命中返回 null", async () => {
    const repo = createMemorySeedRepository()
    expect((await repo.getById(INITIAL_SEEDS[0]!.id))!.id).toBe(
      INITIAL_SEEDS[0]!.id,
    )
    expect(await repo.getById("SEED-NOT-EXIST")).toBeNull()
  })

  it("create 采纳回写：新种子前置并可在仓库中查得", async () => {
    const repo = createMemorySeedRepository()
    const adopted = createSeedFromAdoption({
      seedNumber: 24681012,
      name: "端口验收种子",
    })
    const created = await repo.create(adopted)
    expect(created.id).toBe(adopted.id)

    const list = await repo.listAll()
    expect(list).toHaveLength(INITIAL_SEEDS.length + 1)
    expect(list[0]!.id).toBe(adopted.id) // 前置语义，对齐 App 回写行为
    expect((await repo.getById(adopted.id))!.name).toBe("端口验收种子")
  })

  it("create 入参深拷贝入仓 — 后续篡改入参对象不影响仓库", async () => {
    const repo = createMemorySeedRepository()
    const adopted = createSeedFromAdoption({ seedNumber: 13579111 })
    await repo.create(adopted)
    adopted.name = "入参篡改"
    const found = await repo.getById(adopted.id)
    expect(found!.name).not.toBe("入参篡改")
  })

  it("仓库实例间状态隔离（两实例互不可见回写）", async () => {
    const repoA = createMemorySeedRepository()
    const repoB = createMemorySeedRepository()
    await repoA.create(createSeedFromAdoption({ seedNumber: 91827364 }))
    expect(await repoA.listAll()).toHaveLength(INITIAL_SEEDS.length + 1)
    expect(await repoB.listAll()).toHaveLength(INITIAL_SEEDS.length)
  })
})

/* ---------------- composition：组合根装配 ---------------- */

describe("app/composition", () => {
  it("createPorts 装配 memory 批次/种子端口且数据可用", async () => {
    const { batches, seeds } = createPorts()
    expect(await batches.listAll()).toHaveLength(INITIAL_BATCHES.length)
    expect(await seeds.listAll()).toHaveLength(INITIAL_SEEDS.length)
    expect(await batches.getById(INITIAL_BATCHES[0]!.id)).not.toBeNull()
    expect(await seeds.getById(INITIAL_SEEDS[0]!.id)).not.toBeNull()
  })
})
