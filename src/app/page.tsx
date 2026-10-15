/**
 * file: src/app/page.tsx
 * description: 根路由页 · 设计体系视图（design-system，原默认态）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[design-system]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "design-system" → 路由 "/"；
 *        视图 props 经 Context/UIShell/路由导航装配，视图组件零改动
 *
 * dependencies: ../../views/DesignSystemView, ./contexts
 * exports: default (Page)
 */
"use client";

import { DesignSystemView } from "@/views/DesignSystemView";
import {
  useAuthContext,
  useOpsTelemetryContext,
  useToastContext,
  useUIShellContext,
} from "./contexts";

export default function Page() {
  const { showToast } = useToastContext();
  const { setIsLoginViewOpen } = useAuthContext();
  const { logs } = useOpsTelemetryContext();
  const ui = useUIShellContext();

  return (
    <DesignSystemView
      onOpenYYC3={ui.openYYC3}
      onOpenLogin={() => setIsLoginViewOpen(true)}
      onShowToast={showToast}
      logs={logs}
    />
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
