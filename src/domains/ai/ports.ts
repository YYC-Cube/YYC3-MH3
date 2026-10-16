/**
 * file: src/domains/ai/ports.ts
 * description: YYC³ AI 域 — 智能体出站端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[port],[ai]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI 出站端口 — 智能体目录查询与单次调用契约（供本地/远端适配器实现）
 *
 * dependencies: ../../types
 * exports: AgentInvocation, AgentResponse, AiAssistantPort
 */
import type { AgentNode } from "../../types";

/** 单次智能体调用入参 */
export interface AgentInvocation {
  /** 目标 AgentNode.id */
  agentId: string;
  /** 用户提示词 */
  prompt: string;
  /** 可选上下文（前序产物 / 检索片段） */
  context?: string;
}

/** 单次智能体调用结果 */
export interface AgentResponse {
  agentId: string;
  text: string;
  /** 置信度 [0, 1] */
  confidence: number;
  /** 消耗令牌数 */
  tokensUsed: number;
}

/**
 * AI 助手端口（读目录 + 单次调用）。
 *
 * 实现方：
 * - `adapters/local`（本地模型 / 回环推理服务，待接入）
 * - `adapters/memory`（演示桩，断网默认）
 */
export interface AiAssistantPort {
  /** 智能体集群目录（拓扑节点全集） */
  listAgents(): Promise<AgentNode[]>;
  /** 单次调用指定智能体 */
  invokeAgent(request: AgentInvocation): Promise<AgentResponse>;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
