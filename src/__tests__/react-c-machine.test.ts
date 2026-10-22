/**
 * file: src/__tests__/react-c-machine.test.ts
 * description: PR-2 契约测试 · ReAct-C 九步状态机（线性主路径 / 回环复检封顶 / 重试失败 / 非法转移 / evaluateReflect）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[contract],[ai],[react-c],[state-machine]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-2 验收 —— transition + evaluateReflect 契约闭合（≥15 用例）：
 *   A 线性主路径（SUBMIT..done 十事件与 REACT_C_STEPS 九步对齐 + 不可变纯度）
 *   B 回环与复检封顶（fail→revise+1→act 回环 ×2；第 3 次 fail 强制 degraded 终局；pass 裁决不受回环计数拖累）
 *   C 步内重试与失败（retryable 驻留 ≤3；耗尽/不可重试/预算超限→failed；HANDOFF 人工接管；CANCEL 回滚）
 *   D 非法转移（终态零出边 / 跳步 / 越权事件一律抛 contract-violated）
 *   E evaluateReflect（置信度阈值 / 禁用风险标签 / 自定义阈值注入）
 *
 * dependencies: vitest, ../domains/ai, ../domains/ai/machine, ../domains/ai/ports
 * exports: (test)
 */
import { describe, expect, it } from "vitest";

import { REACT_C_STEPS } from "../domains/ai";
import {
  createInitialReactCState,
  evaluateReflect,
  transition,
  type ReactCEvent,
  type ReactCState,
} from "../domains/ai/machine";
import type { AgentError, AgentOutput } from "../domains/ai/ports";

const NOW = 1_770_000_000_000;

/** STEP_OK 事件（output 载荷不入机，仅透传形状合规的最小产出） */
function ok(): ReactCEvent {
  const output: AgentOutput = {
    agentId: "yanqi",
    text: "",
    confidence: 1,
    tokensUsed: 0,
    model: "memory-stub",
    riskTags: [],
  };
  return { type: "STEP_OK", output };
}

/** STEP_FAIL 事件（缺省 retryable tool-failed，可按用例覆写） */
function failEvent(over: Partial<AgentError> = {}): ReactCEvent {
  const error = new Error("boom") as AgentError;
  error.code = "tool-failed";
  error.retryable = true;
  error.traceId = "t-1";
  error.agentId = "yanqi";
  Object.assign(error, over);
  return { type: "STEP_FAIL", error };
}

/** 线性推进到目标步（SUBMIT + n 次 STEP_OK）：act=4 步、observe=5 步 */
function linearTo(stopIndex: number): ReactCState {
  let state = transition(createInitialReactCState(), { type: "SUBMIT" }, NOW);
  for (let i = 0; i < stopIndex; i += 1) state = transition(state, ok(), NOW);
  return state;
}

/** 推进到 reflect（observe + OBSERVED） */
function toReflect(): ReactCState {
  return transition(linearTo(5), { type: "OBSERVED", observation: "obs" }, NOW);
}

/** 走完 n 轮 fail 回环后的 reflect 态（每轮：fail→revise→REVISED→act→observe→reflect） */
function reflectedAfter(failRounds: number): ReactCState {
  let state = toReflect();
  for (let r = 0; r < failRounds; r += 1) {
    state = transition(state, { type: "VERDICT", pass: false, score: 0.4 }, NOW);
    state = transition(state, { type: "REVISED" }, NOW);
    state = transition(state, ok(), NOW);
    state = transition(state, { type: "OBSERVED", observation: "obs" }, NOW);
  }
  return state;
}

describe("[react-c-machine] A · 线性主路径", () => {
  it("SUBMIT：idle → perceive，计数清零", () => {
    const next = transition(createInitialReactCState(), { type: "SUBMIT" }, NOW);
    expect(next.step).toBe("perceive");
    expect(next.reviseRound).toBe(0);
    expect(next.stepRetries).toBe(0);
    expect(next.verdicts).toEqual([]);
  });

  it("线性链：perceive 经 STEP_OK 依次推进，与 REACT_C_STEPS 顺序逐一对齐", () => {
    let state = transition(createInitialReactCState(), { type: "SUBMIT" }, NOW);
    for (let i = 0; i < 5; i += 1) {
      const expected = REACT_C_STEPS[i + 1]?.key;
      state = transition(state, ok(), NOW);
      expect(state.step).toBe(expected);
      expect(state.stepRetries).toBe(0);
    }
  });

  it("OBSERVED：observe → reflect（观察喂给反思）", () => {
    const next = transition(linearTo(5), { type: "OBSERVED", observation: "ok" }, NOW);
    expect(next.step).toBe("reflect");
  });

  it("VERDICT pass：reflect → revise，裁决入账（pass/score/at=注入时钟）", () => {
    const next = transition(toReflect(), { type: "VERDICT", pass: true, score: 0.9 }, NOW);
    expect(next.step).toBe("revise");
    expect(next.reviseRound).toBe(0);
    expect(next.verdicts).toEqual([{ pass: true, score: 0.9, at: NOW }]);
  });

  it("REVISED（pass 路径）→ consolidate；STEP_OK@consolidate → done 闭环完成", () => {
    let state = transition(toReflect(), { type: "VERDICT", pass: true, score: 0.9 }, NOW);
    state = transition(state, { type: "REVISED" }, NOW);
    expect(state.step).toBe("consolidate");
    expect(state.degraded).toBe(false);
    state = transition(state, ok(), NOW);
    expect(state.step).toBe("done");
    expect(state.degraded).toBe(false);
  });

  it("全程主路径：SUBMIT 起 10 事件恰好走完九步，无回环即 v1 线性语义", () => {
    let state = createInitialReactCState();
    const events: ReactCEvent[] = [
      { type: "SUBMIT" },
      ok(),
      ok(),
      ok(),
      ok(),
      ok(),
      { type: "OBSERVED", observation: "obs" },
      { type: "VERDICT", pass: true, score: 0.9 },
      { type: "REVISED" },
      ok(),
    ];
    for (const event of events) state = transition(state, event, NOW);
    expect(state.step).toBe("done");
    expect(state.verdicts).toHaveLength(1);
  });

  it("纯度：transition 返回全新 state，入参不被 mutate（checkpoint 可安全快照）", () => {
    const before = createInitialReactCState();
    const after = transition(before, { type: "SUBMIT" }, NOW);
    expect(after).not.toBe(before);
    expect(before.step).toBe("idle");
    const advanced = transition(after, ok(), NOW);
    expect(advanced).not.toBe(after);
    expect(after.step).toBe("perceive");
  });
});

describe("[react-c-machine] B · 回环与复检封顶", () => {
  it("第 1 次 fail：reflect → revise 且 reviseRound=1（裁决 fail 入账）", () => {
    const next = transition(toReflect(), { type: "VERDICT", pass: false, score: 0.4 }, NOW);
    expect(next.step).toBe("revise");
    expect(next.reviseRound).toBe(1);
    expect(next.verdicts[0]?.pass).toBe(false);
  });

  it("REVISED（fail 路径）→ act 回环重执行", () => {
    const failed = transition(toReflect(), { type: "VERDICT", pass: false, score: 0.4 }, NOW);
    expect(transition(failed, { type: "REVISED" }, NOW).step).toBe("act");
  });

  it("两轮回环后复检 pass：revise → REVISED → consolidate，degraded=false（pass 不受计数拖累）", () => {
    let state = reflectedAfter(2);
    expect(state.reviseRound).toBe(2);
    state = transition(state, { type: "VERDICT", pass: true, score: 0.9 }, NOW);
    expect(state.step).toBe("revise");
    state = transition(state, { type: "REVISED" }, NOW);
    expect(state.step).toBe("consolidate");
    expect(state.degraded).toBe(false);
  });

  it("第 3 次 fail（reviseRound≥2）：强制 consolidate 且 degraded=true（复检封顶终局）", () => {
    const state = transition(reflectedAfter(2), { type: "VERDICT", pass: false, score: 0.3 }, NOW);
    expect(state.step).toBe("consolidate");
    expect(state.degraded).toBe(true);
    expect(state.verdicts).toHaveLength(3);
  });

  it("degraded 终局：consolidate + STEP_OK → done 且 degraded 留痕（风险标签审计位）", () => {
    const capped = transition(reflectedAfter(2), { type: "VERDICT", pass: false, score: 0.3 }, NOW);
    const done = transition(capped, ok(), NOW);
    expect(done.step).toBe("done");
    expect(done.degraded).toBe(true);
  });
});

describe("[react-c-machine] C · 步内重试与失败分支", () => {
  it("retryable STEP_FAIL：原步驻留，stepRetries 递增", () => {
    const act = linearTo(4);
    const once = transition(act, failEvent(), NOW);
    expect(once.step).toBe("act");
    expect(once.stepRetries).toBe(1);
    expect(transition(once, failEvent(), NOW).stepRetries).toBe(2);
  });

  it("重试耗尽：第 4 次 retryable STEP_FAIL → failed（≤3 次上限）", () => {
    let state = linearTo(4);
    for (let i = 0; i < 3; i += 1) state = transition(state, failEvent(), NOW);
    expect(state.step).toBe("act");
    state = transition(state, failEvent(), NOW);
    expect(state.step).toBe("failed");
  });

  it("不可重试 STEP_FAIL（unknown-agent）→ 立即 failed（零部分状态回滚语义）", () => {
    const next = transition(linearTo(4), failEvent({ code: "unknown-agent", retryable: false }), NOW);
    expect(next.step).toBe("failed");
  });

  it("预算超限（retryable=true 亦终局）→ failed（缩参重试属 runner 新任务）", () => {
    const next = transition(linearTo(4), failEvent({ code: "budget-exceeded" }), NOW);
    expect(next.step).toBe("failed");
  });

  it("failed + HANDOFF → handoff-required（断点 checkpoint 由 runner 落盘）", () => {
    const failed = transition(linearTo(4), failEvent({ retryable: false }), NOW);
    expect(transition(failed, { type: "HANDOFF" }, NOW).step).toBe("handoff-required");
  });

  it("工作态 CANCEL（act）→ failed 回滚；终态 CANCEL 为非法转移", () => {
    expect(transition(linearTo(4), { type: "CANCEL" }, NOW).step).toBe("failed");
    expect(() => transition(createInitialReactCState(), { type: "CANCEL" }, NOW)).toThrow();
  });
});

describe("[react-c-machine] D · 非法转移（contract-violated）", () => {
  it("idle + STEP_OK → 抛（未经 SUBMIT 启动）", () => {
    expect(() => transition(createInitialReactCState(), ok(), NOW)).toThrow();
    try {
      transition(createInitialReactCState(), ok(), NOW);
    } catch (error) {
      expect((error as AgentError).code).toBe("contract-violated");
      expect((error as AgentError).retryable).toBe(false);
    }
  });

  it("done 终态零出边：SUBMIT / STEP_OK 均抛（新任务须新状态机实例）", () => {
    let state = createInitialReactCState();
    for (const event of [
      { type: "SUBMIT" } as ReactCEvent,
      ok(),
      ok(),
      ok(),
      ok(),
      ok(),
      { type: "OBSERVED", observation: "o" } as ReactCEvent,
      { type: "VERDICT", pass: true, score: 1 } as ReactCEvent,
      { type: "REVISED" } as ReactCEvent,
      ok(),
    ]) {
      state = transition(state, event, NOW);
    }
    expect(state.step).toBe("done");
    expect(() => transition(state, { type: "SUBMIT" }, NOW)).toThrow();
    expect(() => transition(state, ok(), NOW)).toThrow();
  });

  it("reflect + STEP_OK 未经 VERDICT → 抛（reflect 唯一出口为裁决）", () => {
    expect(() => transition(toReflect(), ok(), NOW)).toThrow();
  });

  it("observe + STEP_OK → 抛（observe 唯一出口为 OBSERVED）", () => {
    expect(() => transition(linearTo(5), ok(), NOW)).toThrow();
  });

  it("failed + SUBMIT → 抛（恢复须走 runner checkpoint，不在机器层重入）", () => {
    const failed = transition(linearTo(4), failEvent({ retryable: false }), NOW);
    expect(() => transition(failed, { type: "SUBMIT" }, NOW)).toThrow();
  });

  it("hand-crafted revise 态缺裁决记录 + REVISED → 抛（防御外部构造状态）", () => {
    const crafted: ReactCState = { step: "revise", reviseRound: 1, stepRetries: 0, verdicts: [], degraded: false };
    expect(() => transition(crafted, { type: "REVISED" }, NOW)).toThrow();
  });
});

describe("[react-c-machine] E · evaluateReflect 判定", () => {
  const base: AgentOutput = {
    agentId: "yanqi",
    text: "",
    confidence: 0.9,
    tokensUsed: 8,
    model: "memory-stub",
    riskTags: [],
  };

  it("confidence 0.9 无风险标签 → pass，score=0.9（保守基线 0.75）", () => {
    expect(evaluateReflect(base)).toEqual({ pass: true, score: 0.9 });
  });

  it("confidence 0.74 低于阈值 → fail", () => {
    expect(evaluateReflect({ ...base, confidence: 0.74 }).pass).toBe(false);
  });

  it("命中禁用风险标签 error → fail（高置信度亦不豁免）", () => {
    expect(evaluateReflect({ ...base, riskTags: ["error"] }).pass).toBe(false);
  });

  it("自定义阈值注入：minConfidence 0.5 → 0.6 判 pass（阈值可按 AgentProfile 校准）", () => {
    expect(evaluateReflect({ ...base, confidence: 0.6 }, { minConfidence: 0.5 }).pass).toBe(true);
  });

  it("裁决编排闭环：evaluateReflect 产出可直喂 VERDICT 事件驱动状态机", () => {
    const verdict = evaluateReflect({ ...base, confidence: 0.5 });
    const next = transition(toReflect(), { type: "VERDICT", ...verdict }, NOW);
    expect(next.step).toBe("revise");
    expect(next.verdicts[0]?.pass).toBe(false);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
