#!/usr/bin/env node
/**
 * file: scripts/harden-csp.mjs
 * description: YYC³ P2-1 完整 CSP — 构建后处理器 + 门禁（内联脚本 sha256 哈希化）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [csp],[security],[gate],[postbuild],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-1 完整 CSP（评分卡安全维度最后缺口）——
 *   Next 静态导出含内联引导脚本（TURBOPACK push / Flight 数据 __next_f），
 *   源码 CSP 被迫携带 script-src 'unsafe-inline'。本处理器在 `next build`
 *   之后对产物执行：
 *     1. 扫描 out 目录下全部 .html 的内联 script（无 src 属性）→ sha256 哈希全集
 *     2. 重写每页 meta CSP：script-src 'self' <hashes…>（移除 'unsafe-inline'）
 *     3. 重写 out/_headers：同口径 CSP + frame-ancestors 'none' + 安全响应头
 *     4. 门禁校验：产物无 unsafe-inline 且全部内联块被哈希覆盖（失败 exit 1）
 *   默认模式（构建链内）：重写 + 校验；`--check` 模式：仅校验（独立门禁复跑）。
 *
 * dependencies: node:crypto, node:fs/promises, node:path
 * exports: —（CLI）
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** 产物目录（静态导出 Track B） */
const DIST_DIR = path.resolve(process.cwd(), "out");
/** 仅校验模式（不重写产物） */
const CHECK_ONLY = process.argv.includes("--check");

/**
 * 构建期不变指令面（与 layout.tsx 源码 CSP 同构，script-src 由哈希动态合成）。
 * style-src 保留 'unsafe-inline'：React 内联样式属性 + 404 页内联 <style>；
 * 该妥协记录于评分卡「能力边界」（style 注入风险面显著小于 script）。
 */
const CSP_BASE = {
  "default-src": ["'self'"],
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'"],
  "worker-src": ["'self'"],
  "manifest-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

/** meta content 属性 HTML 转义（Next 输出 ' 为 &#x27;） */
function decodeAttr(s) {
  return s.replaceAll("&#x27;", "'").replaceAll("&quot;", '"').replaceAll("&amp;", "&");
}
function encodeAttr(s) {
  return s.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");
}

/** 解析 CSP 字符串为指令 Map（保序） */
function parsePolicy(content) {
  const map = new Map();
  for (const part of content.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...values] = tokens;
    map.set(name.toLowerCase(), values);
  }
  return map;
}

/** 渲染指令 Map 为 CSP 字符串 */
function renderPolicy(map) {
  return [...map.entries()].map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
}

/** 提取 HTML 中全部内联脚本正文（无 src 属性且非空） */
function extractInlineScripts(html) {
  const scripts = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] ?? "";
    const body = m[2] ?? "";
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (body.trim().length === 0) continue;
    scripts.push(body);
  }
  return scripts;
}

/** CSP script-src 哈希源（sha256-base64，脚本原文不含标签） */
function scriptHash(body) {
  return `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`;
}

/** 递归收集产物 HTML 文件 */
async function walkHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walkHtmlFiles(full);
      return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return files.flat();
}

async function main() {
  const htmlFiles = await walkHtmlFiles(DIST_DIR);
  if (htmlFiles.length === 0) {
    console.error(`[csp] 未在 ${DIST_DIR} 找到 HTML 产物（先执行 next build）`);
    process.exit(1);
  }

  /* 1. 全页内联脚本 → 哈希全集（任意页面可加载任意页引导块，取并集最稳） */
  const hashes = new Set();
  const pages = [];
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    for (const body of extractInlineScripts(html)) hashes.add(scriptHash(body));
    pages.push({ file, html });
  }
  const hashList = [...hashes];
  const scriptSrc = ["'self'", ...hashList];

  /* 2. 重写每页 meta CSP（--check 模式只读） */
  const META_RE = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"[^>]*>/i;
  let failure = 0;
  for (const page of pages) {
    const match = page.html.match(META_RE);
    if (!match) {
      console.error(`[csp] ${path.relative(DIST_DIR, page.file)} 缺少 meta CSP（源码 layout.tsx 被改动？）`);
      failure += 1;
      continue;
    }
    const directives = parsePolicy(decodeAttr(match[1] ?? ""));
    directives.set("script-src", scriptSrc);
    const hardenedHtml = CHECK_ONLY
      ? page.html
      : page.html.replace(
          META_RE,
          () => `<meta http-equiv="Content-Security-Policy" content="${encodeAttr(renderPolicy(directives))}"/>`,
        );
    if (!CHECK_ONLY) await writeFile(page.file, hardenedHtml, "utf8");

    /* 4. 门禁校验：本页内联块全部被哈希覆盖且无 unsafe-inline */
    const reloaded = CHECK_ONLY ? page.html : hardenedHtml;
    const metaMatch = reloaded.match(META_RE);
    const policy = parsePolicy(decodeAttr(metaMatch?.[1] ?? ""));
    const declaredScriptSrc = policy.get("script-src") ?? [];
    if (declaredScriptSrc.includes("'unsafe-inline'")) {
      console.error(`[csp] ${path.relative(DIST_DIR, page.file)} script-src 仍含 'unsafe-inline'`);
      failure += 1;
    }
    for (const body of extractInlineScripts(reloaded)) {
      if (!declaredScriptSrc.includes(scriptHash(body))) {
        console.error(`[csp] ${path.relative(DIST_DIR, page.file)} 存在未被哈希覆盖的内联脚本`);
        failure += 1;
      }
    }
    if (policy.has("frame-ancestors")) {
      console.error(
        `[csp] ${path.relative(DIST_DIR, page.file)} meta 不应含 frame-ancestors（浏览器忽略，须由响应头承接）`,
      );
      failure += 1;
    }
  }

  /* 3. 重写 out/_headers（部署层响应头：与 meta 同口径 + frame-ancestors） */
  const headerPolicy = renderPolicy(
    new Map([...Object.entries(CSP_BASE), ["script-src", scriptSrc], ["frame-ancestors", ["'none'"]]]),
  );
  const headersContent = [
    "# YYC³-MH3 · 部署层安全响应头（P2-1 完整 CSP，由 scripts/harden-csp.mjs 构建期生成，勿手改）",
    "/*",
    `  Content-Security-Policy: ${headerPolicy}`,
    "  X-Frame-Options: DENY",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: no-referrer",
    "",
  ].join("\n");
  if (!CHECK_ONLY) await writeFile(path.join(DIST_DIR, "_headers"), headersContent, "utf8");

  /* 4b. 门禁校验：_headers 完整性 */
  const finalHeaders = CHECK_ONLY ? await readFile(path.join(DIST_DIR, "_headers"), "utf8") : headersContent;
  if (!finalHeaders.includes("frame-ancestors 'none'")) {
    console.error("[csp] out/_headers 缺少 frame-ancestors 'none'");
    failure += 1;
  }
  for (const h of hashList) {
    if (!finalHeaders.includes(h)) {
      console.error(`[csp] out/_headers 缺少脚本哈希 ${h.slice(0, 24)}…`);
      failure += 1;
    }
  }

  if (failure > 0) {
    console.error(`[csp] ❌ 门禁未通过：${failure} 处问题（${CHECK_ONLY ? "check 模式" : "已重写产物后校验"}）`);
    process.exit(1);
  }
  console.log(
    `[csp] ✅ 完整 CSP 就绪：${htmlFiles.length} 页 meta 已哈希化，script-src 'self' + ${hashList.length} 内联哈希（无 unsafe-inline），frame-ancestors 'none' 由响应头承接`,
  );
}

main().catch((err) => {
  console.error("[csp] 处理器异常:", err);
  process.exit(1);
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
