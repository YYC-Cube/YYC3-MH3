/**
 * file: server/registryApi.test.ts
 * description: Registry API 本地 BFF 单元测试 — 八端点字段对型 + 错误约定 + 回环防护（06 契约 §2/§6）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[bff],[registry]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Registry API 契约测试 — 响应体逐字段对照 src/types 与演示快照断言（字段漂移拦截）
 *
 * dependencies: vitest, ./registryApi, ../src/data/*, ../src/types
 * exports: —
 */
import { describe, expect, it } from "vitest"
import { INITIAL_BATCHES } from "../src/data/batch"
import {
  INITIAL_LOGS,
  OPS_METRICS,
  SERVICES_LIST,
  SYSTEM_ALARMS,
} from "../src/data/ops"
import { INITIAL_SEEDS } from "../src/data/seed"
import type { SeedItem } from "../src/types"
import type { RegistryRequest } from "./registryApi"
import { createRegistryApi } from "./registryApi"

const LOOPBACK_HOST = "127.0.0.1:8443"

function makeRequest(overrides: Partial<RegistryRequest> = {}): RegistryRequest {
  return {
    method: "GET",
    path: "/api/health",
    query: new URLSearchParams(),
    host: LOOPBACK_HOST,
    ...overrides,
  }
}

/** 合法 SeedItem 夹具（字段覆盖 types.SeedItem 必填面） */
const NEW_SEED: SeedItem = {
  id: "seed-pr10-001",
  seedNumber: 428901,
  name: "PR-10 契约测试种子",
  tier: "A",
  avgScore: 93.2,
  generationCount: 0,
  lastUsed: "2026-10-12",
  tags: ["测试"],
  recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
  params: {
    guidanceScale: 7.5,
    steps: 30,
    denoiseStrength: 0.65,
    motionScale: 0.8,
    cfgLipSync: 1.0,
  },
  notes: "registry api 契约测试夹具",
  isFavorite: false,
}

describe("server/registryApi · GET /api/health", () => {
  it("返回 200 且形状为 { status, uptime: string }", () => {
    const res = createRegistryApi().handleRequest(makeRequest())
    expect(res.status).toBe(200)
    const body = res.json as { status: string; uptime: string }
    expect(body.status).toBe("online")
    expect(typeof body.uptime).toBe("string")
    expect(body.uptime.length).toBeGreaterThan(0)
  })
})

describe("server/registryApi · GET /api/services", () => {
  it("返回 200 且逐字段等于 SERVICES_LIST 演示快照", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/api/services" }))
    expect(res.status).toBe(200)
    expect(res.json).toEqual(SERVICES_LIST)
  })

  it("两次请求同值异引用（出借副本，篡改响应不影响后续读取）", () => {
    const api = createRegistryApi()
    const first = api.handleRequest(makeRequest({ path: "/api/services" })).json as {
      serviceId: string
      status: string
    }[]
    first[0]!.status = "offline"
    const second = api.handleRequest(makeRequest({ path: "/api/services" })).json as {
      serviceId: string
      status: string
    }[]
    expect(second[0]!.status).toBe("online")
    expect(first).not.toBe(second)
  })

  it("POST /api/services → 405 方法不允许", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({ method: "POST", path: "/api/services" }),
    )
    expect(res.status).toBe(405)
    expect((res.json as { error: { code: string } }).error.code).toBe(
      "METHOD_NOT_ALLOWED",
    )
  })
})

describe("server/registryApi · GET /api/metrics", () => {
  it("无查询参数返回全量时序快照", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/api/metrics" }))
    expect(res.status).toBe(200)
    expect(res.json).toEqual(OPS_METRICS)
  })

  it("?from=&to= 闭区间过滤（09:15~09:45 命中 3 条）", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({
        path: "/api/metrics",
        query: new URLSearchParams({ from: "09:15", to: "09:45" }),
      }),
    )
    expect(res.status).toBe(200)
    const list = res.json as { time: string }[]
    expect(list.map((m) => m.time)).toEqual(["09:15", "09:30", "09:45"])
  })
})

describe("server/registryApi · GET/PATCH /api/alarms", () => {
  it("无过滤返回全量告警快照", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/api/alarms" }))
    expect(res.status).toBe(200)
    expect(res.json).toEqual(SYSTEM_ALARMS)
  })

  it("?resolved=false / ?resolved=true 按处置状态过滤", () => {
    const api = createRegistryApi()
    const unresolved = api.handleRequest(
      makeRequest({
        path: "/api/alarms",
        query: new URLSearchParams({ resolved: "false" }),
      }),
    ).json as { resolved: boolean }[]
    expect(unresolved).toHaveLength(SYSTEM_ALARMS.length)
    const resolved = api.handleRequest(
      makeRequest({
        path: "/api/alarms",
        query: new URLSearchParams({ resolved: "true" }),
      }),
    ).json as unknown[]
    expect(resolved).toHaveLength(0)
  })

  it("?resolved= 非布尔值 → 400 错误约定", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({
        path: "/api/alarms",
        query: new URLSearchParams({ resolved: "yes" }),
      }),
    )
    expect(res.status).toBe(400)
    expect((res.json as { error: { code: string } }).error.code).toBe("BAD_REQUEST")
  })

  it("PATCH 置 resolved=true 后进程内状态持久且返回更新项", () => {
    const api = createRegistryApi()
    const patched = api.handleRequest(
      makeRequest({
        method: "PATCH",
        path: "/api/alarms/ALARM-0412-01",
        body: { resolved: true },
      }),
    )
    expect(patched.status).toBe(200)
    expect((patched.json as { resolved: boolean }).resolved).toBe(true)
    const after = api.handleRequest(
      makeRequest({
        path: "/api/alarms",
        query: new URLSearchParams({ resolved: "true" }),
      }),
    ).json as { id: string }[]
    expect(after.map((a) => a.id)).toEqual(["ALARM-0412-01"])
  })

  it("PATCH 未知告警 id → 404 错误约定", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({
        method: "PATCH",
        path: "/api/alarms/ALARM-0000-99",
        body: { resolved: true },
      }),
    )
    expect(res.status).toBe(404)
    expect((res.json as { error: { code: string } }).error.code).toBe("NOT_FOUND")
  })

  it("PATCH 请求体缺 resolved 布尔 → 400 错误约定", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({
        method: "PATCH",
        path: "/api/alarms/ALARM-0412-01",
        body: { resolved: "yes" },
      }),
    )
    expect(res.status).toBe(400)
    expect((res.json as { error: { code: string } }).error.code).toBe("BAD_REQUEST")
  })
})

describe("server/registryApi · GET /api/logs", () => {
  it("无过滤返回全量日志快照", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/api/logs" }))
    expect(res.status).toBe(200)
    expect(res.json).toEqual(INITIAL_LOGS)
  })

  it("?level=warn / ?stage= 精确过滤", () => {
    const api = createRegistryApi()
    const warns = api.handleRequest(
      makeRequest({
        path: "/api/logs",
        query: new URLSearchParams({ level: "warn" }),
      }),
    ).json as { level: string }[]
    expect(warns).toHaveLength(1)
    expect(warns[0]!.level).toBe("warn")
    const stageLogs = api.handleRequest(
      makeRequest({
        path: "/api/logs",
        query: new URLSearchParams({ stage: "生成引擎" }),
      }),
    ).json as { stage: string }[]
    expect(stageLogs).toHaveLength(3)
  })
})

describe("server/registryApi · GET /api/batches", () => {
  it("列表逐字段等于批次快照；:id 未命中 → 404", () => {
    const api = createRegistryApi()
    const list = api.handleRequest(makeRequest({ path: "/api/batches" }))
    expect(list.status).toBe(200)
    expect(list.json).toEqual(INITIAL_BATCHES)
    const miss = api.handleRequest(
      makeRequest({ path: "/api/batches/BATCH-NOT-EXIST" }),
    )
    expect(miss.status).toBe(404)
    expect((miss.json as { error: { code: string } }).error.code).toBe("NOT_FOUND")
  })

  it(":id 命中返回单项（取快照首个 id）", () => {
    const firstId = INITIAL_BATCHES[0]!.id
    const res = createRegistryApi().handleRequest(
      makeRequest({ path: `/api/batches/${firstId}` }),
    )
    expect(res.status).toBe(200)
    expect(res.json).toEqual(INITIAL_BATCHES[0])
  })
})

describe("server/registryApi · GET/POST /api/seeds", () => {
  it("列表逐字段等于种子快照", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/api/seeds" }))
    expect(res.status).toBe(200)
    expect(res.json).toEqual(INITIAL_SEEDS)
  })

  it("POST 新种子 → 201 原样返回且进程内持久（GET 长度 +1）", () => {
    const api = createRegistryApi()
    const created = api.handleRequest(
      makeRequest({ method: "POST", path: "/api/seeds", body: NEW_SEED }),
    )
    expect(created.status).toBe(201)
    expect(created.json).toEqual(NEW_SEED)
    const after = api.handleRequest(makeRequest({ path: "/api/seeds" })).json as {
      id: string
    }[]
    expect(after).toHaveLength(INITIAL_SEEDS.length + 1)
    expect(after.some((s) => s.id === NEW_SEED.id)).toBe(true)
  })

  it("POST 请求体缺种子必填字段 → 400 错误约定", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({ method: "POST", path: "/api/seeds", body: { id: "x" } }),
    )
    expect(res.status).toBe(400)
    expect((res.json as { error: { code: string } }).error.code).toBe("BAD_REQUEST")
  })
})

describe("server/registryApi · 错误约定与回环防护（06 §1.1/§2）", () => {
  it("未知 /api 路径 → 404 错误约定", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/api/nope" }))
    expect(res.status).toBe(404)
    expect((res.json as { error: { code: string } }).error.code).toBe("NOT_FOUND")
  })

  it("非 /api 前缀路径 → 404（插件仅桥接 /api 面）", () => {
    const res = createRegistryApi().handleRequest(makeRequest({ path: "/services" }))
    expect(res.status).toBe(404)
  })

  it("非回环 Host → 403 拒绝（API 面回环 only）", () => {
    const res = createRegistryApi().handleRequest(
      makeRequest({ path: "/api/services", host: "evil.example:8443" }),
    )
    expect(res.status).toBe(403)
    expect((res.json as { error: { code: string } }).error.code).toBe("FORBIDDEN")
  })

  it("localhost 与 [::1] 回环放行", () => {
    const api = createRegistryApi()
    expect(api.handleRequest(makeRequest({ host: "localhost:8443" })).status).toBe(200)
    expect(api.handleRequest(makeRequest({ host: "[::1]:8443" })).status).toBe(200)
  })
})
