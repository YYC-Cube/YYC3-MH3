/**
 * file: eslint.config.mjs
 * description: YYC³ ESLint 扁平配置 — P1-2 lint 门禁（typescript-eslint + react-hooks + 编排层禁令 + 安全专项）
 * author: YanYuCloudCube Team
 * version: v1.2.0
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
 *   - 安全专项（第十批 ④）：eslint-plugin-security（server/ 全量策展 +
 *     src/e2e 环境相关子集）+ eslint-plugin-no-secrets（全 lint 面 entropy
 *     密钥扫描）——范围化启用，浏览器/测试语境不开 fs/child-process 类必误报规则
 *   - 范围：src / server / e2e（scripts 构建工具为 node 脚本，另行豁免）
 *   - 门禁：`pnpm check:lint` → 0 error（CI 阻断级）
 *
 * dependencies: eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-security, eslint-plugin-no-secrets
 */

import noSecrets from "eslint-plugin-no-secrets";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
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
  {
    // 安全专项（第十批 ④）——server/ 为 node:http BFF 面（唯一 node 运行时层），
    // 启用 security 全量策展规则；src/e2e 为浏览器/测试语境，仅启用其中
    // 与运行环境相关的高信号规则（eval/动态正则），fs/child-process 类规则
    // 在浏览器代码与测试桩上必然误报，不启用（范围化启用，非全仓一刀切）。
    files: ["server/**/*.ts"],
    plugins: { security },
    rules: {
      "security/detect-child-process": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-fs-filename": "error",
      "security/detect-non-literal-require": "error",
      "security/detect-non-literal-regexp": "error",
      "security/detect-object-injection": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-new-buffer": "error",
      "security/detect-disable-mustache-escape": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "e2e/**/*.ts"],
    plugins: { security },
    rules: {
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-regexp": "error",
    },
  },
  {
    // 密钥泄漏扫描（第十批 ④）——全 lint 面启用；entropy 网关兜住硬编码
    // token/密钥（环境变量注入是唯一合法来源，对齐 user-rules 安全审查要点）。
    // tolerance 4.5（插件通行默认）：实测首跑 4.0 阈值误报 19 例（ Prometheus
    // 指标名/类型属性名等标识符熵 4.03–4.25），4.5 档真实密钥（base64/hex
    // 高熵串）仍稳定命中，标识符噪音归零。
    files: ["src/**/*.{ts,tsx}", "server/**/*.ts", "e2e/**/*.ts"],
    plugins: { "no-secrets": noSecrets },
    rules: {
      "no-secrets/no-secrets": ["error", { tolerance: 4.5 }],
    },
  },
);

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
