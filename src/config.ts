/**
 * file: src/config.ts
 * description: 应用运行时配置 · 构建期注入常量唯一来源
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [config],[runtime],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 应用运行时配置 · 构建期注入常量唯一来源
 *
 * dependencies: —
 * exports: APP_PORT
 */

/** 本地服务端口：构建期由 vite.config.ts define 从 PORT 注入（契约 docs/06-Registry-API-契约.md §5），业务代码禁止硬编码端口 */
export const APP_PORT: string = import.meta.env.VITE_APP_PORT || "3031"

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
