/**
 * file: playwright.config.ts
 * description: YYC³ E2E — Playwright 配置（webServer 复用 pnpm dev:3031，perf 契约断言）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [config],[playwright],[e2e],[perf]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 运行时健康门禁（P0-1）— e2e/perf.spec.ts 断言错误率 ≤1%、
 *        导航 p95 <2s、长任务 p95 ≤50ms；webServer 复用既有 dev 服务
 *        （端口 3031，reuseExistingServer），不与团端口径冲突。
 *
 * dependencies: @playwright/test
 * exports: default (config)
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3031" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3031",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
