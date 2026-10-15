/**
 * file: src/__tests__/adapters.local.test.ts
 * description: local 适配器单元测试 — fetch 供数 + 三种降级触发 + 状态翻转留痕（06 契约 §4 v1.0.1）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[adapter],[local],[resilience]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: local 适配器契约测试 — 正常供数/网络错/非2xx/超时降级回退 memory + 降级/恢复留痕断言
 *
 * dependencies: vitest, ../adapters/local/*, ../adapters/memory/*, ../data/*, ../types
 * exports: —
 */
import { describe, expect, it, vi } from "vitest"
import { createLocalBatchRepository } from "../adapters/local/batchRepository"
import type { LocalAdapterOptions } from "../adapters/local/http"
import { createLocalSeedRepository } from "../adapters/local/seedRepository"
import { createLocalTelemetry } from "../adapters/local/telemetryRepository"
import { createMemorySeedRepository } from "../adapters/memory/seedRepository"
import { createMemoryTelemetry } from "../adapters/memory/telemetryRepository"
import { INITIAL_BATCHES } from "../data/batch"
import { SERVICES_LIST, SYSTEM_ALARMS } from "../data/ops"
import { INITIAL_SEEDS } from "../data/seed"
import type { BatchItem, LogEntry, SeedItem, ServiceStatus } from "../types"

/** 供数固定基址（显式注入，隔离 env 缺省） */
const BASE = "http://127.0.0.1:3031/api"

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

type FetchMock = (url: string, init?: RequestInit) => Promise<Response>

function makeOptions(
  fetchImpl: FetchMock,
  extra?: Partial<LocalAdapterOptions>,
): LocalAdapterOptions {
  return { baseUrl: BASE, timeoutMs: 200, fetchImpl, ...extra }
}

/** 构造与快照不同值的供数，证明响应确来自 BFF 而非 memory 快照 */
const REMOTE_SERVICES: ServiceStatus[] = [
  {
    name: "远端注册表服务",
    serviceId: "srv-remote-proof",
    port: 9999,
    status: "online",
    uptime: "1s",
    pids: 1,
    memory: "1 MB",
  },
]

function seedFixture(id: string): SeedItem {
  return {
    id,
    seedNumber: 1,
    name: `local 测试种子 ${id}`,
    tier: "B",
    avgScore: 88,
    generationCount: 0,
    lastUsed: "2026-10-12",
    tags: [],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
    params: {
      guidanceScale: 7.5,
      steps: 30,
      denoiseStrength: 0.65,
      motionScale: 0.8,
      cfgLipSync: 1,
    },
    notes: "",
    isFavorite: false,
  }
}

/** 留痕辅助：读取 memory 通道中的降级/恢复条目 */
async function traceLogs(telemetry: ReturnType<typeof createLocalTelemetry>): Promise<LogEntry[]> {
  const logs = await telemetry.listLogs()
  return logs.filter((l) => l.id.startsWith("TRACE-"))
}

describe("local telemetry · 正常供数（fetch 命中）", () => {
  it("listServices 返回 BFF 响应体（非 memory 快照）且 URL 经 baseUrl 拼接", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse(REMOTE_SERVICES))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const services = await telemetry.listServices()
    expect(services).toEqual(REMOTE_SERVICES)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0]![0]).toBe(`${BASE}/services`)
  })

  it("listMetrics / listAlarms 分别命中 /metrics 与 /alarms", async () => {
    const remoteMetrics = [{ time: "11:00", gpuVram: 1, gpuUtil: 1, cpuUtil: 1, memUtil: 1, diskIops: 1, temp: 1 }]
    const fetchImpl = vi.fn<FetchMock>(async (url) => {
      if (url === `${BASE}/metrics`) return okResponse(remoteMetrics)
      if (url === `${BASE}/alarms`) return okResponse([])
      throw new Error("unexpected url")
    })
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    expect(await telemetry.listMetrics()).toEqual(remoteMetrics)
    expect(await telemetry.listAlarms()).toEqual([])
  })

  it("listLogs / appendLog 走本地留痕通道（不发起 fetch，06 §4 接入细化）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse([]))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const entry: LogEntry = {
      id: "LOG-LOCAL-1",
      timestamp: "11:00:00",
      level: "info",
      stage: "本地通道",
      message: "处置留痕写入",
    }
    const echoed = await telemetry.appendLog(entry)
    expect(echoed).toEqual(entry)
    const logs = await telemetry.listLogs()
    expect(logs[0]!.id).toBe("LOG-LOCAL-1")
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it("baseUrl 缺省时由 APP_PORT 构造回环地址（零硬编码端点）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse(REMOTE_SERVICES))
    const telemetry = createLocalTelemetry({ timeoutMs: 200, fetchImpl })
    await telemetry.listServices()
    expect(fetchImpl.mock.calls[0]![0]).toBe(`http://127.0.0.1:3031/api/services`)
  })
})

describe("local telemetry · 降级触发（06 §4：网络错/非2xx/超时）", () => {
  it("网络错误 → 回退 memory 快照 + 降级留痕（warn）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => {
      throw new TypeError("fetch failed")
    })
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const services = await telemetry.listServices()
    expect(services).toEqual(SERVICES_LIST)
    const traces = await traceLogs(telemetry)
    expect(traces).toHaveLength(1)
    expect(traces[0]!.level).toBe("warn")
    expect(traces[0]!.message).toContain("降级")
    expect(traces[0]!.message).toContain("网络错误")
  })

  it("非 2xx（500）→ 回退 memory 快照 + 降级留痕（detail 含 HTTP 500）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse({ error: { code: "X", message: "x" } }, 500))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    expect(await telemetry.listAlarms()).toEqual(SYSTEM_ALARMS)
    const traces = await traceLogs(telemetry)
    expect(traces[0]!.level).toBe("warn")
    expect(traces[0]!.message).toContain("HTTP 500")
  })

  it("超时（>timeoutMs 未响应）→ 回退 memory 快照 + 降级留痕（detail 含 超时）", async () => {
    const fetchImpl = vi.fn<FetchMock>(() => new Promise(() => { }))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl, { timeoutMs: 20 }))
    expect(await telemetry.listServices()).toEqual(SERVICES_LIST)
    const traces = await traceLogs(telemetry)
    expect(traces[0]!.message).toContain("超时")
  })

  it("降级期间重复失败不重复留痕（状态翻转口径，06 §4 v1.0.1）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => {
      throw new TypeError("fetch failed")
    })
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    await telemetry.listServices()
    await telemetry.listMetrics()
    await telemetry.listAlarms()
    const traces = await traceLogs(telemetry)
    expect(traces).toHaveLength(1)
  })

  it("降级后恢复 → 供数切回 BFF + 恢复留痕（info）", async () => {
    let healthy = false
    const fetchImpl = vi.fn<FetchMock>(async () => {
      if (!healthy) throw new TypeError("fetch failed")
      return okResponse(REMOTE_SERVICES)
    })
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    expect(await telemetry.listServices()).toEqual(SERVICES_LIST) // 降级
    healthy = true
    expect(await telemetry.listServices()).toEqual(REMOTE_SERVICES) // 恢复
    const traces = await traceLogs(telemetry)
    expect(traces).toHaveLength(2)
    expect(traces[0]!.level).toBe("info")
    expect(traces[0]!.message).toContain("恢复")
    expect(traces[1]!.level).toBe("warn")
  })
})

describe("local batch · 读路径 + 404 业务空值", () => {
  it("listAll 正常供数走 GET /batches", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse(INITIAL_BATCHES))
    const repo = createLocalBatchRepository(makeOptions(fetchImpl))
    expect(await repo.listAll()).toEqual(INITIAL_BATCHES)
    expect(fetchImpl.mock.calls[0]![0]).toBe(`${BASE}/batches`)
  })

  it("getById 命中走 GET /batches/:id（id 经 encodeURIComponent）", async () => {
    const first = INITIAL_BATCHES[0]!
    const fetchImpl = vi.fn<FetchMock>(async (url) => {
      expect(url).toBe(`${BASE}/batches/${encodeURIComponent(first.id)}`)
      return okResponse(first)
    })
    const repo = createLocalBatchRepository(makeOptions(fetchImpl))
    expect(await repo.getById(first.id)).toEqual(first)
  })

  it("getById 404 → null（业务空值，不降级不留痕，06 §2 v1.0.1 细化）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse({ error: { code: "NOT_FOUND", message: "x" } }, 404))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const repo = createLocalBatchRepository({ ...makeOptions(fetchImpl), telemetry })
    expect(await repo.getById("BATCH-NOT-EXIST")).toBeNull()
    expect(await traceLogs(telemetry)).toHaveLength(0)
  })

  it("listAll 500 → 回退 memory 快照 + 经注入 telemetry 留痕", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse({ error: {} }, 500))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const repo = createLocalBatchRepository({ ...makeOptions(fetchImpl), telemetry })
    expect(await repo.listAll()).toEqual(INITIAL_BATCHES)
    const traces = await traceLogs(telemetry)
    expect(traces[0]!.stage).toBe("批次仓储")
    expect(traces[0]!.message).toContain("降级")
  })
})

describe("local seed · 列表消化 getById + POST 回写降级", () => {
  it("listAll 正常供数走 GET /seeds；getById 经列表本地查找（契约无 :id 端点，不虚构）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async (url) => {
      if (url === `${BASE}/seeds`) return okResponse(INITIAL_SEEDS)
      throw new Error(`unexpected endpoint: ${url}`) // 任何 /seeds/:id 都视为虚构端点
    })
    const repo = createLocalSeedRepository(makeOptions(fetchImpl))
    expect(await repo.listAll()).toEqual(INITIAL_SEEDS)
    const target = INITIAL_SEEDS[0]!
    expect(await repo.getById(target.id)).toEqual(target)
    expect(await repo.getById("seed-not-exist")).toBeNull()
  })

  it("create 正常走 POST /seeds（201 体返回）", async () => {
    const fresh = seedFixture("seed-local-1")
    const fetchImpl = vi.fn<FetchMock>(async (url, init) => {
      expect(url).toBe(`${BASE}/seeds`)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual(fresh)
      return okResponse(fresh, 201)
    })
    const repo = createLocalSeedRepository(makeOptions(fetchImpl))
    expect(await repo.create(fresh)).toEqual(fresh)
  })

  it("create 非 2xx → 降级 memory.create 落账 + 经注入 telemetry 留痕", async () => {
    const fresh = seedFixture("seed-local-2")
    const fetchImpl = vi.fn<FetchMock>(async () => okResponse({ error: {} }, 503))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const memorySeeds = createMemorySeedRepository()
    const repo = createLocalSeedRepository({ ...makeOptions(fetchImpl), memory: memorySeeds, telemetry })
    expect(await repo.create(fresh)).toEqual(fresh)
    const all = await memorySeeds.listAll()
    expect(all.some((s) => s.id === "seed-local-2")).toBe(true)
    const traces = await traceLogs(telemetry)
    expect(traces[0]!.stage).toBe("种子仓储")
    expect(traces[0]!.message).toContain("降级")
  })
})

describe("local telemetry · resolveAlarm 写路径（06 §2 #5 PATCH /alarms/:id）", () => {
  const target = SYSTEM_ALARMS[0]!

  it("命中 → PATCH /alarms/:id（body {resolved:true}）返回翻转条目", async () => {
    const resolvedItem = { ...target, resolved: true }
    const fetchImpl = vi.fn<FetchMock>(async (url, init) => {
      expect(url).toBe(`${BASE}/alarms/${encodeURIComponent(target.id)}`)
      expect(init?.method).toBe("PATCH")
      expect(JSON.parse(String(init?.body))).toEqual({ resolved: true })
      return okResponse(resolvedItem)
    })
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    expect(await telemetry.resolveAlarm(target.id)).toEqual(resolvedItem)
  })

  it("404 → null（业务空值，不降级不留痕，06 §2 v1.0.1 细化）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () =>
      okResponse({ error: { code: "NOT_FOUND", message: "x" } }, 404))
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    expect(await telemetry.resolveAlarm("ALARM-NOT-EXIST")).toBeNull()
    expect(await traceLogs(telemetry)).toHaveLength(0)
  })

  it("网络错 → 降级 memory.resolveAlarm 落账 + 留痕（stage 遥测聚合）", async () => {
    const fetchImpl = vi.fn<FetchMock>(async () => {
      throw new TypeError("fetch failed")
    })
    const telemetry = createLocalTelemetry(makeOptions(fetchImpl))
    const resolved = await telemetry.resolveAlarm(target.id)
    expect(resolved).not.toBeNull()
    expect(resolved!.resolved).toBe(true)
    const traces = await traceLogs(telemetry)
    expect(traces[0]!.stage).toBe("遥测聚合")
    expect(traces[0]!.message).toContain("降级")
  })
})

describe("local · memory 显式注入与装配可用", () => {
  it("三适配器共享注入 memory telemetry 时留痕同通道（装配语义预演）", async () => {
    const fail = vi.fn<FetchMock>(async () => {
      throw new TypeError("fetch failed")
    })
    const sharedMemory = createMemoryTelemetry()
    const telemetry = createLocalTelemetry({ ...makeOptions(fail), memory: sharedMemory })
    const batches = createLocalBatchRepository({ ...makeOptions(fail), telemetry })
    await batches.listAll()
    const traces = await traceLogs(telemetry)
    expect(traces).toHaveLength(1)
    expect(traces[0]!.stage).toBe("批次仓储")
  })

  it("全部出站端口方法均为 async 可等待（端口签名对齐）", async () => {
    const ok = vi.fn<FetchMock>(async (url) => {
      if (url.endsWith("/batches")) return okResponse(INITIAL_BATCHES as BatchItem[])
      if (url.endsWith("/seeds")) return okResponse(INITIAL_SEEDS)
      return okResponse(REMOTE_SERVICES)
    })
    const telemetry = createLocalTelemetry(makeOptions(ok))
    const batches = createLocalBatchRepository({ ...makeOptions(ok), telemetry })
    const seeds = createLocalSeedRepository({ ...makeOptions(ok), telemetry })
    expect((await telemetry.listServices()).length).toBeGreaterThan(0)
    expect(await batches.listAll()).toEqual(INITIAL_BATCHES)
    expect(await seeds.listAll()).toEqual(INITIAL_SEEDS)
  })
})
