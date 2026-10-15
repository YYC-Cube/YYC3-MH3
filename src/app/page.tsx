/**
 * file: src/app/page.tsx
 * description: 根路由页 · 既有 SPA 整树挂载（绞杀者模式过渡壳）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[spa-shell],[migration]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 迁移期过渡形态（05 清单 §4.3 Phase 1「功能等价优先」）：
 *   - 原 main.tsx → #root 挂载职责承接：整棵 App 树在根路由原样运行，
 *     线上功能零漂移可验证
 *   - P2（Provider 层 Context 化）/ P3（14 视图逐页拆路由）随后绞杀，
 *     本文件最终收敛为 design-system 视图薄壳
 *
 * dependencies: react, ../App
 * exports: default (Page)
 */
"use client";

import App from "../App";

export default function Page() {
  return <App />;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
