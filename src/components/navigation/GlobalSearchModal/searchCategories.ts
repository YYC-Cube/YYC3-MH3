/**
 * file: src/components/navigation/GlobalSearchModal/searchCategories.ts
 * description: YYC³ 导航组件 — GlobalSearchModal 全局搜索分类契约与常量
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[search],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: GlobalSearchModal 全局搜索分类类型（SearchCategory）与分类页签常量
 *        （SEARCH_CATEGORIES），自原 GlobalSearchModal.tsx 逐字搬移并独立成模块以避免循环引用。
 *
 * dependencies: —
 * exports: SearchCategory, SEARCH_CATEGORIES
 */

/** 全局搜索分类 */
export type SearchCategory = "all" | "pages" | "batches" | "seeds" | "docs" | "models";

export const SEARCH_CATEGORIES: { id: SearchCategory; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "pages", label: "功能页面" },
  { id: "batches", label: "生产批次" },
  { id: "seeds", label: "Seed 种子" },
  { id: "docs", label: "文档指南" },
  { id: "models", label: "模型权重" },
];

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
