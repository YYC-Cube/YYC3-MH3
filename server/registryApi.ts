/**
 * file: server/registryApi.ts
 * description: Registry API 本地 BFF — 06 契约 §2 八端点纯函数实现（框架无关，Vite 插件薄壳桥接）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [server],[bff],[registry],[api]
 * category: server
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 本地 Registry API — 端点/字段/错误约定逐字对齐 docs/06-Registry-API-契约.md v1.0.0
 *
 * dependencies: ../src/types, ../src/data/ops, ../src/data/batch, ../src/data/seed
 * exports: RegistryRequest, RegistryResponse, createRegistryApi
 */
import type {
  AlarmItem,
  BatchItem,
  SeedItem,
} from "../src/types"
import { INITIAL_BATCHES } from "../src/data/batch"
import { INITIAL_SEEDS } from "../src/data/seed"
import {
  INITIAL_LOGS,
  OPS_METRICS,
  SERVICES_LIST,
  SYSTEM_ALARMS,
} from "../src/data/ops"

/** 框架无关的请求描述（Vite 插件薄壳负责从 node req 提取） */
export interface RegistryRequest {
  method: string
  /** 含 /api 前缀、不含查询串的路径（如 "/api/services"） */
  path: string
  query: URLSearchParams
  /** 已 JSON.parse 的请求体（无体/解析失败为 undefined，由处理器校验） */
  body?: unknown
  /** Host 请求头原值（回环校验依据，06 §1.1） */
  host: string
}

/** 统一响应：2xx 为契约响应体，非 2xx 为 { error: { code, message } }（06 §2 错误约定） */
export interface RegistryResponse {
  status: number
  json: unknown
}

export interface RegistryApi {
  handleRequest(req: RegistryRequest): RegistryResponse
}

/** JSON 深拷贝出借（与 adapters/memory 同型，杜绝引用泄漏） */
function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** 回环 Host 校验（06 §1.1 本地回环 only）：放行 127.0.0.1 / localhost / ::1（含端口与 IPv6 括号形态） */
function isLoopbackHost(host: string): boolean {
  if (!host) return false
  const hostname = host.startsWith("[")
    ? host.slice(1, host.indexOf("]"))
    : (host.split(":")[0] ?? "")
  return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1"
}

function err(status: number, code: string, message: string): RegistryResponse {
  return { status, json: { error: { code, message } } }
}

function ok(status: number, json: unknown): RegistryResponse {
  return { status, json }
}

/** PATCH /alarms/:id 请求体守卫：必须为 { resolved: boolean } */
function isResolvedBody(body: unknown): body is { resolved: boolean } {
  if (typeof body !== "object" || body === null) return false
  const b = body as Record<string, unknown>
  return typeof b["resolved"] === "boolean"
}

/** POST /seeds 请求体守卫：必填面校验（id/name/seedNumber/tier/params），边界入参校验 */
function isSeedBody(body: unknown): body is SeedItem {
  if (typeof body !== "object" || body === null) return false
  const b = body as Record<string, unknown>
  return (
    typeof b["id"] === "string" &&
    typeof b["name"] === "string" &&
    typeof b["seedNumber"] === "number" &&
    typeof b["tier"] === "string" &&
    typeof b["params"] === "object" &&
    b["params"] !== null
  )
}

/**
 * 创建 Registry API 实例（06 契约 §2 最小面八端点）。
 *
 * 数据源（D3 演示语义）：以 src/data 演示快照为初始态的进程内内存存储，
 * PATCH alarms / POST seeds 可变，进程重启回归快照；持久化归 Registry
 * 真实采集阶段。返回对象均为深拷贝出借。
 */
export function createRegistryApi(): RegistryApi {
  const startedAt = Date.now()
  let alarms: AlarmItem[] = deepCopy(SYSTEM_ALARMS)
  let seeds: SeedItem[] = deepCopy(INITIAL_SEEDS)
  const batches: BatchItem[] = deepCopy(INITIAL_BATCHES)

  const handleRequest = (req: RegistryRequest): RegistryResponse => {
    if (!isLoopbackHost(req.host)) {
      return err(403, "FORBIDDEN", "Registry API 仅接受本地回环访问（06 §1.1）")
    }

    const segments = req.path.split("/").filter(Boolean)
    if (segments[0] !== "api") {
      return err(404, "NOT_FOUND", `未知路径: ${req.path}`)
    }
    const resource = segments[1]
    const id = segments[2]

    switch (resource) {
      /* #1 GET /api/health */
      case "health": {
        if (req.method !== "GET") {
          return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/health 不支持`)
        }
        const sec = Math.floor((Date.now() - startedAt) / 1000)
        const hh = Math.floor(sec / 3600)
        const mm = Math.floor((sec % 3600) / 60)
        const ss = sec % 60
        return ok(200, { status: "online", uptime: `${hh}h ${mm}m ${ss}s` })
      }

      /* #2 GET /api/services */
      case "services": {
        if (req.method !== "GET") {
          return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/services 不支持`)
        }
        return ok(200, deepCopy(SERVICES_LIST))
      }

      /* #3 GET /api/metrics?from=&to= （HH:mm 字典序即时间序，闭区间） */
      case "metrics": {
        if (req.method !== "GET") {
          return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/metrics 不支持`)
        }
        let list = deepCopy(OPS_METRICS)
        const from = req.query.get("from")
        const to = req.query.get("to")
        if (from) list = list.filter((m) => m.time >= from)
        if (to) list = list.filter((m) => m.time <= to)
        return ok(200, list)
      }

      /* #4 GET /api/alarms?resolved= / #5 PATCH /api/alarms/:id */
      case "alarms": {
        if (id) {
          if (req.method !== "PATCH") {
            return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/alarms/:id 不支持`)
          }
          if (!isResolvedBody(req.body)) {
            return err(400, "BAD_REQUEST", "请求体必须为 { resolved: boolean }")
          }
          const target = alarms.find((a) => a.id === id)
          if (!target) {
            return err(404, "NOT_FOUND", `告警不存在: ${id}`)
          }
          target.resolved = req.body.resolved
          return ok(200, deepCopy(target))
        }
        if (req.method !== "GET") {
          return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/alarms 不支持`)
        }
        let list = deepCopy(alarms)
        const resolved = req.query.get("resolved")
        if (resolved !== null) {
          if (resolved !== "true" && resolved !== "false") {
            return err(400, "BAD_REQUEST", "resolved 参数仅接受 true / false")
          }
          const flag = resolved === "true"
          list = list.filter((a) => a.resolved === flag)
        }
        return ok(200, list)
      }

      /* #6 GET /api/logs?stage=&level= */
      case "logs": {
        if (req.method !== "GET") {
          return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/logs 不支持`)
        }
        let list = deepCopy(INITIAL_LOGS)
        const stage = req.query.get("stage")
        const level = req.query.get("level")
        if (stage) list = list.filter((l) => l.stage === stage)
        if (level) list = list.filter((l) => l.level === level)
        return ok(200, list)
      }

      /* #7 GET /api/batches / GET /api/batches/:id（契约仅定义读，创建属运行时 UI 态） */
      case "batches": {
        if (req.method !== "GET") {
          return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/batches 不支持`)
        }
        if (id) {
          const hit = batches.find((b) => b.id === id)
          return hit ? ok(200, deepCopy(hit)) : err(404, "NOT_FOUND", `批次不存在: ${id}`)
        }
        return ok(200, deepCopy(batches))
      }

      /* #8 GET /api/seeds / POST /api/seeds（采纳回写；契约未定义重复 id 语义，按追加处理） */
      case "seeds": {
        if (req.method === "GET") {
          return ok(200, deepCopy(seeds))
        }
        if (req.method === "POST") {
          if (!isSeedBody(req.body)) {
            return err(400, "BAD_REQUEST", "请求体必须为合法 SeedItem（缺必填字段）")
          }
          seeds = [req.body, ...seeds]
          return ok(201, deepCopy(req.body))
        }
        return err(405, "METHOD_NOT_ALLOWED", `${req.method} /api/seeds 不支持`)
      }

      default:
        return err(404, "NOT_FOUND", `未知路径: ${req.path}`)
    }
  }

  return { handleRequest }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
