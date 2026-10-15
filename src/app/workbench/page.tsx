/**
 * file: src/app/workbench/page.tsx
 * description: 流水线工作台路由页（workbench · 5步闭环）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[workbench]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "workbench" → 路由 "/workbench"（视图零改动）
 *
 * dependencies: ../../../views/WorkbenchView, ../contexts
 * exports: default (Page)
 */
"use client";

import { WorkbenchView } from "@/views/WorkbenchView";
import { useOpsTelemetryContext, useProductionDataContext, useToastContext } from "../contexts";

export default function Page() {
  const { showToast } = useToastContext();
  const { batches, activeBatchId, setActiveBatchId, adoptSeed } = useProductionDataContext();
  const { logs } = useOpsTelemetryContext();

  return (
    <WorkbenchView
      batches={batches}
      activeBatchId={activeBatchId}
      onSelectBatch={setActiveBatchId}
      onAdoptSeed={adoptSeed}
      onShowToast={showToast}
      initialLogs={logs}
    />
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
