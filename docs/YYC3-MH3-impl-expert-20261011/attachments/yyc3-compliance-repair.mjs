#!/usr/bin/env node
/* YYC³ 合规化修复脚本 v1.0.0 — 修复首轮 stamper 缺陷造成的四类问题
 * A. pnpm-lock.yaml（生成物）剥离误注入的标头/标尾
 * B. index.html / 引擎模版.py / template_config.yaml 重复标头/标尾去重（保留首组）
 * C. 全部 MD（含 FM）：updated 刷新 / 必填字段补齐 / 合规化变更行版本与 FM 对齐
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = "/Users/yanyu/YYC-Cube/YYC3-MH3"
const TODAY = "2026-10-11"
const log = []

/* ---------- A. pnpm-lock.yaml 还原 ---------- */
const lock = path.join(ROOT, "pnpm-lock.yaml")
let c = fs.readFileSync(lock, "utf8")
const before = c
const HEAD_RE = /^# ={10,}\n# file: pnpm-lock\.yaml[\s\S]*?# ={10,}\n/
while (HEAD_RE.test(c)) c = c.replace(HEAD_RE, "")
c = c.replace(/\n# -{10,}\n# YYC³ · 言启象限[\s\S]*?# -{10,}\n?$/, "\n")
c = c.replace(/^\n+/, "")
if (c !== before) { fs.writeFileSync(lock, c, "utf8"); log.push("A: pnpm-lock.yaml 已还原") }

/* ---------- B. 三文件去重 ---------- */
function dedupeCommentBlocks(p, headBlockRe, footBlockRe) {
  let s = fs.readFileSync(p, "utf8")
  const orig = s
  /* 标头：保留首个 */
  const heads = [...s.matchAll(headBlockRe)]
  if (heads.length > 1) s = s.replace(heads[1][0], "")
  /* 标尾：保留首个 */
  const foots = [...s.matchAll(footBlockRe)]
  if (foots.length > 1) s = s.replace(foots[foots.length - 1][0], "")
  s = s.replace(/\n{3,}/g, "\n\n")
  if (s !== orig) { fs.writeFileSync(p, s, "utf8"); log.push(`B: ${path.relative(ROOT, p)} 去重完成`) }
}

dedupeCommentBlocks(
  path.join(ROOT, "index.html"),
  /<!-- ={10,}[\s\S]*?={10,} -->\n?/g,
  /<!-- YYC³ · 言启象限[\s\S]*?-->\n?/g,
)
const PY = path.join(ROOT, "docs/YYC3-团队通用-标准规范/YYC3-团队通用-标规文档/YYC3-团队文档-引擎模版.py")
dedupeCommentBlocks(
  PY,
  /# ={10,}\n# file:[\s\S]*?# ={10,}\n/g,
  /# -{10,}\n# YYC³ · 言启象限[\s\S]*?# -{10,}\n?/g,
)
dedupeCommentBlocks(
  path.join(ROOT, "docs/YYC3-团队通用-标准规范/YYC3-团队通用-标规文档/template_config.yaml"),
  /# ={10,}\n# file:[\s\S]*?# ={10,}\n/g,
  /# -{10,}\n# YYC³ · 言启象限[\s\S]*?# -{10,}\n?/g,
)

/* ---------- C. MD FM 规范化 ---------- */
const REQ = { author: "YanYuCloudCube Team <admin@0379.email>", status: "active", language: "zh-CN" }
let mdFixed = 0
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (["node_modules", "dist", ".pnpm-store", ".git", "openclaw", ".env.yyc3-original", "public", ".figma"].includes(e.name)) continue
      walk(p, out)
    } else if (e.name.endsWith(".md")) out.push(p)
  }
  return out
}
for (const p of walk(ROOT)) {
  let s = fs.readFileSync(p, "utf8")
  const fmM = s.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fmM) continue
  let fm = fmM[1]
  const orig = s
  if (!/^updated:/m.test(fm)) fm += `\nupdated: ${TODAY}`
  else fm = fm.replace(/^updated:.*$/m, `updated: ${TODAY}`)
  if (!/^file:/m.test(fm)) fm += `\nfile: ${path.relative(ROOT, p)}`
  for (const [k, v] of Object.entries(REQ)) if (!new RegExp(`^${k}:`, "m").test(fm)) fm += `\n${k}: ${v}`
  if (!/^tags:/m.test(fm)) fm += "\ntags: [YYC3],[文档]"
  if (!/^category:/m.test(fm)) fm += "\ncategory: general"
  s = s.replace(fmM[0], `---\n${fm}\n---`)
  /* 合规化变更行版本与 FM 对齐 */
  const ver = (fm.match(/^version:\s*(v[\d.]+)/m) || [, "v1.0.0"])[1]
  s = s.replace(/^(\| )(v[\d.]+)(\s+\| 2026-10-11\s+\| 标头\/标尾合规化)/m, `$1${ver}$3`)
  if (s !== orig) { fs.writeFileSync(p, s, "utf8"); mdFixed++ }
}
log.push(`C: MD FM 规范化 ${mdFixed} 个`)
console.log(log.join("\n"))
