/**
 * file: src/__tests__/orchestrator.test.ts
 * description: PR-3 契约测试 · 编排内核（命令总线幂等 / runner 全生命周期 / 回环降级 / 断点恢复 / 泵 / 禁令零命中）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[contract],[orchestrator],[react-c],[react-c-runner]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-3 验收 ——
 *   A 事件总线（发布订阅/退订/监听器故障隔离）
 *   B 命令总线（入队形状/taskId 幂等去重）
 *   C runner 成功生命周期（事件序列：ACCEPTED + 9×(ENTERED+EXITED) + COMPLETED）
 *   D 回环与降级（fail→REVISE_ROUND→复检；复检封顶 TASK_DEGRADED）
 *   E 失败族（unknown-agent 前置拒绝 / invokeStep 重试耗尽 / 预算超限 / HANDOFF_REQUIRED 断点）
 *   F 断点恢复（每步退场落 checkpoint；resume 同 traceId 续跑至完成）
 *   G worker 泵（假时钟：取队执行/空转/stop 生效/非 Agent 载荷跳过）
 *   H 禁令静态扫描（orchestrator 目录零 react/next/document/window/localStorage/fetch/XHR/WebSocket）
 *
 * dependencies: vitest, fs, path, ../orchestrator/*, ../domains/ai/*
 * exports: (test)
 */
import { describe, expect, it } from "vitest";

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { AGENT_REGISTRY } from "../data/aiRegistry";
import { createInitialReactCState } from "../domains/ai/machine";
import type { AgentOutput, AgentPort } from "../domains/ai/ports";
import type { QueueTask, TaskQueuePort } from "../domains/platform/queue/ports";
import { AGENT_TASK_TYPE, createCommandBus } from "../orchestrator/command-bus";
import { createEventBus, type AgentCommand, type AgentTaskEvent } from "../orchestrator/protocol";
import { createMemoryCheckpointStore, rollback } from "../orchestrator/resilience";
import { runTask, type AgentRunDeps } from "../orchestrator/runner";
import { createAgentWorker } from "../orchestrator/worker";

const NOW = 1_770_000_000_000;
const TRACE = "trace-fixed";

/** 注入式内存队列（记录入队；dequeue FIFO） */
function memoryQueue(): TaskQueuePort<AgentCommand> & { enqueued: QueueTask<AgentCommand>[] } {
  const items: QueueTask<AgentCommand>[] = [];
  const port: TaskQueuePort<AgentCommand> = {
    async enqueue(task: QueueTask<AgentCommand>) {
      items.push(task);
    },
    async dequeue() {
      return items.shift() ?? null;
    },
    onEvent() {
      return () => undefined;
    },
  };
  return Object.assign(port, { enqueued: items });
}

/** 确定性依赖：固定时钟 + 固定 traceId + 事件收集器 */
function makeDeps(agent: AgentPort, overrides: Partial<AgentRunDeps> = {}) {
  const events: AgentTaskEvent[] = [];
  const bus = createEventBus<AgentTaskEvent>();
  bus.subscribe((e) => events.push(e));
  const deps: AgentRunDeps = {
    agent,
    bus,
    now: () => NOW,
    uuid: () => TRACE,
    store: createMemoryCheckpointStore(),
    ...overrides,
  };
  return { events, bus, deps };
}

function output(stepText: string, over: Partial<AgentOutput> = {}): AgentOutput {
  return { agentId: "yanqi", text: stepText, confidence: 0.9, tokensUsed: 8, model: "memory-stub", riskTags: [], ...over };
}

/** 一次 invokeStep 即成功的桩（按 stepKey 回文本） */
function okAgent(): AgentPort & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async listAgents() {
      return AGENT_REGISTRY;
    },
    async invokeStep(request) {
      calls.push(request.stepKey);
      return output(`step:${request.stepKey}`);
    },
  };
}

function command(over: Partial<AgentCommand> = {}): AgentCommand {
  return { kind: "agent.invoke", taskId: "t-1", agentId: "yanqi", input: { prompt: "p" }, sessionId: "s-1", ...over };
}

describe("[orchestrator] A · 事件总线", () => {
  it("发布订阅：监听器收全事件；退订后不再接收", () => {
    const bus = createEventBus<AgentTaskEvent>();
    const got: AgentTaskEvent[] = [];
    const unsub = bus.subscribe((e) => got.push(e));
    const event: AgentTaskEvent = { type: "TASK_ACCEPTED", taskId: "t", traceId: "tr", at: 1 };
    bus.publish(event);
    unsub();
    bus.publish(event);
    expect(got).toHaveLength(1);
    expect(bus.listenerCount()).toBe(0);
  });

  it("故障隔离：单监听器抛错不阻断其他监听器与发布方", () => {
    const bus = createEventBus<AgentTaskEvent>();
    const got: AgentTaskEvent[] = [];
    bus.subscribe(() => {
      throw new Error("boom");
    });
    bus.subscribe((e) => got.push(e));
    expect(() => bus.publish({ type: "TASK_ACCEPTED", taskId: "t", traceId: "tr", at: 1 })).not.toThrow();
    expect(got).toHaveLength(1);
  });
});

describe("[orchestrator] B · 命令总线", () => {
  it("submit 入队形状：QueueTask{id=taskId, type=agent.task, payload=命令}", async () => {
    const queue = memoryQueue();
    const bus = createCommandBus(queue);
    const result = await bus.submit(command({ taskId: "t-9" }));
    expect(result).toEqual({ accepted: true });
    expect(queue.enqueued[0]?.id).toBe("t-9");
    expect(queue.enqueued[0]?.type).toBe(AGENT_TASK_TYPE);
    expect(queue.enqueued[0]?.payload.taskId).toBe("t-9");
  });

  it("taskId 幂等：重发拒绝（duplicate），不重复入队", async () => {
    const queue = memoryQueue();
    const bus = createCommandBus(queue);
    await bus.submit(command({ taskId: "dup-1" }));
    const again = await bus.submit(command({ taskId: "dup-1" }));
    expect(again).toEqual({ accepted: false, reason: "duplicate" });
    expect(queue.enqueued).toHaveLength(1);
    expect(bus.seenCount()).toBe(1);
  });
});

describe("[orchestrator] C · runner 成功生命周期", () => {
  it("事件序列：ACCEPTED + 9×(ENTERED→EXITED) + COMPLETED，步序与九步一致且全带 traceId", async () => {
    const agent = okAgent();
    const { events, deps } = makeDeps(agent);
    const handle = runTask(command(), deps);
    const terminal = await handle.promise;

    expect(terminal.type).toBe("TASK_COMPLETED");
    expect(terminal.traceId).toBe(TRACE);
    const accepted = events[0];
    expect(accepted?.type).toBe("TASK_ACCEPTED");
    const steps = events.filter((e) => e.type === "STEP_ENTERED");
    expect(steps).toHaveLength(9);
    expect(steps.map((e) => e.stepKey)).toEqual([
      "perceive", "reason", "retrieve", "plan", "act", "observe", "reflect", "revise", "consolidate",
    ]);
    for (const event of events) expect(event.traceId).toBe(TRACE);
    expect(events[events.length - 1]?.type).toBe("TASK_COMPLETED");
    expect(agent.calls).toHaveLength(9);
  });

  it("EXITED 留痕四要素：durationMs/tokensUsed/model/riskTags 逐步回填", async () => {
    const { events, deps } = makeDeps(okAgent());
    await runTask(command(), deps).promise;
    const exited = events.filter((e) => e.type === "STEP_EXITED");
    expect(exited).toHaveLength(9);
    for (const e of exited) {
      expect(e.durationMs).toBe(0); // 注入恒定时钟
      expect(e.tokensUsed).toBe(8);
      expect(e.model).toBe("memory-stub");
      expect([...(e.riskTags ?? [])]).toEqual([]);
    }
  });

  it("工具透传：deps.tools 原样进入每次 invokeStep（白名单注入）", async () => {
    const seenTools: unknown[] = [];
    const agent: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep(request) {
        seenTools.push(request.tools);
        return output("x");
      },
    };
    const tool = { name: "probe", description: "d", invoke: async () => null };
    const { deps } = makeDeps(agent, { tools: [tool] });
    await runTask(command(), deps).promise;
    expect(seenTools).toHaveLength(9);
    expect(seenTools[0]).toEqual([tool]);
  });
});

describe("[orchestrator] D · 回环与降级", () => {
  it("reflect fail 一轮：REVISE_ROUND 事件 + 回环后复检 pass 完成（act 被重执行）", async () => {
    let reflectCalls = 0;
    const agent: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep(request) {
        if (request.stepKey === "reflect") {
          reflectCalls += 1;
          // 第 1 次反思 fail（低置信度）→ 回环；第 2 次复检 pass → 收敛
          return reflectCalls === 1 ? output("bad", { confidence: 0.3 }) : output("good", { confidence: 0.9 });
        }
        return output("ok");
      },
    };
    const { events, deps } = makeDeps(agent);
    await runTask(command(), deps).promise;

    expect(reflectCalls).toBe(2); // 第 1 次 fail → 回环复检
    const rounds = events.filter((e) => e.type === "REVISE_ROUND");
    expect(rounds).toHaveLength(1);
    expect(rounds[0]?.round).toBe(1);
    const acts = events.filter((e) => e.type === "STEP_ENTERED" && e.stepKey === "act");
    expect(acts).toHaveLength(2); // 首跑 + 回环重执行
    expect(events[events.length - 1]?.type).toBe("TASK_COMPLETED");
  });

  it("复检封顶：3 次 reflect 均 fail → TASK_DEGRADED（reviseRound=2）+ 风险标签留痕", async () => {
    const agent: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep(request) {
        return request.stepKey === "reflect" ? output("bad", { confidence: 0.1 }) : output("ok");
      },
    };
    const { events, deps } = makeDeps(agent);
    const terminal = await runTask(command(), deps).promise;

    expect(terminal.type).toBe("TASK_DEGRADED");
    if (terminal.type === "TASK_DEGRADED") {
      expect(terminal.reviseRound).toBe(2);
      expect(terminal.output.riskTags).toContain("degraded");
    }
    const reflects = events.filter((e) => e.type === "STEP_ENTERED" && e.stepKey === "reflect");
    expect(reflects).toHaveLength(3); // 首检 + 2 轮复检，第 3 次必终局
    const rounds = events.filter((e) => e.type === "REVISE_ROUND");
    expect(rounds).toHaveLength(2);
  });
});

describe("[orchestrator] E · 失败族", () => {
  it("unknown-agent：ENTERED 之前拒绝，TASK_FAILED(unknown-agent, retryable=false)", async () => {
    const agent: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY.slice(0, 1); // 仅含 yanqi
      },
      async invokeStep() {
        throw new Error("must-not-be-called");
      },
    };
    const { events, deps } = makeDeps(agent);
    const terminal = await runTask(command({ agentId: "gewu" }), deps).promise;
    expect(terminal.type).toBe("TASK_FAILED");
    if (terminal.type === "TASK_FAILED") {
      expect(terminal.error.code).toBe("unknown-agent");
      expect(terminal.error.retryable).toBe(false);
    }
    expect(events.filter((e) => e.type === "STEP_ENTERED")).toHaveLength(0);
    expect(events[events.length - 1]?.type).toBe("HANDOFF_REQUIRED");
  });

  it("invokeStep 持续抛：步内重试 3 次后终局，ENTERED×4（首跑+3 重试）", async () => {
    let calls = 0;
    const agent: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep() {
        calls += 1;
        throw new Error("flaky");
      },
    };
    const { events, deps } = makeDeps(agent);
    const terminal = await runTask(command(), deps).promise;
    expect(calls).toBe(4); // 首跑 1 + 重试 3（STEP_RETRY_CAP）
    expect(terminal.type).toBe("TASK_FAILED");
    if (terminal.type === "TASK_FAILED") expect(terminal.error.code).toBe("tool-failed");
    const enters = events.filter((e) => e.type === "STEP_ENTERED");
    expect(enters).toHaveLength(4);
  });

  it("预算超限：deadlineMs=0 时立即 TASK_FAILED(budget-exceeded) 且重试不发生", async () => {
    const agent: AgentPort = {
      async listAgents() {
        return AGENT_REGISTRY;
      },
      async invokeStep() {
        throw new Error("must-not-run");
      },
    };
    const { deps } = makeDeps(agent);
    const terminal = await runTask(command({ budget: { deadlineMs: 0 } }), deps).promise;
    expect(terminal.type).toBe("TASK_FAILED");
    if (terminal.type === "TASK_FAILED") {
      expect(terminal.error.code).toBe("budget-exceeded");
      expect(terminal.error.retryable).toBe(true);
    }
  });

  it("协作取消：cancel 后当前步完成即 TASK_FAILED(cancelled)，零后续步", async () => {
    const agent = okAgent();
    const { deps } = makeDeps(agent);
    const handle = runTask(command(), deps);
    handle.cancel();
    const terminal = await handle.promise;
    expect(terminal.type).toBe("TASK_FAILED");
    if (terminal.type === "TASK_FAILED") expect(terminal.error.code).toBe("cancelled");
    expect(agent.calls).toHaveLength(0);
  });
});

describe("[orchestrator] F · 断点与恢复", () => {
  it("每步退场落 checkpoint；rollback 产出审计摘要且不改写断点", async () => {
    const store = createMemoryCheckpointStore();
    const saves: string[] = [];
    const origSave = store.save.bind(store);
    store.save = async (cp) => {
      saves.push(cp.state.step);
      await origSave(cp);
    };
    const { deps } = makeDeps(okAgent(), { store });
    await runTask(command(), deps).promise;
    expect(saves[saves.length - 1]).toBe("done");
    const loaded = await store.load("t-1");
    expect(loaded?.traceId).toBe(TRACE);
    const summary = rollback({ taskId: "t-1", traceId: TRACE, agentId: "yanqi", state: createInitialReactCState(), at: NOW }, NOW);
    expect(summary).toEqual({ taskId: "t-1", traceId: TRACE, discardedStep: "idle", reviseRound: 0, at: NOW });
    expect((await store.load("t-1"))?.state.step).toBe("done"); // 回滚为纯函数，断点不被改写
  });

  it("resume 续跑：携带断点 state 同 traceId 从 observe 恢复至完成", async () => {
    const agent = okAgent();
    const { events, deps } = makeDeps(agent);
    // 断点：observe 步（resume.state 直接给出，模拟人工接管接管点）
    const resumeState = { ...createInitialReactCState(), step: "observe" as const };
    const cmd = command({ taskId: "resume-1", resume: { traceId: TRACE, state: resumeState } });
    const terminal = await runTask(cmd, deps).promise;

    expect(terminal.traceId).toBe(TRACE);
    const enters = events.filter((e) => e.type === "STEP_ENTERED");
    expect(enters.map((e) => e.stepKey)).toEqual(["observe", "reflect", "revise", "consolidate"]);
    expect(enters[0]?.type === "STEP_ENTERED" && enters[0]?.index).toBe(5);
    expect(events[events.length - 1]?.type).toBe("TASK_COMPLETED");
  });

  it("checkpoint 存储故障降级：save 抛错不阻断任务（onLog 留痕后照常完成）", async () => {
    const brokenStore = {
      save: async () => {
        throw new Error("idb-closed");
      },
      load: async () => null,
    };
    const logs: string[] = [];
    const { deps } = makeDeps(okAgent(), { store: brokenStore, onLog: (e) => logs.push(e.message) });
    const terminal = await runTask(command(), deps).promise;
    expect(terminal.type).toBe("TASK_COMPLETED");
    expect(logs.some((m) => m.includes("checkpoint-save-failed"))).toBe(true);
  });
});

describe("[orchestrator] G · worker 泵（注入调度）", () => {
  function immediateSchedule(): { schedule: (fn: () => void, ms: number) => void; pending: (() => void)[] } {
    const pending: (() => void)[] = [];
    return { schedule: (fn) => void pending.push(fn), pending };
  }

  it("取队执行：入队 1 命令 → tick 驱动 run → 终态事件回流", async () => {
    const queue = memoryQueue();
    await queue.enqueue({ id: "w-1", type: AGENT_TASK_TYPE, payload: command({ taskId: "w-1" }) });
    const { events, deps } = makeDeps(okAgent());
    const worker = createAgentWorker({ queue, run: (cmd) => runTask(cmd, deps).promise, schedule: immediateSchedule().schedule });
    worker.start();
    await worker.tick();
    worker.stop();
    expect(events[events.length - 1]?.type).toBe("TASK_COMPLETED");
    expect(events[0]?.taskId).toBe("w-1");
  });

  it("空队列空转与 stop 生效：stop 后 tick 为无操作（泵守卫）", async () => {
    const queue = memoryQueue();
    const { deps } = makeDeps(okAgent());
    const worker = createAgentWorker({ queue, run: (cmd) => runTask(cmd, deps).promise, schedule: immediateSchedule().schedule });
    worker.start();
    expect(worker.running()).toBe(true);
    worker.stop();
    expect(worker.running()).toBe(false);
    await expect(worker.tick()).resolves.toBeUndefined(); // alive=false 直接返回
  });

  it("非 Agent 载荷跳过且泵继续（onLog 告警）", async () => {
    const queue = memoryQueue();
    await queue.enqueue({ id: "x-1", type: "other.job", payload: command() });
    const warnings: string[] = [];
    const { deps } = makeDeps(okAgent());
    const worker = createAgentWorker({
      queue,
      run: (cmd) => runTask(cmd, deps).promise,
      schedule: immediateSchedule().schedule,
      onLog: (e) => warnings.push(e.message),
    });
    worker.start();
    await worker.tick();
    worker.stop();
    expect(warnings.some((m) => m.includes("skip-non-agent-task"))).toBe(true);
  });
});

describe("[orchestrator] H · 禁令静态扫描（内核零 UI/IO 原语）", () => {
  const DIR = path.resolve(__dirname, "../orchestrator");
  const files = readdirSync(DIR).filter((f) => f.endsWith(".ts"));
  const FORBIDDEN = [
    /from\s+["']react["']/, /from\s+["']next[/"']/, /\bdocument\./, /\bwindow\./,
    /\blocalStorage\b/, /\bsessionStorage\b/, /\bfetch\s*\(/, /XMLHttpRequest/, /new\s+WebSocket/,
  ];

  it("orchestrator 目录文件齐备且全部通过禁令扫描", () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(path.join(DIR, file), "utf8");
      for (const pattern of FORBIDDEN) {
        if (pattern.test(content)) violations.push(`${file}: 命中禁令 ${String(pattern)}`);
      }
    }
    expect(violations).toEqual([]);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
