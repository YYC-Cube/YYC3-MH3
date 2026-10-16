/**
 * file: src/views/AgentWorkflowView/parts/types.ts
 * description: YYC³ 功能视图 — AgentWorkflowView 类型契约（页签/入参）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[types],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Agent 工作流视图契约层 — 左侧面板页签枚举与视图入参类型
 *
 * dependencies: ../../../types
 * exports: AgentLeftTab, AGENT_LEFT_TABS, AgentWorkflowViewProps
 */
import type { NavigateExtra, NavTabId } from "../../../types";

/** Agent 工作流左侧面板页签 ID */
export type AgentLeftTab = "agents" | "storyboards" | "templates";

export const AGENT_LEFT_TABS: { id: AgentLeftTab; label: string }[] = [
  { id: "storyboards", label: "分镜队列" },
  { id: "agents", label: "AI Family (8)" },
  { id: "templates", label: "漫剧模板" },
];

export interface AgentWorkflowViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
