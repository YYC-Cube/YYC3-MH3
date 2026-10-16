/**
 * file: playwright.offline.config.ts
 * description: YYC³ 离线 e2e 配置 — 服务 out/ 生产产物（SW 仅生产注册）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [config],[playwright],[offline]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-5 + P0-1 — offline.spec.ts 与 perf.spec.ts 专配：webServer 拉起
 *        out/ 生产产物（e2e/offline-server.mjs @4173）。生产环境 =
 *        NODE_ENV production → SW 真实注册 + 无 dev 编译抖动 → 离线兜底
 *        与长任务/p95 预算断言均对真实产物负责。CI 需先构建（脚本内置）。
 *
 * dependencies: @playwright/test
 * exports: default (config)
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "node e2e/offline-server.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
