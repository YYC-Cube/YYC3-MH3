/**
 * file: src/adapters/ai-local/agent.ts
 * description: 适配器层 — AgentPort v2 本地通道（韧性网关 · 单步步进契约 · 降级状态留痕）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[ai],[agent],[local],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-4 适配器矩阵 — ai-local（复用 local/http 韧性网关）：
 *   - listAgents → GET /ai/agents/profiles（AgentProfile[]，八员）
 *   - invokeStep → POST /ai/agents/:id/step（单步步进契约；body = {stepKey, input, context}）
 *   - 错误映射：404 → unknown-agent（不可重试）；其余网关失败 → tool-failed（可重试）
 *   - server 步进路由属 Registry BFF 演进项（客户端契约先行，注入 fetch 契约测试锁死）
 *
 * dependencies: ../local/http, ../../data/aiRegistry, ../../domains/ai, ../../domains/ai/ports
 * exports: createLocalAgent
 */
import { AGENT_REGISTRY } from "../../data/aiRegistry";
import type { ReactCStepKey } from "../../domains/ai";
import { type AgentError, type AgentOutput, type AgentPort } from "../../domains/ai/ports";
import { createResilientGateway, type LocalAdapterOptions } from "../local/http";

/** 网关失败 → 结构化 AgentError（404 = 服务端无此 agent；其余可重试） */
function mapGatewayError(
  raw: unknown,
  anchors: { traceId: string; agentId: string; stepKey?: ReactCStepKey },
): AgentError {
  const error = new Error(raw instanceof Error ? raw.message : String(raw)) as AgentError;
  error.name = "AgentError";
  error.code =
    raw instanceof Error && "status" in raw && (raw as { status?: number }).status === 404
      ? "unknown-agent"
      : "tool-failed";
  error.retryable = error.code === "tool-failed";
  error.traceId = anchors.traceId;
  error.agentId = anchors.agentId;
  error.stepKey = anchors.stepKey;
  return error;
}

/** 本地通道 Agent 适配器（韧性网关 + 单步步进契约） */
export function createLocalAgent(options: LocalAdapterOptions = {}): AgentPort {
  const gateway = createResilientGateway(options, () => undefined);

  return {
    async listAgents() {
      try {
        return await gateway<(typeof AGENT_REGISTRY)[number][]>("/ai/agents/profiles");
      } catch {
        // 目录失败回退本地注册表（供数降级不阻断编排前置校验）
        return AGENT_REGISTRY;
      }
    },

    async invokeStep(request) {
      const { agentId, stepKey, input, context } = request;
      try {
        return await gateway<AgentOutput>(`/ai/agents/${encodeURIComponent(agentId)}/step`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ stepKey, input, context }),
        });
      } catch (raw) {
        throw mapGatewayError(raw, { traceId: context.traceId, agentId, stepKey });
      }
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
