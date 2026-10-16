/**
 * file: vitest.config.ts
 * description: Vitest 配置 · jsdom 冒烟测试环境
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [config],[test],[vitest]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Vitest 配置 · jsdom 冒烟测试环境
 *
 * dependencies: vitest/config, @vitejs/plugin-react, node:path
 * exports: —
 */
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Vitest 配置 — 冒烟测试（jsdom 环境）
// tsconfig jsx=preserve 仅供 Next 管线；vitest 由 @vitejs/plugin-react 以
// automatic 运行时转译 JSX（与原 react-jsx 行为等价），双管线互不侵扰
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "server/**/*.test.ts"],
    // P5-1 覆盖率门禁：核心逻辑层（domains/adapters/kernel/app 逻辑面/server BFF）
    // 参与统计；views/components 走门禁测试静态扫描，不纳入行覆盖口径；
    // fixtures（纯数据夹具）与类型 barrel 不参与统计
    coverage: {
      provider: "v8",
      include: [
        "src/domains/**",
        "src/adapters/**",
        "src/kernel/**",
        "src/app/usecases/**",
        "src/app/composition.ts",
        "src/app/useProductionData.ts",
        "src/app/useOpsTelemetry.ts",
        "server/**",
      ],
      exclude: ["src/adapters/memory/fixtures/**"],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
      },
    },
  },
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
