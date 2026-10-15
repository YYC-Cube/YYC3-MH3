/**
 * file: src/app/dashboard/page.tsx
 * description: 总览驾驶舱路由页（dashboard）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[dashboard]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "dashboard" → 路由 "/dashboard"（视图零改动）
 *
 * dependencies: ../../../views/DashboardView, ../contexts, ../navigation
 * exports: default (Page)
 */
"use client";

import { DashboardView } from "@/views/DashboardView";
import { useProductionDataContext, useToastContext, useUIShellContext } from "../contexts";
import { useAppNavigate } from "../navigation";

export default function Page() {
  const { showToast } = useToastContext();
  const { batches } = useProductionDataContext();
  const ui = useUIShellContext();
  const navigate = useAppNavigate();

  return (
    <DashboardView
      batches={batches}
      onNavigate={navigate}
      onNewBatchClick={ui.openNewBatchModal}
      onShowToast={showToast}
    />
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
