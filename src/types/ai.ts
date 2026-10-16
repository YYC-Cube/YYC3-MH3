/**
 * file: src/types/ai.ts
 * description: YYC³ 类型契约 — AI 域（智能体节点 / 集群成员）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[ai],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI 域契约 — AgentNode 拓扑节点 / 节点展示配置 / YYC³ 八位成员档案
 *
 * dependencies: —
 * exports: AgentNodeConfig, AgentNode, YYC3Member
 */

/** AgentNode.config 展示键值对（消费点仅 Object.entries 渲染 String(v)，值域锁定原始类型防类型后门） */
export type AgentNodeConfig = Record<string, string | number | boolean>;

export interface AgentNode {
  id: string;
  label: string;
  role: string;
  roleColor: string;
  memberId: string; // aligned with YYC3Member id (yanqi, yushu, etc.)
  type:
    | "script"
    | "storyboard"
    | "voice"
    | "diffsynth"
    | "quality"
    | "predict"
    | "recommend"
    | "security";
  x: number;
  y: number;
  status: "idle" | "active" | "success" | "error";
  inputs: string[];
  outputs: string[];
  config: AgentNodeConfig;
}

// YYC3 AI Family Member Specification
export interface YYC3Member {
  id: string;
  name: string;
  metaName: string;
  clockPosition: string; // e.g. "12:00", "06:00"
  angle: number; // 0 - 360 deg
  roleColor: string;
  iconType: "speech" | "brain" | "eye" | "star" | "tree" | "shield" | "balance" | "lightbulb";
  quote: string;
  roleDefinition: string;
  responsibilities: string[];
  capabilities: string[];
  metrics: {
    todayTasks: number;
    avgLatencyMs: number;
    accuracyRate: number;
    collabCalls: number;
  };
  isOnline: boolean;
  isSpeaking: boolean;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
