/**
 * file: src/adapters/ai-vllm/agent.ts
 * description: 适配器层 — AgentPort v2 vLLM 通道（OpenAI-compatible /v1/chat/completions 单步映射）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[ai],[agent],[vllm],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-4 适配器矩阵 — ai-vllm（显式启用，零默认公网）：
 *   - 构造期守卫：baseUrl（显式或 NEXT_PUBLIC_VLLM_BASE_URL）缺省即抛错——
 *     与 lokiSink 同款「显式启用」哲学，防意外外联
 *   - invokeStep → POST {base}/v1/chat/completions：model = AgentProfile.defaultModel，
 *     system = 九步角色提示（stepKey 注入），user = prompt + artifacts；
 *     choices[0].message.content → text；usage.total_tokens → tokensUsed；
 *     confidence 由 params.confidence 显式注入（vLLM 无原生置信度，缺省 0.5 诚实基线）
 *   - 风险标签固定 ["external-call"]（审计面）；5xx/网络 → tool-failed 可重试，4xx → 不可重试
 *
 * dependencies: ../../data/aiRegistry, ../../domains/ai, ../../domains/ai/ports
 * exports: VllmAgentOptions, createVllmAgent
 */
import { AGENT_REGISTRY } from "../../data/aiRegistry";
import type { ReactCStepKey } from "../../domains/ai";
import { type AgentError, type AgentPort } from "../../domains/ai/ports";

export interface VllmAgentOptions {
  /** 推理服务基址（缺省读 NEXT_PUBLIC_VLLM_BASE_URL；两者皆空 → 构造期抛错） */
  baseUrl?: string;
  /** 可选 Bearer（本地部署通常免鉴权） */
  apiKey?: string;
  /** fetch 实现（测试注入；缺省全局 fetch） */
  fetchImpl?: (url: string, init?: RequestInit) => Promise<Response>;
}

/** 构造期守卫（显式启用，零默认外联） */
function resolveBaseUrl(options: VllmAgentOptions): string {
  const base = (options.baseUrl ?? process.env.NEXT_PUBLIC_VLLM_BASE_URL ?? "").trim();
  if (base.length === 0) {
    throw new Error("[ai-vllm] 缺少 baseUrl：显式传入或设置 NEXT_PUBLIC_VLLM_BASE_URL（防意外外联）");
  }
  return base.replace(/\/$/, "");
}

function vllmError(
  message: string,
  retryable: boolean,
  anchors: { traceId: string; agentId: string; stepKey?: ReactCStepKey },
): AgentError {
  const error = new Error(message) as AgentError;
  error.name = "AgentError";
  error.code = "tool-failed";
  error.retryable = retryable;
  error.traceId = anchors.traceId;
  error.agentId = anchors.agentId;
  error.stepKey = anchors.stepKey;
  return error;
}

/** vLLM 通道 Agent 适配器（OpenAI-compatible 单步映射） */
export function createVllmAgent(options: VllmAgentOptions = {}): AgentPort {
  const base = resolveBaseUrl(options);
  const doFetch = options.fetchImpl ?? ((url: string, init?: RequestInit) => fetch(url, init));

  return {
    async listAgents() {
      return AGENT_REGISTRY; // 模型部署与档案解耦：目录以本地注册表为准
    },

    async invokeStep(request) {
      const { agentId, stepKey, input, context } = request;
      const profile = AGENT_REGISTRY.find((p) => p.id === agentId);
      if (!profile) {
        const error = new Error(`未知智能体：${agentId}`) as AgentError;
        error.name = "AgentError";
        error.code = "unknown-agent";
        error.retryable = false;
        error.traceId = context.traceId;
        error.agentId = agentId;
        error.stepKey = stepKey;
        throw error;
      }
      const anchors = { traceId: context.traceId, agentId, stepKey };
      const artifacts = context.artifacts?.length ? `\n\n[前序产物]\n${context.artifacts.join("\n")}` : "";
      const confidenceParam = input.params?.confidence;
      let response: Response;
      try {
        response = await doFetch(`${base}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: profile.defaultModel,
            messages: [
              {
                role: "system",
                content: `你是「${profile.name}」（${profile.roleDefinition}），当前执行 ReAct-C 步骤：${stepKey}。`,
              },
              { role: "user", content: `${input.prompt}${artifacts}` },
            ],
            temperature: typeof input.params?.temperature === "number" ? input.params.temperature : 0.7,
          }),
        });
      } catch (raw) {
        throw vllmError(`vLLM 网络失败：${String(raw)}`, true, anchors);
      }
      if (!response.ok) {
        // 5xx 服务端瞬态可重试；4xx 请求缺陷重试无意义
        throw vllmError(`vLLM HTTP ${response.status}`, response.status >= 500, anchors);
      }
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { total_tokens?: number };
      };
      return {
        agentId,
        text: data.choices?.[0]?.message?.content ?? "",
        confidence: typeof confidenceParam === "number" ? confidenceParam : 0.5,
        tokensUsed: data.usage?.total_tokens ?? 0,
        model: profile.defaultModel,
        riskTags: ["external-call"],
      };
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
