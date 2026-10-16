/**
 * file: src/adapters/ai-registry/agent.ts
 * description: 适配器层 — AgentPort v2 Registry BFF 通道（弹性网关 · 档案/步进双契约）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[ai],[agent],[registry],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-4 适配器矩阵 — ai-registry（经 server BFF 供数，区别于 ai-local 的
 *   本机直连语义：基址走 NEXT_PUBLIC_REGISTRY_BASE_URL → APP_PORT 兜底同链路，
 *   端点为 /server/ai/* 命名空间）：
 *   - listAgents → GET /server/ai/profiles（失败回退本地注册表，降级不阻断）
 *   - invokeStep → POST /server/ai/agents/:id/step；404 → unknown-agent，
 *     其余网关失败 → tool-failed（可重试），映射与 ai-local 同款
 *
 * dependencies: ../local/http, ../../data/aiRegistry, ../../domains/ai, ../../domains/ai/ports
 * exports: createRegistryAgent
 */
import { AGENT_REGISTRY } from "../../data/aiRegistry";
import type { ReactCStepKey } from "../../domains/ai";
import { type AgentError, type AgentOutput, type AgentPort } from "../../domains/ai/ports";
import { createResilientGateway, type LocalAdapterOptions } from "../local/http";

function mapGatewayError(raw: unknown, anchors: { traceId: string; agentId: string; stepKey?: ReactCStepKey }): AgentError {
  const status = raw instanceof Error && "status" in raw ? (raw as { status?: number }).status : undefined;
  const error = new Error(raw instanceof Error ? raw.message : String(raw)) as AgentError;
  error.name = "AgentError";
  error.code = status === 404 ? "unknown-agent" : "tool-failed";
  error.retryable = error.code === "tool-failed";
  error.traceId = anchors.traceId;
  error.agentId = anchors.agentId;
  error.stepKey = anchors.stepKey;
  return error;
}

/** Registry BFF 通道 Agent 适配器 */
export function createRegistryAgent(options: LocalAdapterOptions = {}): AgentPort {
  const gateway = createResilientGateway(options, () => undefined);

  return {
    async listAgents() {
      try {
        return await gateway<typeof AGENT_REGISTRY[number][]>("/server/ai/profiles");
      } catch {
        return AGENT_REGISTRY;
      }
    },

    async invokeStep(request) {
      const { agentId, stepKey, input, context } = request;
      try {
        return await gateway<AgentOutput>(`/server/ai/agents/${encodeURIComponent(agentId)}/step`, {
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
