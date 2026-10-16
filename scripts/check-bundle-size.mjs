/**
 * file: scripts/check-bundle-size.mjs
 * description: YYC³ 构建产物体积预算门禁（P5-2）— 扫描静态导出 out/ 产物并对照预算
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [script],[gate],[size-budget],[p5]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 体积预算门禁 — 统计 out/ 静态导出产物（JS / CSS / HTML 总量与最大单
 *        JS chunk），任一越线即非零退出阻断发布。预算取 2026-10-16 基线
 *        （JS 1032KB / CSS 384KB / HTML 901KB / 最大 chunk 235KB）+ 约 25% 余量；
 *        有意扩容时先跑 `pnpm build` 复核新基线并在此处留注调整。
 *
 * dependencies: node:fs, node:path（零第三方依赖）
 * exports: —（命令行入口，`pnpm check:size`）
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** 产物根目录（next.config.ts output:"export" 默认 out/） */
const OUT_DIR = "out";

/** 预算表（字节）：基线 +25% 余量；单项越线即失败 */
const BUDGETS = {
  /** 全部 JS chunk 总量（基线 1032KB） */
  totalJsBytes: 1_310_720,
  /** 最大单 JS chunk（基线 235KB，防单包失控） */
  maxJsChunkBytes: 307_200,
  /** 全部 CSS 总量（基线 384KB） */
  totalCssBytes: 491_520,
  /** 全部路由 HTML 总量（基线 901KB，15 路由） */
  totalHtmlBytes: 1_179_648,
};

/** 递归收集文件绝对路径 */
function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const all = walk(OUT_DIR);
const jsFiles = all.filter((f) => f.endsWith(".js"));
const cssFiles = all.filter((f) => f.endsWith(".css"));
const htmlFiles = all.filter((f) => f.endsWith(".html"));

const sum = (files) => files.reduce((acc, f) => acc + statSync(f).size, 0);
const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

const totalJs = sum(jsFiles);
const totalCss = sum(cssFiles);
const totalHtml = sum(htmlFiles);
const maxJs = jsFiles.reduce((max, f) => Math.max(max, statSync(f).size), 0);

const metrics = [
  { name: "JS 总量", value: totalJs, budget: BUDGETS.totalJsBytes },
  { name: "最大单 JS chunk", value: maxJs, budget: BUDGETS.maxJsChunkBytes },
  { name: "CSS 总量", value: totalCss, budget: BUDGETS.totalCssBytes },
  { name: "HTML 总量", value: totalHtml, budget: BUDGETS.totalHtmlBytes },
];

console.log(
  `体积预算门禁：JS ${jsFiles.length} 文件 ${kb(totalJs)} · 最大 chunk ${kb(maxJs)} · CSS ${kb(totalCss)} · HTML ${htmlFiles.length} 页 ${kb(totalHtml)}`,
);

const breaches = metrics.filter((m) => m.value > m.budget);
for (const m of metrics) {
  const mark = m.value > m.budget ? "✗ 越线" : "✓";
  console.log(`  ${mark} ${m.name}: ${kb(m.value)} / 预算 ${kb(m.budget)}`);
}

if (breaches.length > 0) {
  console.error(
    `\n体积预算门禁失败：${breaches.map((m) => m.name).join("、")} 越线。请复核产物构成，或在确认必要后更新 scripts/check-bundle-size.mjs 预算基线。`,
  );
  process.exit(1);
}
console.log("体积预算门禁通过。");
