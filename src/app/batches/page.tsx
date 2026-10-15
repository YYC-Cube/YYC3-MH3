/**
 * file: src/app/batches/page.tsx
 * description: 批次详情与复盘路由页（batch-detail）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[batch-detail]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 —— NavTabId "batch-detail" → 路由 "/batches"。
 *        偏差记录：清单原案为动态段 /batches/[batchId]，但视图契约
 *        batchId={activeBatchId}（Context 选中态承载，非路由参数承载），
 *        且 Track B 静态导出下动态段需 generateStaticParams（运行时新建
 *        批次无静态路径可命中）——故取列表路由 + Context 选中态等价承接。
 *
 * dependencies: ../../../views/BatchDetailView, ../contexts, ../navigation
 * exports: default (Page)
 */
"use client";

import { BatchDetailView } from "@/views/BatchDetailView";
import { useProductionDataContext, useToastContext } from "../contexts";
import { useAppNavigate } from "../navigation";

export default function Page() {
  const { showToast } = useToastContext();
  const { batches, activeBatchId } = useProductionDataContext();
  const navigate = useAppNavigate();

  return (
    <BatchDetailView
      batchId={activeBatchId}
      batches={batches}
      onNavigate={navigate}
      onShowToast={showToast}
    />
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
