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
 * dependencies: vitest/config, @vitejs/plugin-react, @tailwindcss/vite, node:path
 * exports: —
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Vitest 配置 — 冒烟测试（jsdom 环境）
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  },
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
