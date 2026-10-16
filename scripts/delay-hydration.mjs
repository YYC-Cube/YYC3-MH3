#!/usr/bin/env node
/**
 * file: scripts/delay-hydration.mjs
 * description: YYC³ 第八批 LCP 水合级优化 — 延迟水合加载器构建后处理器（内容优先，islands 式）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [performance],[lcp],[hydration],[postbuild],[gate],[p1]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 第八批候选 2（评分卡 §六）—— 首载 JS 558KB 在 localhost 上全部于观测
 *        首绘（~75ms）前下载完成，Lantern（lighthouse 模拟器）按「完成时刻 ≤
 *        观测 LCP」规则将其全数计入渲染阻塞图，slow-4G 重放得 LCP 6.1-6.4s
 *        （perf 0.73）。实测对照（reports/lighthouse/oneoff-defer*.report.json）：
 *          - defer 化（仅改执行时机）：LCP 6.2s，无改善 —— falsify；
 *          - 延迟水合加载器（改下载起点至 DCL+250ms）：LCP 3.08s、perf 0.90、
 *            水合完整（双视图渲染 + 0 console 错误）—— 采纳。
 *        本处理器在 `next build` 之后对产物执行：
 *          1. 扫描 out 全部 .html 的 <script src="/_next/static/chunks/*.js"
 *             async|defer> 标签（noModule polyfill 排除——现代浏览器本就不加载）
 *          2. 以 chunk 清单 sha256 命名生成共享加载器 out/_next/static/
 *             delay-hydr-<hash>.js（DCL+250ms 后按原序 async=false 注入，
 *             并行预取、串行执行，保持 Next chunk 间依赖序）
 *          3. 原位替换为单个 <script src="…/delay-hydr-<hash>.js" defer>
 *          4. 移除指向延迟 chunk 的 <link rel="preload" as="script">（加载器
 *             接管后 preload 只会污染首绘窗口，实测 43aa 30KB 滞留图内）
 *          5. 门禁校验：每页替换计数一致、无残留未延迟 chunk 标签、加载器
 *             文件落盘（失败 exit 1）
 *        CSP 相容性：加载器为外链脚本（script-src 'self' 覆盖），不新增内联
 *        块，harden-csp.mjs 哈希面不变；本处理器须先于 harden-csp 执行。
 *
 * dependencies: node:crypto, node:fs/promises, node:path
 * exports: —（CLI）
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** 产物目录（静态导出 Track B） */
const DIST_DIR = path.resolve(process.cwd(), "out");

/** chunk 脚本标签（src 前置 + async/defer 带值后置，Next 16 Turbopack 产物实测格式） */
const SCRIPT_TAG_RE = /<script src="(\/_next\/static\/chunks\/[^"]+\.js)" (?:async|defer)=""><\/script>/g;
/** 指向延迟 chunk 的 preload 链接（fetchPriority 属性序不定，按链接整体匹配后过滤 href） */
const PRELOAD_LINK_RE = /<link[^>]*rel="preload"[^>]*as="script"[^>]*\/>/g;

/** 延迟水合加载器正文（实验实测口径：DCL+250ms，原序 async=false 注入） */
function renderLoader(chunkNames) {
  const list = JSON.stringify(chunkNames);
  return `(function(){var B="/_next/static/chunks/",C=${list};
function s(){var f=document.createDocumentFragment();for(var i=0;i<C.length;i++){var e=document.createElement("script");e.src=B+C[i];e.async=false;f.appendChild(e);}document.head.appendChild(f);}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){setTimeout(s,250);});}else{setTimeout(s,250);}})();`;
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
    console.error(`[delay-hydr] 未在 ${DIST_DIR} 找到 HTML 产物（先执行 next build）`);
    process.exit(1);
  }

  /** chunk 清单 → { name, body } 共享加载器缓存（同清单页共用同一文件） */
  const loaders = new Map();
  let failure = 0;
  let processed = 0;
  let skipped = 0;
  let removedPreloads = 0;

  for (const file of htmlFiles) {
    const rel = path.relative(DIST_DIR, file);
    let html = await readFile(file, "utf8");

    /* 幂等：已处理的页跳过（重复执行构建后链时不二次改写） */
    if (html.includes("/_next/static/delay-hydr-")) {
      skipped += 1;
      continue;
    }

    /* 1. 提取延迟目标标签（保序去重） */
    const tags = [...html.matchAll(SCRIPT_TAG_RE)].map((m) => m[0]);
    if (tags.length === 0) {
      /* 无 chunk 标签的页（如 404 变体）无需处理 */
      skipped += 1;
      continue;
    }
    const chunkNames = [...new Set(tags.map((t) => t.match(/chunks\/([^"]+\.js)"/)?.[1]).filter(Boolean))];
    if (chunkNames.length !== tags.length) {
      console.error(`[delay-hydr] ${rel} 存在无法解析的 chunk 标签（格式漂移？）`);
      failure += 1;
      continue;
    }

    /* 2. 生成/复用共享加载器 */
    const digest = createHash("sha256").update(chunkNames.join("|"), "utf8").digest("hex").slice(0, 10);
    const loaderName = `delay-hydr-${digest}.js`;
    if (!loaders.has(loaderName)) {
      loaders.set(loaderName, renderLoader(chunkNames));
    }

    /* 3. 原位替换：首个标签位置换成加载器，其余删除 */
    const loaderTag = `<script src="/_next/static/${loaderName}" defer=""></script>`;
    let replaced = 0;
    html = html.replace(SCRIPT_TAG_RE, () => (replaced++ === 0 ? loaderTag : ""));
    if (replaced !== tags.length) {
      console.error(`[delay-hydr] ${rel} 替换计数不符（${replaced}/${tags.length}）`);
      failure += 1;
      continue;
    }

    /* 4. 移除指向延迟 chunk 的 script preload（加载器接管下载时机） */
    html = html.replace(PRELOAD_LINK_RE, (link) => {
      if (!link.includes("/_next/static/chunks/")) return link;
      removedPreloads += 1;
      return "";
    });

    /* 5. 门禁自检：无残留未延迟 chunk 标签、加载器标签就位
     * （残留检测用无 g 标志的独立正则——全局正则被 test 命中后会推进 lastIndex，
     *  污染下一页的 matchAll 起点而静默漏检） */
    const residual = new RegExp(SCRIPT_TAG_RE.source);
    if (residual.test(html)) {
      console.error(`[delay-hydr] ${rel} 仍残留未延迟的 chunk script 标签`);
      failure += 1;
      continue;
    }
    if (!html.includes(loaderTag)) {
      console.error(`[delay-hydr] ${rel} 加载器标签缺失`);
      failure += 1;
      continue;
    }
    await writeFile(file, html, "utf8");
    processed += 1;
  }

  /* 加载器文件落盘（路径 out/_next/static/ 与 chunk 同域，'self' CSP 直接过） */
  for (const [name, body] of loaders) {
    await writeFile(path.join(DIST_DIR, "_next", "static", name), body, "utf8");
  }

  if (failure > 0) {
    console.error(`[delay-hydr] ❌ 门禁未通过：${failure} 页异常（processed=${processed} skipped=${skipped}）`);
    process.exit(1);
  }
  console.log(
    `[delay-hydr] ✅ 延迟水合就绪：${processed} 页改写（${skipped} 页跳过），${loaders.size} 个共享加载器（DCL+250ms 原序注入），移除 script preload ${removedPreloads} 条`,
  );
}

main().catch((err) => {
  console.error("[delay-hydr] 处理器异常:", err);
  process.exit(1);
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
