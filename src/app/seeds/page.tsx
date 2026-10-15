/**
 * file: src/app/seeds/page.tsx
 * description: Seed 种子库路由页（seed）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[seed-vault]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "seed" → 路由 "/seeds"（视图零改动）
 *
 * dependencies: ../../../views/SeedVaultView, ../contexts, ../navigation
 * exports: default (Page)
 */
"use client";

import { SeedVaultView } from "@/views/SeedVaultView";
import { useProductionDataContext, useToastContext } from "../contexts";
import { useAppNavigate } from "../navigation";

export default function Page() {
  const { showToast } = useToastContext();
  const { seeds, batches, setActiveBatchId } = useProductionDataContext();
  const navigate = useAppNavigate();

  return (
    <SeedVaultView
      seeds={seeds}
      onNavigate={navigate}
      onApplySeedToWorkbench={() => {
        setActiveBatchId(batches[0]!.id); // 演示数据恒非空，回退至首批次
      }}
      onShowToast={showToast}
    />
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
