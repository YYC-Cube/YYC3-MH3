/**
 * file: src/adapters/memory/agent.ts
 * description: 适配器层 — AgentPort v2 内存实现（确定性单步桩 · 断网默认 · 八员注册表供数）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[ai],[agent],[react-c],[memory]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-4 适配器矩阵 — AgentPort v2 内存桩（组合根默认装配）：
 *   - listAgents → AGENT_REGISTRY 八员档案（浅拷贝防外泄变更）
 *   - invokeStep → 确定性单步产出（同输入恒同输出，演示可回归）；
 *     未知 agentId 在任何执行前抛 AgentError(unknown-agent, retryable=false)
 *     —— 与 runner 前置校验双保险，失败零部分状态
 *   - 九步编排不在本层（v2 编排权在 orchestrator/runner，适配器只做单步）
 *
 * dependencies: ../../data/aiRegistry, ../../domains/ai/index, ../../domains/ai/ports
 * exports: MemoryAgentDeps, createMemoryAgent
 */
import { AGENT_REGISTRY } from "../../data/aiRegistry";
import type { ReactCStepKey } from "../../domains/ai";
import {
  type AgentError,
  type AgentInput,
  type AgentOutput,
  type AgentPort,
  type AgentTool,
} from "../../domains/ai/ports";
import type { AgentContext } from "../../domains/ai/ports";

export interface MemoryAgentDeps {
  /** 档案表（默认 AGENT_REGISTRY；测试可注入替身） */
  profiles?: readonly (typeof AGENT_REGISTRY)[number][];
}

/** 结构化 AgentError 构造（code/retryable/锚点必填） */
function agentError(
  code: AgentError["code"],
  message: string,
  anchors: { traceId: string; agentId: string; stepKey?: ReactCStepKey },
): AgentError {
  const error = new Error(message) as AgentError;
  error.name = "AgentError";
  error.code = code;
  error.retryable = code === "tool-failed" || code === "budget-exceeded";
  error.traceId = anchors.traceId;
  error.agentId = anchors.agentId;
  error.stepKey = anchors.stepKey;
  return error;
}

/** 内存 Agent 适配器（断网默认桩，确定性单步） */
export function createMemoryAgent(deps: MemoryAgentDeps = {}): AgentPort {
  const profiles = deps.profiles ?? AGENT_REGISTRY;

  return {
    async listAgents() {
      return profiles.map((p) => ({ ...p, capabilities: [...p.capabilities], riskTags: [...p.riskTags] }));
    },

    async invokeStep(request: {
      agentId: string;
      stepKey: ReactCStepKey;
      input: AgentInput;
      context: AgentContext;
      tools: readonly AgentTool[];
    }): Promise<AgentOutput> {
      const profile = profiles.find((p) => p.id === request.agentId);
      // 回滚语义：任何产出前拒绝（零部分状态）
      if (!profile) {
        throw agentError("unknown-agent", `未知智能体：${request.agentId}（注册表共 ${profiles.length} 员）`, {
          traceId: request.context.traceId,
          agentId: request.agentId,
          stepKey: request.stepKey,
        });
      }
      const prompt = request.input.prompt.trim();
      return {
        agentId: profile.id,
        text: `${profile.name} · ${request.stepKey}：已完成对「${prompt.slice(0, 40)}」的单步处理${request.context.artifacts?.length ? `（结合 ${request.context.artifacts.length} 项前序产物）` : ""}。`,
        confidence: 0.9,
        tokensUsed: 64 + prompt.length * 2,
        model: "memory-stub",
        riskTags: [...profile.riskTags],
        artifacts: [`memory:${profile.id}:${request.stepKey}`],
      };
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
