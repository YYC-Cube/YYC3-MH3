/**
 * file: src/__tests__/adapters.ai-matrix.test.ts
 * description: PR-4 契约测试 · AgentPort v2 适配器矩阵（memory/local/vllm/registry 同契约面 + 错误映射 + 守卫）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[contract],[adapter],[ai],[matrix],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-4 验收 —— 四适配器同端口契约：
 *   ① listAgents 八员（id 全集 = AGENT_REGISTRY；HTTP 通道失败回退注册表）
 *   ② invokeStep 出参六必填（agentId/text/confidence/tokensUsed/model/riskTags）
 *   ③ 错误映射：404→unknown-agent 不可重试；5xx/网络→tool-failed 可重试；4xx→不可重试
 *   ④ vllm 构造期守卫（缺 baseUrl 抛错，零默认外联）+ OpenAI 请求形状 + 显式 confidence
 *   ⑤ memory 未知 agentId 执行前拒绝（AgentError unknown-agent）
 *
 * dependencies: vitest, ../adapters/memory/agent, ../adapters/ai-local/agent,
 *               ../adapters/ai-vllm/agent, ../adapters/ai-registry/agent, ../data/aiRegistry
 * exports: (test)
 */
import { describe, expect, it } from "vitest";

import { createLocalAgent } from "../adapters/ai-local/agent";
import { createRegistryAgent } from "../adapters/ai-registry/agent";
import { createVllmAgent } from "../adapters/ai-vllm/agent";
import { createMemoryAgent } from "../adapters/memory/agent";
import { AGENT_REGISTRY } from "../data/aiRegistry";
import type { ReactCStepKey } from "../domains/ai";
import type { AgentContext, AgentError, AgentOutput, AgentPort } from "../domains/ai/ports";

const CTX: AgentContext = { traceId: "trace-matrix", sessionId: "s-1" };

function stepRequest(agentId = "yanqi", stepKey: ReactCStepKey = "perceive") {
  return { agentId, stepKey, input: { prompt: "生成夜景分镜" }, context: CTX, tools: [] as const };
}

/** 出参六必填契约（留痕审计面） */
function expectOutputShape(output: AgentOutput, agentId: string): void {
  expect(output.agentId).toBe(agentId);
  expect(typeof output.text).toBe("string");
  expect(output.confidence).toBeGreaterThanOrEqual(0);
  expect(output.confidence).toBeLessThanOrEqual(1);
  expect(output.tokensUsed).toBeGreaterThanOrEqual(0);
  expect(typeof output.model).toBe("string");
  expect(Array.isArray(output.riskTags)).toBe(true);
}

describe("[ai-matrix] memory 桩", () => {
  const agent = createMemoryAgent();

  it("listAgents：八员且 id 全集与 AGENT_REGISTRY 一致（浅拷贝）", async () => {
    const profiles = await agent.listAgents();
    expect(profiles.map((p) => p.id)).toEqual(AGENT_REGISTRY.map((p) => p.id));
    expect(profiles[0]).not.toBe(AGENT_REGISTRY[0]);
  });

  it("invokeStep：确定性（同输入同输出）且出参六必填", async () => {
    const a = await agent.invokeStep(stepRequest());
    const b = await agent.invokeStep(stepRequest());
    expect(a).toEqual(b);
    expectOutputShape(a, "yanqi");
    expect(a.model).toBe("memory-stub");
  });

  it("未知 agentId：执行前抛 AgentError(unknown-agent, retryable=false)", async () => {
    await expect(agent.invokeStep(stepRequest("ghost"))).rejects.toThrow(/ghost/);
    try {
      await agent.invokeStep(stepRequest("ghost"));
    } catch (error) {
      expect((error as AgentError).code).toBe("unknown-agent");
      expect((error as AgentError).retryable).toBe(false);
      expect((error as AgentError).traceId).toBe(CTX.traceId);
    }
  });
});

describe("[ai-matrix] local / registry（韧性网关通道）", () => {
  function okResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), { status: 200 });
  }

  const STEP_OUTPUT: AgentOutput = { agentId: "yanqi", text: "网关步进", confidence: 0.9, tokensUsed: 16, model: "gateway-stub", riskTags: [] };

  it.each([
    ["local", () => createLocalAgent({
      baseUrl: "http://gw.test/api", fetchImpl: async (url, init) => {
        expect(url).toBe("http://gw.test/api/ai/agents/yanqi/step");
        expect((init?.body as string)).toContain('"stepKey":"perceive"');
        return okResponse(STEP_OUTPUT);
      }
    })],
    ["registry", () => createRegistryAgent({
      baseUrl: "http://gw.test/api", fetchImpl: async (url) => {
        expect(url).toBe("http://gw.test/api/server/ai/agents/yanqi/step");
        return okResponse(STEP_OUTPUT);
      }
    })],
  ])("%s：step 契约直通且出参六必填", async (_name, make) => {
    const output = await make().invokeStep(stepRequest());
    expectOutputShape(output, "yanqi");
    expect(output.model).toBe("gateway-stub");
  });

  it.each([
    ["local", (fetchImpl: (url: string, init?: RequestInit) => Promise<Response>) => createLocalAgent({ baseUrl: "http://gw.test/api", fetchImpl })],
    ["registry", (fetchImpl: (url: string, init?: RequestInit) => Promise<Response>) => createRegistryAgent({ baseUrl: "http://gw.test/api", fetchImpl })],
  ])("%s：HTTP 500 → tool-failed 可重试；404 → unknown-agent 不可重试", async (_name, make) => {
    const agent500 = make(async () => new Response("boom", { status: 500 }));
    await agent500.invokeStep(stepRequest()).then(
      () => expect.unreachable("should throw"),
      (error: AgentError) => {
        expect(error.code).toBe("tool-failed");
        expect(error.retryable).toBe(true);
      },
    );
    const agent404 = make(async () => new Response("nope", { status: 404 }));
    await agent404.invokeStep(stepRequest()).then(
      () => expect.unreachable("should throw"),
      (error: AgentError) => {
        expect(error.code).toBe("unknown-agent");
        expect(error.retryable).toBe(false);
      },
    );
  });

  it.each([
    ["local", () => createLocalAgent({ baseUrl: "http://gw.test/api", fetchImpl: async () => new Response("[]", { status: 500 }) })],
    ["registry", () => createRegistryAgent({ baseUrl: "http://gw.test/api", fetchImpl: async () => new Response("[]", { status: 500 }) })],
  ])("%s：listAgents HTTP 失败 → 回退本地注册表八员（供数降级不阻断）", async (_name, make) => {
    const profiles = await make().listAgents();
    expect(profiles.map((p) => p.id)).toEqual(AGENT_REGISTRY.map((p) => p.id));
  });
});

describe("[ai-matrix] vLLM 通道", () => {
  it("构造期守卫：缺 baseUrl（显式与 env 皆空）→ 抛错（零默认外联）", () => {
    const prev = process.env.NEXT_PUBLIC_VLLM_BASE_URL;
    delete process.env.NEXT_PUBLIC_VLLM_BASE_URL;
    try {
      expect(() => createVllmAgent()).toThrow(/baseUrl/);
    } finally {
      if (prev !== undefined) process.env.NEXT_PUBLIC_VLLM_BASE_URL = prev;
    }
  });

  it("invokeStep：OpenAI 请求形状（model=档案默认/messages 双条/温度参数）+ 响应映射", async () => {
    const capture: {
      url?: string;
      body?: { model?: string; messages?: { role: string; content: string }[]; temperature?: number };
    } = {};
    const agent = createVllmAgent({
      baseUrl: "http://127.0.0.1:8000",
      fetchImpl: async (url, init) => {
        capture.url = url;
        capture.body = JSON.parse(init?.body as string);
        return new Response(JSON.stringify({
          choices: [{ message: { content: "分镜已生成" } }],
          usage: { total_tokens: 321 },
        }), { status: 200 });
      },
    });
    const output = await agent.invokeStep({
      ...stepRequest(),
      input: { prompt: "夜景分镜", params: { temperature: 0.3, confidence: 0.82 } },
    });
    expect(capture.url).toBe("http://127.0.0.1:8000/v1/chat/completions");
    const body = capture.body;
    expect(body?.model).toBe("MiniMax-Text-01");
    expect(body?.messages).toHaveLength(2);
    expect(body?.messages?.[0]?.role).toBe("system");
    expect(body?.messages?.[0]?.content).toContain("perceive");
    expect(body?.temperature).toBe(0.3);
    expect(output.text).toBe("分镜已生成");
    expect(output.tokensUsed).toBe(321);
    expect(output.confidence).toBe(0.82); // 显式注入（vLLM 无原生置信度）
    expect(output.model).toBe("MiniMax-Text-01");
    expect([...output.riskTags]).toEqual(["external-call"]);
  });

  it("错误映射：5xx 可重试；4xx 不可重试；网络拒绝可重试", async () => {
    const anchors = { traceId: CTX.traceId, agentId: "yanqi" };
    const base = { baseUrl: "http://127.0.0.1:8000" };
    const s500 = createVllmAgent({ ...base, fetchImpl: async () => new Response("x", { status: 500 }) });
    await s500.invokeStep(stepRequest()).then(
      () => expect.unreachable(),
      (e: AgentError) => expect(e.retryable).toBe(true),
    );
    const s400 = createVllmAgent({ ...base, fetchImpl: async () => new Response("x", { status: 400 }) });
    await s400.invokeStep(stepRequest()).then(
      () => expect.unreachable(),
      (e: AgentError) => expect(e.retryable).toBe(false),
    );
    const net = createVllmAgent({ ...base, fetchImpl: async () => { throw new Error("econnrefused"); } });
    await net.invokeStep(stepRequest()).then(
      () => expect.unreachable(),
      (e: AgentError) => expect(e.retryable).toBe(true),
    );
    void anchors;
  });

  it("listAgents：以本地注册表为准（部署与档案解耦）", async () => {
    const agent = createVllmAgent({ baseUrl: "http://127.0.0.1:8000", fetchImpl: async () => new Response("{}", { status: 200 }) });
    const profiles = await agent.listAgents();
    expect(profiles).toHaveLength(8);
  });
});

describe("[ai-matrix] 端口形状统一", () => {
  it("四适配器均为 AgentPort 形状（listAgents/invokeStep 可调用）", async () => {
    const agents: readonly [string, AgentPort][] = [
      ["memory", createMemoryAgent()],
      ["local", createLocalAgent({ fetchImpl: async () => new Response("{}", { status: 500 }) })],
      ["vllm", createVllmAgent({ baseUrl: "http://127.0.0.1:8000", fetchImpl: async () => new Response("{}", { status: 200 }) })],
      ["registry", createRegistryAgent({ fetchImpl: async () => new Response("{}", { status: 500 }) })],
    ];
    for (const [name, agent] of agents) {
      expect(typeof agent.listAgents).toBe("function");
      expect(typeof agent.invokeStep).toBe("function");
      const profiles = await agent.listAgents();
      expect(profiles.length, name).toBe(8);
    }
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
