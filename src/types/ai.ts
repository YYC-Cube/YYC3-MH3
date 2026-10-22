/**
 * file: src/types/ai.ts
 * description: YYC³ 类型契约 — AI 域（智能体节点 / 集群成员）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[ai],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI 域契约 — AgentNode 拓扑节点 / 节点展示配置 / YYC³ 八位成员档案 / Agent 调用主体档案
 *
 * dependencies: —
 * exports: AgentNodeConfig, AgentNode, YYC3Member, AgentProfile
 */

/** AgentNode.config 展示键值对（消费点仅 Object.entries 渲染 String(v)，值域锁定原始类型防类型后门） */
export type AgentNodeConfig = Record<string, string | number | boolean>;

export interface AgentNode {
  id: string;
  label: string;
  role: string;
  roleColor: string;
  memberId: string; // aligned with YYC3Member id (yanqi, yushu, etc.)
  type: "script" | "storyboard" | "voice" | "diffsynth" | "quality" | "predict" | "recommend" | "security";
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

/**
 * Agent 调用主体档案（PR-1 端口 v2）：
 * 八成员注册表条目，由 data/aiRegistry 从 YYC3Member 派生（单一事实来源不复制），
 * domains/ai/ports.ts 的 AgentPort.listAgents 以本类型为返回契约。
 * 与 AgentNode（编排层工位拓扑）分层：成员为调用主体，节点仅引用 memberId。
 */
export interface AgentProfile {
  /** 成员 id（invokeStep.agentId 的合法全集，如 yanqi / zhiyun / qianli） */
  id: string;
  /** 显示名（言启·千行 等） */
  name: string;
  /** 职责定义（直读 YYC3Member.roleDefinition） */
  roleDefinition: string;
  /** 能力清单（直读 YYC3Member.capabilities，派生时拷贝防外泄变更） */
  capabilities: readonly string[];
  /** 默认推理模型（适配器按此路由：MiniMax-Text-01 / vLLM 部署名等） */
  defaultModel: string;
  /** 风险标签基线（如 zhiyun 守护 = ["local-only"]；空数组 = 无特殊风险） */
  riskTags: readonly string[];
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
