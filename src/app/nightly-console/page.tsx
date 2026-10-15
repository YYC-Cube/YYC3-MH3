/**
 * file: src/app/nightly-console/page.tsx
 * description: 夜间批量控制台路由页（nightly · 低蓝光）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[nightly-console]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "nightly" → 路由 "/nightly-console"（视图零改动）
 *
 * dependencies: @/views/NightlyConsoleView, ../contexts, ../navigation
 * exports: default (Page)
 */
"use client";

import { NightlyConsoleView } from "@/views/NightlyConsoleView";
import { useToastContext } from "../contexts";
import { useAppNavigate } from "../navigation";

export default function Page() {
  const { showToast } = useToastContext();
  const navigate = useAppNavigate();

  return <NightlyConsoleView onNavigate={navigate} onShowToast={showToast} />;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
