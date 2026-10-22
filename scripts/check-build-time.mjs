/**
 * file: scripts/check-build-time.mjs
 * description: YYC³ 门禁 — 构建时间预算（实测基线 67.9s，预算 120s，硬失败退出）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [script],[gate],[build-time],[p1]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-4 构建健康 — 构建时间从「无预算无基线」升级为门禁：
 *   用法：`pnpm check:build-time`（内部执行 `next build` 计时后断言）
 *   - 预算 BUILD_TIME_BUDGET_S = 120（2026-10-16 热缓存基线 8.4s × 冷缓存余量）
 *   - 超预算非零退出阻断；输出实测秒数与预算，供评分卡取证
 *
 * dependencies: node:child_process, node:fs
 * exports: —
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

/** 构建时间预算（秒）：2026-10-16 实测基线 8.4s（热缓存），预算留 14 倍冷缓存余量 */
const BUILD_TIME_BUDGET_S = 120;
/** build 产物目录（next.config.ts output:"export" → out/） */
const DIST_DIR = "out";

console.log(`构建时间预算门禁：预算 ${BUILD_TIME_BUDGET_S}s（基线 8.4s 热缓存）`);
const startedAt = Date.now();
try {
  execSync("npx next build", { stdio: "inherit" });
} catch {
  console.error("✗ 构建失败（build 命令非零退出）");
  process.exit(1);
}
const elapsedS = (Date.now() - startedAt) / 1000;

const distDir = fs.existsSync(DIST_DIR) ? DIST_DIR : null;
console.log(`构建完成：${distDir ?? "(无产物目录)"} · 耗时 ${elapsedS.toFixed(1)}s / 预算 ${BUILD_TIME_BUDGET_S}s`);

if (elapsedS > BUILD_TIME_BUDGET_S) {
  console.error(`✗ 超预算：${elapsedS.toFixed(1)}s > ${BUILD_TIME_BUDGET_S}s —— 构建时间门禁阻断`);
  process.exit(1);
}
console.log("构建时间预算门禁通过。");
