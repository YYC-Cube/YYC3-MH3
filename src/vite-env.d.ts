/**
 * file: src/vite-env.d.ts
 * description: YYC³ 应用核心
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [core],[entry],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 应用核心
 *
 * dependencies: —
 * exports: —
 */
/// <reference types="vite/client" />

/** 构建期由 vite.config.ts define 注入（来源：PORT 环境变量），禁止在业务代码硬编码端口 */
interface ImportMetaEnv {
  readonly VITE_APP_PORT: string
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
