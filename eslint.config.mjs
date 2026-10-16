/**
 * file: eslint.config.mjs
 * description: YYC³ ESLint 扁平配置 — P1-2 lint 门禁（typescript-eslint + react-hooks + 编排层禁令）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [lint],[eslint],[gate],[p1]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-2 静态质量门禁 — 核心规则面：
 *   - typescript-eslint recommended（no-explicit-any / no-unused-vars 等真实缺陷捕获）
 *   - react-hooks rules-of-hooks + exhaustive-deps（Hooks 时序与依赖数组正确性）
 *   - 范围：src / server / e2e（scripts 构建工具为 node 脚本，另行豁免）
 *   - 门禁：`pnpm check:lint` → 0 error（CI 阻断级）
 *
 * dependencies: eslint, typescript-eslint, eslint-plugin-react-hooks
 */

import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "out/**",
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      ".venv/**",
      "coverage/**",
      "docs/**",
      "scripts/**",
      "public/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "server/**/*.ts", "e2e/**/*.ts"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    rules: {
      // 项目惯例：下划线前缀 = 有意弃用占位（测试替身/未用回调参数）
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // 编排层禁令（PR-5，承接解耦设计 §五）——orchestrator/domains 是纯逻辑层：
    // DOM/存储/网络原语一律封进 adapters（合法 IO 出口）；与 boundary-guard
    // 词面扫描（连注释不豁免）互补，本规则面管标识符引用（编辑器即时反馈）。
    files: ["src/orchestrator/**/*.ts", "src/domains/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "document", message: "编排层禁触 DOM——IO 封进 adapters（解耦设计 §五禁令）" },
        { name: "window", message: "编排层禁触 window——宿主探测在 app 层（agent-runtime/composition）" },
        { name: "localStorage", message: "编排层禁触存储原语——持久化走端口（storage/checkpoint store）" },
        { name: "sessionStorage", message: "编排层禁触存储原语——持久化走端口（storage/checkpoint store）" },
        { name: "fetch", message: "编排层禁触网络原语——外联走 AgentTool/适配器（白名单注入）" },
        { name: "XMLHttpRequest", message: "编排层禁触网络原语——外联走 AgentTool/适配器（白名单注入）" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='WebSocket']",
          message: "编排层禁造 WebSocket——通道实现方为 adapters（队列 SSE/事件桥）",
        },
      ],
    },
  },
);

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
