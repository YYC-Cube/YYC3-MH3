/**
 * file: src/__tests__/agent-runtime.test.ts
 * description: YYC³ Agent 运行时客户端单例测试（env 适配器切换 / 端到端命令-事件闭环 / 幂等 / 协作式取消 / 单例）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[app],[agent-runtime],[orchestrator],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-5 UI 改接验收 —— createAgentRuntime 装配契约：
 *   ① env NEXT_PUBLIC_AI_ADAPTER 四态切换（非法值回落 memory；vllm 缺
 *      NEXT_PUBLIC_VLLM_BASE_URL 构造期 fail-fast）；② autoStart=false 零泵
 *      （SSR/RSC 语义）；③ 端到端命令-事件闭环（submit → worker 泵 → runner
 *      九步 → TASK_COMPLETED，traceId 全链路一致）；④ taskId 幂等去重；
 *      ⑤ 协作式取消（STEP_ENTERED 时 cancel → 当前步完成后 TASK_FAILED
 *      (cancelled)）；⑥ 未知 taskId 取消返回 false；⑦ getAgentRuntime 单例
 *      与 resetAgentRuntime 重建。
 *
 * dependencies: vitest, ../adapters/memory/fixtures, ../app/agent-runtime, ../domains/ai/ports, ../orchestrator/protocol
 * exports: —
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createAgentRuntime,
  getAgentRuntime,
  resetAgentRuntime,
} from "../app/agent-runtime";
import type { AgentOutput, AgentPort } from "../domains/ai/ports";
import type { AgentTaskEvent } from "../orchestrator/protocol";

afterEach(() => {
  resetAgentRuntime();
  vi.unstubAllEnvs();
});

/** 标准命令（agentId 取八员首员；taskId 逐例唯一） */
const command = (taskId: string) => ({
  kind: "agent.invoke" as const,
  taskId,
  agentId: "yanqi",
  input: { prompt: "运行时端到端" },
  sessionId: "sess-runtime",
});

/** 确定性单步产出（与 memory 桩同形状） */
const stubOutput = (stepKey: string): AgentOutput => ({
  agentId: "yanqi",
  text: `stub · ${stepKey}`,
  confidence: 0.9,
  tokensUsed: 64,
  model: "memory-stub",
  riskTags: [],
  artifacts: [`stub:${stepKey}`],
});

/** 慢桩适配器：每步延迟 delayMs（协作式取消时序锚点） */
function createSlowAgent(delayMs: number): AgentPort {
  return {
    async listAgents() {
      return [{ id: "yanqi" }, { id: "yuqi" }] as never;
    },
    async invokeStep(request: Parameters<AgentPort["invokeStep"]>[0]) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return stubOutput(request.stepKey);
    },
  };
}

describe("AgentRuntime 装配契约", () => {
  it("默认 memory 适配器 + autoStart=false 零泵：adapterId/八员目录/workerRunning=false", async () => {
    const runtime = createAgentRuntime({ autoStart: false });
    expect(runtime.adapterId()).toBe("memory");
    expect(runtime.workerRunning()).toBe(false);
    const agents = await runtime.agent().listAgents();
    expect(agents).toHaveLength(8);
    runtime.stop();
  });

  it("env NEXT_PUBLIC_AI_ADAPTER=local 切换适配器标识（构造零外联）", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_ADAPTER", "local");
    const runtime = createAgentRuntime({ autoStart: false });
    expect(runtime.adapterId()).toBe("local");
    runtime.stop();
  });

  it("env 非法值回落 memory（断网默认，永不因配置白屏）", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_ADAPTER", "quantum");
    const runtime = createAgentRuntime({ autoStart: false });
    expect(runtime.adapterId()).toBe("memory");
    runtime.stop();
  });

  it("vllm fail-fast：env 基址为空且无显式注入 → 构造期抛错（防意外外联）", () => {
    vi.stubEnv("NEXT_PUBLIC_VLLM_BASE_URL", "");
    expect(() => createAgentRuntime({ adapterId: "vllm", autoStart: false })).toThrow(/baseUrl/);
  });
});

describe("AgentRuntime 命令-事件闭环", () => {
  it("端到端：submit → worker 泵 → 九步 → TASK_COMPLETED（traceId 全链路一致）", async () => {
    const runtime = createAgentRuntime({ autoStart: true });
    const events: AgentTaskEvent[] = [];
    runtime.subscribe((event) => events.push(event));
    const accepted = await runtime.submit(command("task-e2e"));
    expect(accepted.accepted).toBe(true);
    await vi.waitFor(
      () => {
        expect(events.some((e) => e.type === "TASK_COMPLETED")).toBe(true);
      },
      { timeout: 2000 },
    );
    const completed = events.find((e) => e.type === "TASK_COMPLETED")!;
    expect(completed.taskId).toBe("task-e2e");
    expect(new Set(events.map((e) => e.traceId)).size).toBe(1);
    expect(events[0]!.type).toBe("TASK_ACCEPTED");
    expect(events.filter((e) => e.type === "STEP_ENTERED")).toHaveLength(9);
    runtime.stop();
  });

  it("taskId 幂等去重：重发拒绝（duplicate），任务只跑一次", async () => {
    const runtime = createAgentRuntime({ autoStart: true });
    const events: AgentTaskEvent[] = [];
    runtime.subscribe((event) => events.push(event));
    expect((await runtime.submit(command("task-dup"))).accepted).toBe(true);
    const second = await runtime.submit(command("task-dup"));
    expect(second.accepted).toBe(false);
    expect(second.reason).toBe("duplicate");
    await vi.waitFor(
      () => {
        expect(events.filter((e) => e.type === "TASK_ACCEPTED")).toHaveLength(1);
      },
      { timeout: 2000 },
    );
    runtime.stop();
  });

  it("协作式取消：STEP_ENTERED 时 cancel → 当前步完成后 TASK_FAILED(cancelled)", async () => {
    const runtime = createAgentRuntime({ adapter: createSlowAgent(20), autoStart: true });
    const events: AgentTaskEvent[] = [];
    runtime.subscribe((event) => {
      events.push(event);
      if (event.type === "STEP_ENTERED") runtime.cancel(event.taskId); // 首步进入即请求取消
    });
    await runtime.submit(command("task-cancel"));
    await vi.waitFor(
      () => {
        expect(events.some((e) => e.type === "TASK_FAILED")).toBe(true);
      },
      { timeout: 2000 },
    );
    const failed = events.find((e) => e.type === "TASK_FAILED")!;
    expect(failed.error.code).toBe("cancelled");
    expect(failed.error.retryable).toBe(false);
    expect(events.filter((e) => e.type === "STEP_ENTERED")).toHaveLength(1); // 当前步完成后即终局
    runtime.stop();
  });

  it("取消未知/已终态 taskId 返回 false（取消表语义）", async () => {
    const runtime = createAgentRuntime({ adapter: createSlowAgent(20), autoStart: false });
    expect(runtime.cancel("ghost-task")).toBe(false);
    runtime.stop();
  });
});

describe("AgentRuntime 单例", () => {
  it("getAgentRuntime 模块级单例：两次调用同引用，reset 后重建", () => {
    const a = getAgentRuntime();
    const b = getAgentRuntime();
    expect(a).toBe(b);
    resetAgentRuntime();
    expect(getAgentRuntime()).not.toBe(a);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
