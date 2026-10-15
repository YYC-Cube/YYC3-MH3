/**
 * file: src/app/settings/page.tsx
 * description: 系统与硬件设置路由页（settings）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[settings]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "settings" → 路由 "/settings"（视图零改动）
 *
 * dependencies: @/views/SettingsView, ../contexts
 * exports: default (Page)
 */
"use client";

import { SettingsView } from "@/views/SettingsView";
import { useToastContext } from "../contexts";

export default function Page() {
  const { showToast } = useToastContext();

  return <SettingsView onShowToast={showToast} />;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
