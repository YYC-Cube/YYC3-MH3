/**
 * file: src/__tests__/offline-guard.test.ts
 * description: 本地优先守卫 · 扫描全源码零公网 URL（回环地址白名单）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [test],[guard],[offline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 断网可用性门禁：任何公网 http(s) 字面量（字体/图片/CDN/API）一律拦截，
 *       仅放行 127.0.0.1 / localhost 回环。契约依据 docs/06-Registry-API-契约.md §1。
 *
 * dependencies: node:fs, node:path, vitest
 * exports: —
 */
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const SRC_ROOT = path.resolve(__dirname, "..") // …/src
const PROJECT_ROOT = path.dirname(SRC_ROOT)
const ALLOWED = /^https?:\/\/(127\.0\.0\.1|localhost|\$\{)/
const SCAN_EXT = /\.(ts|tsx|css|html)$/

/** 递归收集源码文件（排除测试自身与本守卫白名单说明） */
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

describe("[offline-guard] 本地优先 · 零公网 URL", () => {
  const files = collect(SRC_ROOT)

  it("应扫描到实质数量的源码文件（防守卫空转）", () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it("源码中不允许出现公网 http(s) 字面量（回环白名单除外）", () => {
    const violations: string[] = []
    const URL_RE = /https?:\/\/[^\s"'`)]+/g
    for (const f of files) {
      const content = fs.readFileSync(f, "utf8")
      for (const m of content.matchAll(URL_RE)) {
        if (!ALLOWED.test(m[0])) {
          violations.push(`${path.relative(PROJECT_ROOT, f)}: ${m[0]}`)
        }
      }
    }
    expect(violations, ["公网 URL 违规（本地优先红线，见 .env.example 与 docs/06 契约）：", ...violations].join("\n")).toEqual([])
  })
})

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
