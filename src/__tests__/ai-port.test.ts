/**
 * file: src/__tests__/ai-port.test.ts
 * description: YYC³ AgentPort v2 组合根契约测试（八员目录 / 单步确定性 / unknown-agent 回滚 / 端到端接线）
 * author: YanYuCloudCube Team
 * version: v2.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[ai],[contract],[port],[react-c],[v2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-5 收口验收 —— AgentPort v2 契约闭合（v1 AiAssistantPort 已删除，
 *        本测试随之重写）：① listAgents 返回八员目录快照（AgentProfile 六字段
 *        齐备、与 AGENT_REGISTRY 同源、浅拷贝防外泄变更）；② invokeStep 确定性
 *        单步产出（同输入恒同输出、六必填形状完整、artifacts 在位）；
 *        ③ context.artifacts 注入响应文本；④ 未知 agentId 在任何产出前抛
 *        AgentError(unknown-agent, retryable=false)（回滚语义，锚点齐备）；
 *        ⑤ 九步 stepKey 全集均可单步推进（同 traceId 串联）；
 *        ⑥ 组合根实际供给 ai 端口（AppPorts 接线断裂即红）。
 *
 * dependencies: vitest, ../adapters/memory/agent, ../app/composition, ../data/aiRegistry, ../domains/ai
 * exports: —
 */
import { describe, expect, it } from "vitest";

import { createMemoryAgent } from "../adapters/memory/agent";
import { getPorts } from "../app/composition";
import { AGENT_REGISTRY } from "../data/aiRegistry";
import { REACT_C_STEPS } from "../domains/ai";
import { AgentError, AgentPort } from "../domains/ai/ports";
import type { AgentProfile } from "../types";

/** 标准单步入参（组合根默认装配 = memory 桩） */
const TRACE = "trace-ai-port";
const request = (overrides: Partial<Parameters<AgentPort["invokeStep"]>[0]> = {}) => ({
  agentId: "yanqi",
  stepKey: "perceive" as const,
  input: { prompt: "生成一段夜景分镜" },
  context: { traceId: TRACE, sessionId: "sess-ai-port" },
  tools: [],
  ...overrides,
});

describe("AgentPort v2 组合根契约 · 内存实现", () => {
  it("listAgents 返回八员目录：数量与 AGENT_REGISTRY 同源 + AgentProfile 六字段齐备", async () => {
    const ai = createMemoryAgent();
    const agents = await ai.listAgents();
    expect(agents).toHaveLength(AGENT_REGISTRY.length);
    expect(agents.map((p) => p.id)).toEqual(AGENT_REGISTRY.map((p) => p.id));
    for (const profile of agents) {
      expect(profile.id).toBeTruthy();
      expect(profile.name).toBeTruthy();
      expect(profile.roleDefinition).toBeTruthy();
      expect(Array.isArray(profile.capabilities)).toBe(true);
      expect(profile.capabilities.length).toBeGreaterThan(0);
      expect(profile.defaultModel).toBeTruthy();
      expect(Array.isArray(profile.riskTags)).toBe(true);
    }
  });

  it("listAgents 浅拷贝防外泄：外部 push 与数组字段变异不污染注册表", async () => {
    const ai = createMemoryAgent();
    const agents = await ai.listAgents();
    // readonly 是编译期契约；此处验证运行时实现确实拷贝（cast 模拟恶意消费者）
    const mutable = agents as AgentProfile[];
    mutable.push({ ...mutable[0]!, id: "polluted", name: "污染员" });
    (mutable[0]!.capabilities as string[]).push("injected-cap");
    (mutable[0]!.riskTags as string[]).push("injected-risk");
    const fresh = await ai.listAgents();
    expect(fresh.some((p) => p.id === "polluted")).toBe(false);
    expect(fresh[0]!.capabilities).not.toContain("injected-cap");
    expect(fresh[0]!.riskTags).not.toContain("injected-risk");
  });

  it("invokeStep 确定性单步产出：同输入恒同输出 + 六必填形状完整", async () => {
    const ai = createMemoryAgent();
    const a = await ai.invokeStep(request());
    const b = await ai.invokeStep(request());
    expect(a).toEqual(b);
    expect(a.agentId).toBe("yanqi");
    expect(a.text).toContain("言启·千行");
    expect(a.text).toContain("perceive");
    expect(a.text).toContain("夜景分镜");
    expect(a.confidence).toBeGreaterThan(0);
    expect(a.confidence).toBeLessThanOrEqual(1);
    expect(a.tokensUsed).toBeGreaterThan(0);
    expect(a.model).toBe("memory-stub");
    expect(Array.isArray(a.riskTags)).toBe(true);
    expect(a.artifacts).toEqual(["memory:yanqi:perceive"]);
  });

  it("invokeStep 响应文本注入 context.artifacts 前序产物计数", async () => {
    const ai = createMemoryAgent();
    const res = await ai.invokeStep(
      request({
        input: { prompt: "p" },
        context: { traceId: TRACE, sessionId: "s", artifacts: ["memory:yanqi:act", "memory:yanqi:observe"] },
      }),
    );
    expect(res.text).toContain("2 项前序产物");
  });

  it("回滚语义：未知 agentId 任何产出前抛 AgentError（unknown-agent / retryable=false / 锚点齐备）", async () => {
    const ai = createMemoryAgent();
    let caught: AgentError | null = null;
    try {
      await ai.invokeStep(request({ agentId: "ghost" }));
    } catch (error) {
      caught = error as AgentError;
    }
    expect(caught).not.toBeNull();
    expect(caught!.name).toBe("AgentError");
    expect(caught!.code).toBe("unknown-agent");
    expect(caught!.retryable).toBe(false);
    expect(caught!.traceId).toBe(TRACE);
    expect(caught!.agentId).toBe("ghost");
    expect(caught!.stepKey).toBe("perceive");
    expect(caught!.message).toContain("ghost");
  });

  it.each(REACT_C_STEPS.map((s) => s.key))(
    "九步单步推进 · %s：同 traceId 串联、artifacts 按步区分",
    async (stepKey) => {
      const ai = createMemoryAgent();
      const res = await ai.invokeStep(request({ stepKey }));
      expect(res.agentId).toBe("yanqi");
      expect(res.text).toContain(stepKey);
      expect(res.artifacts).toEqual([`memory:yanqi:${stepKey}`]);
    },
  );

  it("组合根实际供给 ai 端口（AppPorts 接线断裂即红）：八员目录 + 端到端确定性", async () => {
    const ports = getPorts();
    expect(typeof ports.ai.listAgents).toBe("function");
    expect(typeof ports.ai.invokeStep).toBe("function");
    const agents = await ports.ai.listAgents();
    expect(agents).toHaveLength(8);
    const res = await ports.ai.invokeStep(request({ input: { prompt: "端到端" } }));
    expect(res.agentId).toBe("yanqi");
    expect(res.model).toBe("memory-stub");
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
