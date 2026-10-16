/**
 * file: src/kernel/config.ts
 * description: 应用运行时配置 · 常量唯一来源（环境注入 + 路由映射叶层）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [kernel],[config],[runtime],[routes],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 应用运行时配置 · 常量唯一来源（kernel 叶层）：
 *   - APP_PORT：NEXT_PUBLIC_ 环境变量注入（契约 docs/06-Registry-API-契约.md §5）
 *   - P3 增补路由映射叶层：NavTabId ↔ href 纯常量下沉于此（零 React/Context 依赖），
 *     components 层（Sidebar 等）与 app 层（navigation.ts）均可合法消费，
 *     维持六边形依赖方向铁律（boundary-guard 矩阵）
 *
 * dependencies: ../types
 * exports: APP_PORT, TAB_HREF, hrefForTab, tabFromPathname
 */
import { NavTabId } from "../types";

/** 本地服务端口：NEXT_PUBLIC_ 环境变量注入（契约 docs/06-Registry-API-契约.md §5），业务代码禁止硬编码端口 */
export const APP_PORT: string = process.env.NEXT_PUBLIC_APP_PORT || "3031";

/** NavTabId → App Router 路由段（05 清单 P3 §4.1 映射表唯一事实源） */
export const TAB_HREF: Readonly<Record<NavTabId, string>> = {
  "design-system": "/",
  dashboard: "/dashboard",
  workbench: "/workbench",
  "batch-detail": "/batches",
  seed: "/seeds",
  prompt: "/prompt-hub",
  models: "/models",
  agent: "/agent-workflow",
  platform: "/platform",
  ops: "/ops-monitor",
  nightly: "/nightly-console",
  docs: "/docs",
  settings: "/settings",
};

/** 反查表（href 去尾斜杠后精确匹配） */
const HREF_TAB: ReadonlyMap<string, NavTabId> = new Map(
  (Object.entries(TAB_HREF) as [NavTabId, string][]).map(([tab, href]) => [
    href.replace(/\/+$/, "") || "/",
    tab,
  ]),
);

export function hrefForTab(tab: NavTabId): string {
  return TAB_HREF[tab];
}

/** pathname → NavTabId（trailingSlash: true 静态导出下 /dashboard/ 与 /dashboard 双兼容） */
export function tabFromPathname(pathname: string): NavTabId {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return HREF_TAB.get(normalized) ?? "design-system";
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
