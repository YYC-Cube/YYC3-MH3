/**
 * file: src/app/agent-workflow/page.tsx
 * description: Agent 编排与漫剧路由页（agent）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[page],[agent-workflow]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "agent" → 路由 "/agent-workflow"（视图零改动）
 *
 * dependencies: @/views/AgentWorkflowView, ../contexts, ../navigation
 * exports: default (Page)
 */
"use client";

import { AgentWorkflowView } from "@/views/AgentWorkflowView";
import { useToastContext } from "../contexts";
import { useAppNavigate } from "../navigation";

export default function Page() {
  const { showToast } = useToastContext();
  const navigate = useAppNavigate();

  return <AgentWorkflowView onNavigate={navigate} onShowToast={showToast} />;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
