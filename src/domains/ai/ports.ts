/**
 * file: src/domains/ai/ports.ts
 * description: YYC³ AI 域 — 智能体出站端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v2.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[port],[ai],[react-c],[agent]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI 出站端口 v2（PR-1 契约 + PR-5 v1 收口）—
 *   v1（AgentInvocation / AgentResponse / AiAssistantPort）已随 PR-5 删除：
 *     全零 UI 生产消费，组合根与测试已迁移 AgentPort v2
 *   v2 六要素契约：input / context / tools / output / trace / error → AgentPort
 *   （invokeStep 单步推进式——九步编排权在 orchestrator，适配器只做单步推理/执行）
 *
 * dependencies: ../../types, ./index
 * exports: AgentTool, AgentInput, AgentContext, AgentOutput, AgentStepTrace, AgentErrorCode, AgentError, AgentPort
 */
import type { AgentProfile } from "../../types";
import type { ReactCStepKey } from "./index";

/* ═══════════════════════════════════════════════════════════════
 * v2 六要素契约（PR-1）：input / context / tools / output / trace / error
 * ═══════════════════════════════════════════════════════════════ */

/** 六要素之一 · tools：Agent 可用工具（白名单显式注入——Agent 拿到什么才能用什么，无隐式能力） */
export interface AgentTool {
  /** 工具标识（编排器按名分发，Agent 代码不持有传输原语） */
  name: string;
  description: string;
  /** 结构化入参 schema（可选，供校验与文档生成） */
  inputSchema?: Record<string, unknown>;
  /** 由编排器代理执行（fetch/DB/文件等 IO 全部封在工具实现内，实现方为适配器） */
  invoke(input: unknown): Promise<unknown>;
}

/** 六要素之二 · input：单步调用入参 */
export interface AgentInput {
  /** 用户提示词 / 任务指令 */
  prompt: string;
  /** 结构化参数（模型温度、产出上限等，按 AgentProfile 声明的键校验） */
  params?: Readonly<Record<string, string | number | boolean>>;
}

/** 六要素之三 · context：执行上下文（traceId 全链路锚点 + 预算边界） */
export interface AgentContext {
  /** 全链路追踪 id（贯穿九步每一步，缺失时由编排器新发） */
  traceId: string;
  /** 会话 id（多轮对话归属） */
  sessionId: string;
  /** 前序产物（上游 Agent 产出 / 检索片段 / 多轮历史摘要） */
  artifacts?: readonly string[];
  /** 本次调用预算（Token 上限 / 时限 ms，超限由编排器强制终局） */
  budget?: { maxTokens?: number; deadlineMs?: number };
}

/** 六要素之四 · output：单步产出（留痕审计必填 model / riskTags） */
export interface AgentOutput {
  agentId: string;
  text: string;
  /** 置信度 [0, 1]（Step7 反思判定的输入之一） */
  confidence: number;
  tokensUsed: number;
  /** 产出模型名（memory 桩填 "memory-stub"） */
  model: string;
  /** 风险标签（如 ["pii-masked","external-call"]；空数组 = 无风险） */
  riskTags: readonly string[];
  /** 结构化产物（下游 Agent context.artifacts 的供体） */
  artifacts?: readonly string[];
}

/** 六要素之五 · trace：单步运行时追踪（九步逐步上报，traceId 全链路串联） */
export interface AgentStepTrace {
  agentId: string;
  traceId: string;
  stepKey: ReactCStepKey;
  /** 步骤序号 [0, 8] */
  index: number;
  /** 步骤进入时刻（epoch ms） */
  startedAt: number;
  /** 步骤耗时（退场时回填） */
  durationMs?: number;
  tokensUsed?: number;
  model?: string;
  riskTags?: readonly string[];
  /** 回环轮次（Step7 fail 进入 revise 时 +1，首跑为 0） */
  reviseRound?: number;
}

/** 六要素之六 · error：结构化错误码（可恢复性由 retryable 承载，编排器据此三分支） */
export type AgentErrorCode =
  | "unknown-agent" // 未知 agentId（不可重试，回滚）
  | "tool-failed" // 工具执行失败（可重试）
  | "budget-exceeded" // 预算耗尽（可重试，须缩参）
  | "contract-violated" // 供数契约校验失败（可重试一次后转降级）
  | "reflect-unresolved" // 复检 ≤2 轮仍不达标（转人工接管）
  | "cancelled"; // 人工取消

export interface AgentError extends Error {
  code: AgentErrorCode;
  /** 是否可自动重试（编排器据此走 retry / rollback / handoff 三分支） */
  retryable: boolean;
  traceId: string;
  agentId: string;
  /** 发生时所处的 ReAct-C 步骤 */
  stepKey?: ReactCStepKey;
}

/**
 * 统一 Agent 端口 v2（八成员 × N 适配器共同遵守的唯一调用契约）。
 *
 * 实现方（PR-4 落地）：
 * - `adapters/memory`（演示桩，断网默认，对齐 invokeStep）
 * - `adapters/ai-local`（本地回环通道，重构自现有 local）
 * - `adapters/ai-vllm`（OpenAI-compatible 推理服务）
 * - `adapters/ai-registry`（经 server BFF）
 */
export interface AgentPort {
  /** 调用主体档案（八员全集，浅拷贝防外泄变更） */
  listAgents(): Promise<readonly AgentProfile[]>;
  /**
   * 单步推进式调用（编排器驱动状态机，每步传 stepKey）：
   * 适配器只负责「给定步骤做一次推理/执行」，九步编排权在 orchestrator——
   * 与 v1 的本质区别：v1 适配器自走九步，编排权错位。
   */
  invokeStep(request: {
    agentId: string;
    stepKey: ReactCStepKey;
    input: AgentInput;
    context: AgentContext;
    tools: readonly AgentTool[];
  }): Promise<AgentOutput>;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
