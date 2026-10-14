#!/usr/bin/env node
/* ============================================================
 * YYC³ 标头/标尾合规化批处理 · Header & Footer Compliance Stamper
 * ------------------------------------------------------------
 * file        : docs/YYC3-MH3-impl-expert-20261011/attachments/yyc3-header-stamper.mjs
 * description : 依据团队规范为全局代码与文档统一注入标头/标尾（幂等）
 * author      : YanYuCloudCube Team
 * version     : v1.1.0
 * created     : 2026-10-11
 * updated     : 2026-10-11
 * status      : active
 * tags        : [tool],[compliance],[traceability]
 *
 * 依据规范:
 * - 《YYC3-团队规范-开发标准》 1.1/1.9/2.4-2.7（FM 必填字段、变更历史、JSDoc 标头）
 * - 《YYC3-团队规范-文档闭环》 文档元数据规范与品牌标尾
 *
 * 幂等设计: 重复执行不重复注入（检测既有标头/标尾/铭牌/变更历史）
 * v1.1.0 修复:
 * - stampMd 品牌路径 FM 回退 bug（误用 fmMatch[1] 丢弃字段更新）
 * - 无结构变更时跳过 FM 重写（避免版本无谓递增）
 * - html/py/yaml 标头按语言检测（修复重复注入）
 * - walk 跳过生成物 pnpm-lock.yaml
 * - codeFacts 导出符号优先 function/const/class，回退 interface/type
 * ============================================================ */
import fs from "node:fs"
import path from "node:path"

const ROOT = "/Users/yanyu/YYC-Cube/YYC3-MH3"
const TODAY = "2026-10-11"
const AUTHOR = "YanYuCloudCube Team <admin@0379.email>"
const AUTHOR_SHORT = "YanYuCloudCube Team"
const REPORT_PATH = path.join(
  ROOT,
  "docs/YYC3-MH3-impl-expert-20261011/attachments/header-footer-report.json",
)

/* 外部内容/生成物/二进制一律不动 */
const SKIP_DIRS = new Set([
  "node_modules", "dist", ".pnpm-store", ".git", ".figma", "public",
  "openclaw", ".env.yyc3-original", "attachments",
])

const stats = {
  scanned: 0, mdHeaderNew: 0, mdHeaderUpdated: 0, brandAdded: 0,
  historyAdded: 0, codeHeaderAdded: 0, footerAdded: 0, unchanged: 0,
  byType: {}, files: [],
}

const pad = (n) => String(n).padStart(2, "0")
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const rel = (p) => path.relative(ROOT, p)

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue
      walk(p, out)
    } else if (e.name !== "pnpm-lock.yaml" && /\.(md|ts|tsx|css|html|py|yaml|yml)$/.test(e.name)) out.push(p)
  }
  return out
}

/* ---------------- Markdown ---------------- */
const BRAND_QUOTE = [
  "> ***YanYuCloudCube***",
  "> *言启象限 | 语枢未来*",
  "> ***Words Initiate Quadrants, Language Serves as Core for Future***",
  "> *万象归元于云枢 | 深栈智启新纪元*",
  "> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***",
].join("\n")

const MD_FOOTER = [
  "",
  "---",
  "",
  '<div align="center">',
  "",
  "> 「***YanYuCloudCube***」",
  "> 「***<admin@0379.email>***」",
  "> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」",
  "> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」",
  "",
  "**© 2025-2026 YanYuCloudCube™. All Rights Reserved.**",
  "",
  "</div>",
].join("\n")

function mdCategory(p, name) {
  if (/SECURITY|CONDUCT|规范|标准|公约|政策|闭环/.test(name)) return "policy"
  if (/CONTRIBUTING|指南|Guide/.test(name)) return "guide"
  if (p.includes("标准规范")) return "policy"
  return "general"
}

function mdTags(p, name) {
  if (/SECURITY/.test(name)) return "[YYC3],[安全]"
  if (/CONDUCT|公约/.test(name)) return "[YYC3],[行为准则]"
  if (/CONTRIBUTING|指南/.test(name)) return "[YYC3],[贡献指南]"
  if (/README/.test(name)) return "[YYC3],[文档],[总览]"
  if (p.includes("标准规范")) return "[YYC3],[规范],[标准]"
  return "[YYC3],[文档]"
}

function stampMd(p) {
  const st = fs.statSync(p)
  const created = fmt(st.birthtime)
  let c = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "")
  const name = path.basename(p)
  const acts = []

  const fmMatch = c.match(/^---\r?\n([\s\S]*?)\r?\n---\s*\n?/)
  const headWin = c.slice(0, 2400)
  const hasBrand = /言启象限|YanYuCloudCube\*\*\*/.test(headWin)
  const hasHistory = /变更历史|版本历史/.test(c)
  const hasFooter = /All Rights Reserved|converge in cloud pivot/.test(c.slice(-1200))
  let out = c

  if (fmMatch) {
    const bodyRaw = c.slice(fmMatch[0].length)
    const body = bodyRaw.replace(/^\s+/, "")
    let fm = fmMatch[1]
    let fmChanged = false
    /* 仅在存在结构变更（铭牌/历史/标尾缺失）时刷新 updated 与版本递增（规范 1.9） */
    if (!hasBrand || !hasHistory || !hasFooter) {
      if (!/^updated:/m.test(fm)) fm += `\nupdated: ${TODAY}`
      else fm = fm.replace(/^updated:.*$/m, `updated: ${TODAY}`)
      fm = fm.replace(/^version:\s*v?(\d+)\.(\d+)\.(\d+)(?!\.\d)/m, (_m, a, b, d) => `version: v${a}.${b}.${Number(d) + 1}`)
      fmChanged = true
    }
    /* 补齐缺失必填字段（规范 1.3） */
    const need = [
      ["file", rel(p)], ["author", AUTHOR], ["status", "active"],
      ["category", mdCategory(p, name)], ["language", "zh-CN"], ["tags", mdTags(p, name)],
    ]
    for (const [k, v] of need) if (!new RegExp(`^${k}:`, "m").test(fm)) { fm += `\n${k}: ${v}`; fmChanged = true }
    if (fmChanged || !hasBrand || body !== bodyRaw) {
      let head = `---\n${fm}\n---\n\n`
      if (!hasBrand) head += `${BRAND_QUOTE}\n\n---\n\n`
      out = head + body
      stats.mdHeaderUpdated++
      acts.push("fmUpdated")
      if (!hasBrand) { stats.brandAdded++; acts.push("brandAdded") }
    }
  } else {
    const h1 = c.match(/^#\s+(.+)$/m)
    let desc = h1 ? h1[1].replace(/[*_`#]/g, "").trim().slice(0, 50) : name
    if (!desc) desc = name
    out = [
      "---",
      `file: ${rel(p)}`,
      `description: ${desc}`,
      `author: ${AUTHOR}`,
      "version: v1.0.0",
      `created: ${created}`,
      `updated: ${TODAY}`,
      "status: active",
      `tags: ${mdTags(p, name)}`,
      `category: ${mdCategory(p, name)}`,
      "language: zh-CN",
      "---",
      "",
      BRAND_QUOTE,
      "",
      "---",
      "",
    ].join("\n") + "\n" + c
    acts.push("fmCreated")
    stats.mdHeaderNew++
    stats.brandAdded++
    acts.push("brandAdded")
  }

  /* 变更历史（规范 1.9） */
  const ver = (out.match(/^version:\s*(v[\d.]+)/m) || [, "v1.0.0"])[1]
  let hist = ""
  if (!hasHistory) {
    hist = [
      "---",
      "",
      "## 变更历史",
      "",
      "| 版本   | 日期       | 变更内容                               | 作者                |",
      "| ------ | ---------- | -------------------------------------- | ------------------- |",
      `| ${ver} | ${TODAY} | 标头/标尾合规化，对齐团队规范（可追溯） | ${AUTHOR_SHORT} |`,
      "",
    ].join("\n")
    stats.historyAdded++
    acts.push("historyAdded")
  }

  /* 标尾版权块 */
  let footer = ""
  if (!hasFooter) {
    footer = MD_FOOTER
    stats.footerAdded++
    acts.push("footerAdded")
  }

  if (!acts.length) { stats.unchanged++; return acts }
  const next = `${out.replace(/\s*$/, "\n")}${hist ? "\n" + hist : ""}${footer}\n`
  if (next !== c) fs.writeFileSync(p, next, "utf8")
  else stats.unchanged++
  return acts
}

/* ---------------- 代码 ---------------- */
const DIR_LABELS = [
  ["src/components/common", "YYC³ 基础通用组件", "[component],[ui],[yyc3]"],
  ["src/components/navigation", "YYC³ 导航组件", "[component],[navigation],[yyc3]"],
  ["src/components/pipeline", "YYC³ 五步闭环流水线组件", "[component],[pipeline],[yyc3]"],
  ["src/components/yyc3", "YYC³ AI Family 协同组件", "[component],[ai-family],[yyc3]"],
  ["src/views", "YYC³ 功能视图", "[component],[view],[yyc3]"],
  ["src/data", "YYC³ 领域数据与档案", "[data],[yyc3]"],
  ["src/types", "YYC³ 全局类型定义", "[type],[yyc3]"],
  ["src/test", "YYC³ 测试设施", "[test],[setup]"],
  ["src/__tests__", "YYC³ 冒烟测试用例", "[test],[smoke]"],
  ["src", "YYC³ 应用核心", "[core],[entry],[yyc3]"],
]
const SPECIAL_DESC = {
  "src/App.tsx": ["应用根组件 · 视图路由/全局状态/快捷键中枢", "[core],[entry],[yyc3]"],
  "src/main.tsx": ["React 应用入口 · 挂载根组件与全局样式", "[core],[entry],[yyc3]"],
  "src/index.css": ["全局样式 · Tailwind v4 DS Tokens 主题与自托管字体", "[style],[theme],[global]"],
  "src/types/index.ts": ["全局类型唯一来源 · 领域模型与 UI 契约", "[type],[yyc3]"],
  "src/data/mockData.ts": ["领域模拟数据 · 批次/种子/Agent 工作流节点", "[data],[mock],[yyc3]"],
  "src/data/yyc3Data.ts": ["YYC³ AI Family 八位家人档案数据", "[data],[ai-family],[yyc3]"],
  "vite.config.ts": ["Vite 构建配置 · React/Tailwind 插件与 @ 别名", "[config],[build],[vite]"],
  "vitest.config.ts": ["Vitest 配置 · jsdom 冒烟测试环境", "[config],[test],[vitest]"],
  "index.html": ["Vite HTML 外壳 · 应用挂载点与全端图标引用", "[config],[entry],[html]"],
}

function codeFacts(p, c) {
  const r = rel(p)
  if (SPECIAL_DESC[r]) {
    const [description, tags] = SPECIAL_DESC[r]
    return { description, tags }
  }
  const hit = DIR_LABELS.find(([d]) => r.startsWith(d)) || ["", "YYC³ 模块", "[yyc3]"]
  /* 优先可执行/可实例化符号，回退类型契约（v1.1.0 修复描述取到 *Props） */
  const sym = c.match(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|enum)\s+([A-Za-z0-9_]+)/)
    || c.match(/export\s+(?:default\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)/)
  const description = sym ? `${hit[1]} — ${sym[1]}` : hit[1]
  return { description: description.slice(0, 50), tags: hit[2] }
}

function stampCode(p, kind) {
  const st = fs.statSync(p)
  const created = fmt(st.birthtime)
  const c = fs.readFileSync(p, "utf8")
  const name = path.basename(p)
  const r = rel(p)
  const headWin = c.slice(0, 500)
  const acts = []

  /* 幂等检测：按语言识别既有标头（v1.1.0 修复 html/py/yaml 漏检重复注入） */
  const hasHeader =
    kind === "html" ? (/<!--/.test(headWin) && /file:\s/.test(headWin))
      : kind === "py" || kind === "yaml" ? (/^# file:\s/m.test(headWin))
        : (/\/\*/.test(headWin) && /file:\s/.test(headWin))
  if (hasHeader) { stats.unchanged++; return [] }

  const { description, tags } = codeFacts(p, c)
  const deps = [...new Set([...c.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]))].slice(0, 4).join(", ") || "—"
  const exps = [...new Set([
    ...[...c.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]),
  ])].slice(0, 5).join(", ") || "—"

  let header
  let footer
  if (kind === "html") {
    header = [
      "<!-- ============================================================",
      `     file: ${r}`,
      `     description: ${description}`,
      `     author: ${AUTHOR_SHORT}`,
      "     version: v1.0.0",
      `     created: ${created}`,
      `     updated: ${TODAY}`,
      "     status: active",
      `     tags: ${tags}`,
      "",
      "     copyright: YanYuCloudCube Team",
      "     license: MIT",
      "============================================================ -->",
      "",
    ].join("\n")
    footer = [
      "",
      "  <!-- YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元",
      `       ${MOTTO_EN2} -->`,
      "",
      "  <!-- © 2025-2026 YanYuCloudCube Team. All Rights Reserved. -->",
    ].join("\n")
  } else if (kind === "py" || kind === "yaml") {
    header = [
      "# ============================================================",
      `# file: ${r}`,
      `# description: ${description}`,
      `# author: ${AUTHOR_SHORT}`,
      " # version: v1.0.0".replace(" # ", "# "),
      `# created: ${created}`,
      `# updated: ${TODAY}`,
      "# status: active",
      `# tags: ${tags}`,
      "#",
      "# copyright: YanYuCloudCube Team",
      "# license: MIT",
      "# ============================================================",
      "",
    ].join("\n")
    footer = [
      "",
      "# --------------------------------------------------------------",
      "# YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元",
      "# Words Initiate Quadrants, Language Serves as Core for Future",
      "# © 2025-2026 YanYuCloudCube Team. All Rights Reserved.",
      "# --------------------------------------------------------------",
    ].join("\n")
  } else {
    header = [
      "/**",
      ` * file: ${r}`,
      ` * description: ${description}`,
      ` * author: ${AUTHOR_SHORT}`,
      " * version: v1.0.0",
      ` * created: ${created}`,
      ` * updated: ${TODAY}`,
      " * status: active",
      ` * tags: ${tags}`,
      " *",
      " * copyright: YanYuCloudCube Team",
      " * license: MIT",
      " *",
      ` * brief: ${description}`,
      " *",
      ` * dependencies: ${deps}`,
      ` * exports: ${exps}`,
      " */",
      "",
    ].join("\n")
    footer = [
      "",
      "/* --------------------------------------------------------------",
      " * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元",
      " * Words Initiate Quadrants, Language Serves as Core for Future",
      " * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.",
      " * -------------------------------------------------------------- */",
      "",
    ].join("\n")
  }

  let next
  if (kind === "html") {
    const dt = c.match(/^<!DOCTYPE html>.*$/im)
    next = dt
      ? c.replace(dt[0], `${dt[0]}\n${header}`)
      : header + c
    if (/<\/body>/i.test(c)) next = next.replace(/<\/body>/i, `${footer}\n</body>`)
    else next += footer
  } else {
    next = header + c
    if (!/All Rights Reserved|converge in cloud pivot/.test(c.slice(-800))) next += footer
  }

  fs.writeFileSync(p, next, "utf8")
  stats.codeHeaderAdded++
  stats.footerAdded++
  acts.push("codeHeaderAdded", "footerAdded")
  return acts
}

/* ---------------- main ---------------- */
const MOTTO_EN2 = "Words Initiate Quadrants, Language Serves as Core for Future"
const files = walk(ROOT)
stats.scanned = files.length

for (const p of files) {
  const ext = path.extname(p)
  let kind = null
  if (ext === ".md") kind = "md"
  else if (ext === ".tsx" || ext === ".ts" || ext === ".css") kind = "code"
  else if (ext === ".html") kind = "html"
  else if (ext === ".py") kind = "py"
  else if (ext === ".yaml" || ext === ".yml") kind = "yaml"
  stats.byType[kind] = (stats.byType[kind] || 0) + 1

  try {
    const acts =
      kind === "md" ? stampMd(p)
        : kind === "code" ? stampCode(p, "code")
          : kind === "html" ? stampCode(p, "html")
            : kind === "py" ? stampCode(p, "py")
              : kind === "yaml" ? stampCode(p, "yaml")
                : []
    if (acts.length) stats.files.push({ file: rel(p), actions: acts })
  } catch (err) {
    stats.files.push({ file: rel(p), actions: ["ERROR"], error: String(err) })
  }
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(stats, null, 2), "utf8")
console.log("=== YYC³ 标头/标尾合规化报告 ===")
console.log(`扫描文件: ${stats.scanned}`)
console.log(`MD 新建 FM: ${stats.mdHeaderNew} | MD 更新 FM: ${stats.mdHeaderUpdated}`)
console.log(`品牌铭牌补注: ${stats.brandAdded} | 变更历史补注: ${stats.historyAdded}`)
console.log(`代码标头注入: ${stats.codeHeaderAdded} | 标尾注入: ${stats.footerAdded} | 无需变更: ${stats.unchanged}`)
console.log(`类型分布: ${JSON.stringify(stats.byType)}`)
console.log(`错误数: ${stats.files.filter((f) => f.actions.includes("ERROR")).length}`)
console.log(`报告: ${rel(REPORT_PATH)}`)
