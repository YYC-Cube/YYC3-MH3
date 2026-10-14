/**
 * file: src/__tests__/boundary-guard.test.ts
 * description: 边界门禁 · 六域分层依赖静态检查（import 方向矩阵零越界）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[guard],[boundary],[architecture],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 架构分层门禁（PR-8 固化，offline-guard 同型持久闸门）：
 *       依赖方向必须自上而下单向 —— 叶层（types/config）零内部依赖，
 *       domains/data 仅依赖 types，adapters 可及 domains/data，
 *       components/views 不得触达 adapters/app，app 为组合根唯一 DI 点（06 §4）。
 *       越界 import（含动态 import 与 re-export）一律拦截。
 *
 *       分层矩阵（键 = 所在层，值 = 允许引用的内部层；同层互引天然放行）：
 *         types      → —                          （叶：类型契约）
 *         config     → —                          （叶：构建期注入常量）
 *         domains    → types                      （纯域函数 + 出站端口）
 *         data       → types                      （静态演示快照）
 *         adapters   → types + domains + data + config（memory 适配器；config 为 local 适配器演进预留）
 *         components → types + domains + data + config（UI 区块，禁触 adapters/app/views）
 *         views      → components 及以下            （页面编排壳，禁触 adapters/app）
 *         app        → 全下层层 + adapters          （hooks 装配 + 组合根，禁触 views）
 *         根（App.tsx/main.tsx）不设限（仅入口消费，不在扫描范围）
 *
 * dependencies: node:fs, node:path, vitest
 * exports: —
 */
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const SRC_ROOT = path.resolve(__dirname, "..") // …/src
const PROJECT_ROOT = path.dirname(SRC_ROOT)
const SCAN_EXT = /\.(ts|tsx)$/

/** 分层根目录（目录层；config 为单文件叶） */
const LAYER_DIRS: Readonly<Record<string, string>> = {
  types: "types",
  domains: "domains",
  data: "data",
  adapters: "adapters",
  components: "components",
  views: "views",
  app: "app",
}
const CONFIG_LEAF = path.join(SRC_ROOT, "config.ts")

/** 依赖方向矩阵：键 = 所在层，值 = 允许引用的内部层（跨层方向铁律，同层放行） */
const ALLOWED: Readonly<Record<string, readonly string[]>> = {
  types: [],
  config: [],
  domains: ["types"],
  data: ["types"],
  adapters: ["types", "domains", "data", "config"],
  components: ["types", "domains", "data", "config"],
  views: ["types", "domains", "data", "config", "components"],
  app: ["types", "domains", "data", "config", "components", "adapters"],
}

/** 判定单条依赖边是否越界（纯函数，供检测器自证用例） */
function isEdgeViolation(fromLayer: string, toLayer: string): boolean {
  return fromLayer !== toLayer && !ALLOWED[fromLayer]?.includes(toLayer)
}

/** TS 模块解析候选：显式扩展名 / 省略扩展名 / 目录 index（对齐 tsc 解析语义） */
function resolveCandidates(absPath: string): string[] {
  return [
    absPath,
    `${absPath}.ts`,
    `${absPath}.tsx`,
    path.join(absPath, "index.ts"),
    path.join(absPath, "index.tsx"),
  ]
}

/** 按路径解析所在层；未纳入分层的内部文件返回 null */
function layerOf(absPath: string): string | null {
  for (const cand of resolveCandidates(absPath)) {
    if (cand === CONFIG_LEAF) return "config"
    for (const [layer, dir] of Object.entries(LAYER_DIRS)) {
      const root = path.join(SRC_ROOT, dir)
      if (cand === root || cand.startsWith(root + path.sep)) return layer
    }
  }
  return null
}

/** 递归收集源码文件（排除测试目录） */
function collect(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === "__tests__" || e.name === "node_modules") continue
      collect(p, out)
    } else if (SCAN_EXT.test(e.name)) out.push(p)
  }
  return out
}

/** 提取文件内全部内部相对导入说明符（静态 import/export-from + 动态 import()） */
const STATIC_RE = /^\s*(?:import|export)\b[^;]*?from\s*["'](\.[^"']+)["']/gm
const DYNAMIC_RE = /\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g

function extractInternalSpecs(content: string): string[] {
  // 捕获组索引经 noUncheckedIndexedAccess 推断可空，静态正则组恒存在（PR-2 既有约定：非空断言 + 中文注释）
  const capture = (m: RegExpMatchArray): string => m[1] as string
  return [
    ...[...content.matchAll(STATIC_RE)].map(capture),
    ...[...content.matchAll(DYNAMIC_RE)].map(capture),
  ]
}

describe("[boundary-guard] 六域分层 · 依赖方向零越界", () => {
  const allFiles = collect(SRC_ROOT)
  const layeredFiles = allFiles
    .map((f) => ({ file: f, layer: layerOf(f) }))
    .filter((x): x is { file: string; layer: string } => x.layer !== null)

  it("矩阵完备性：允许集与分层键一一对应（防新层遗漏失察）", () => {
    const expected = [...Object.keys(LAYER_DIRS), "config"].sort()
    expect(Object.keys(ALLOWED).sort()).toEqual(expected)
  })

  it("检测器自证：样例边判定方向正确（防矩阵写反全禁或全放）", () => {
    // 违规样例：下层反向依赖上层
    expect(isEdgeViolation("domains", "app")).toBe(true)
    expect(isEdgeViolation("adapters", "components")).toBe(true)
    expect(isEdgeViolation("components", "views")).toBe(true)
    expect(isEdgeViolation("views", "app")).toBe(true)
    expect(isEdgeViolation("data", "domains")).toBe(true)
    // 合法样例：自上而下单向依赖与同层互引
    expect(isEdgeViolation("app", "adapters")).toBe(false)
    expect(isEdgeViolation("views", "components")).toBe(false)
    expect(isEdgeViolation("adapters", "domains")).toBe(false)
    expect(isEdgeViolation("components", "components")).toBe(false)
  })

  it("应扫描到实质数量的分层文件与依赖边（防守卫空转）", () => {
    expect(layeredFiles.length).toBeGreaterThan(40)
    const edgeCount = layeredFiles.reduce(
      (n, x) => n + extractInternalSpecs(fs.readFileSync(x.file, "utf8")).length,
      0,
    )
    expect(edgeCount).toBeGreaterThan(50)
  })

  it("跨层 import 全量零越界（矩阵外方向一律拦截）", () => {
    const violations: string[] = []
    for (const { file, layer } of layeredFiles) {
      const content = fs.readFileSync(file, "utf8")
      for (const spec of extractInternalSpecs(content)) {
        const resolved = path.resolve(path.dirname(file), spec)
        const target = layerOf(resolved)
        if (target === null) {
          violations.push(
            `${path.relative(PROJECT_ROOT, file)}: ${spec} → 引用未纳入六域分层的内部文件`,
          )
        } else if (isEdgeViolation(layer, target)) {
          violations.push(
            `${path.relative(PROJECT_ROOT, file)}: ${spec} → ${layer} ⇒ ${target} 越界（矩阵见文件头）`,
          )
        }
      }
    }
    expect(
      violations,
      ["分层依赖越界（架构红线，见 docs/06 §4 组合根唯一 DI 点）：", ...violations].join("\n"),
    ).toEqual([])
  })
})

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
