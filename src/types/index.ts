/**
 * file: src/types/index.ts
 * description: 全局类型唯一来源 · barrel（域契约分文件出口）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[barrel],[contract],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 全局类型唯一来源 · barrel —— 按域拆分的契约模块统一再导出，
 *        既有 `from "../types"` 引用零改动（对外唯一事实源不变）。
 *
 * dependencies: ./common, ./pipeline, ./production, ./ai, ./distribution, ./admin, ./platform
 * exports: (re-export all domain contracts)
 */
export * from "./common";
export * from "./pipeline";
export * from "./production";
export * from "./ai";
export * from "./distribution";
export * from "./admin";
export * from "./platform";

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
