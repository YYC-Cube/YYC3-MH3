/**
 * file: src/__tests__/ai-registry.test.ts
 * description: PR-1 契约测试 · AGENT_REGISTRY 八员注册表快照 + AgentPort v2 端口形状
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[contract],[ai],[registry],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-1 验收 —
 *   ① AGENT_REGISTRY 八员快照（id 全集/顺序与 YYC3_MEMBERS 一致）
 *   ② 派生字段直读（name/roleDefinition 逐员相等；capabilities 拷贝防外泄）
 *   ③ defaultModel 与 riskTags 基线（MiniMax-Text-01 全员；zhiyun = local-only）
 *   ④ AgentPort v2 形状契约（listAgents/invokeStep 运行时 stub 断言六要素出参）
 *
 * dependencies: vitest, ../data/aiRegistry, ../data/yyc3Data, ../domains/ai, ../domains/ai/ports
 * exports: (test)
 */
import { describe, expect, it } from "vitest";

import { AGENT_REGISTRY } from "../data/aiRegistry";
import { YYC3_MEMBERS } from "../data/yyc3Data";
import { REACT_C_STEPS } from "../domains/ai";
import type { AgentContext, AgentInput, AgentOutput, AgentPort, AgentTool } from "../domains/ai/ports";
import type { AgentProfile } from "../types";

describe("[ai-registry] PR-1 · 八员调用主体注册表", () => {
  it("快照：恰为 8 员，id 全集与顺序和 YYC3_MEMBERS 逐一一致", () => {
    expect(AGENT_REGISTRY).toHaveLength(8);
    expect(AGENT_REGISTRY.map((p) => p.id)).toEqual(YYC3_MEMBERS.map((m) => m.id));
  });

  it("派生直读：name/roleDefinition 与源成员逐员相等（单一事实来源不复制漂移）", () => {
    for (const [i, member] of YYC3_MEMBERS.entries()) {
      const profile: AgentProfile | undefined = AGENT_REGISTRY[i];
      expect(profile?.name).toBe(member.name);
      expect(profile?.roleDefinition).toBe(member.roleDefinition);
    }
  });

  it("防外泄：capabilities 为派生拷贝（引用不同），源数据不被注册表共享", () => {
    for (const [i, member] of YYC3_MEMBERS.entries()) {
      const profile = AGENT_REGISTRY[i];
      expect(profile?.capabilities).toEqual(member.capabilities);
      expect(profile?.capabilities).not.toBe(member.capabilities);
    }
  });

  it("defaultModel 基线：全员 MiniMax-Text-01（适配器可按部署路由覆盖）", () => {
    for (const profile of AGENT_REGISTRY) {
      expect(profile.defaultModel).toBe("MiniMax-Text-01");
    }
  });

  it("riskTags 基线：zhiyun 守护 = [local-only]，其余七员为空", () => {
    for (const profile of AGENT_REGISTRY) {
      if (profile.id === "zhiyun") {
        expect([...profile.riskTags]).toEqual(["local-only"]);
      } else {
        expect([...profile.riskTags]).toEqual([]);
      }
    }
  });
});

describe("[ai-registry] PR-1 · AgentPort v2 端口形状契约", () => {
  const tools: readonly AgentTool[] = [];

  function makeContext(traceId: string): AgentContext {
    return { traceId, sessionId: "s-1" };
  }

  function makeInput(prompt: string): AgentInput {
    return { prompt };
  }

  it("listAgents 返回八员档案且为只读数组（AgentPort 契约面）", async () => {
    const stub: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep() {
        throw new Error("not under test");
      },
    };
    const profiles = await stub.listAgents();
    expect(profiles).toHaveLength(8);
    expect(profiles.map((p) => p.id)).toContain("qianli");
  });

  it("invokeStep 单步推进式：入参透传（traceId/tools/stepKey）且出参含留痕必填字段", async () => {
    const capture: {
      req?: {
        agentId: string;
        stepKey: string;
        input: AgentInput;
        context: AgentContext;
        tools: readonly AgentTool[];
      };
    } = {};

    const stub: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep(request) {
        capture.req = request;
        const output: AgentOutput = {
          agentId: request.agentId,
          text: `step:${request.stepKey}`,
          confidence: 0.9,
          tokensUsed: 8,
          model: "memory-stub",
          riskTags: [],
        };
        return output;
      },
    };

    const output = await stub.invokeStep({
      agentId: "yanqi",
      stepKey: "perceive",
      input: makeInput("解析提示词"),
      context: makeContext("trace-pr1"),
      tools,
    });

    // 入参透传断言
    expect(capture.req).toBeDefined();
    expect(capture.req?.context.traceId).toBe("trace-pr1");
    expect(capture.req?.input.prompt).toBe("解析提示词");
    expect(capture.req?.tools).toEqual([]);
    expect(REACT_C_STEPS.some((s) => s.key === capture.req?.stepKey)).toBe(true);

    // 出参六必填字段（留痕审计面：model / riskTags 不可缺席）
    expect(output.agentId).toBe("yanqi");
    expect(output.text).toBe("step:perceive");
    expect(output.confidence).toBe(0.9);
    expect(output.tokensUsed).toBe(8);
    expect(output.model).toBe("memory-stub");
    expect([...output.riskTags]).toEqual([]);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
