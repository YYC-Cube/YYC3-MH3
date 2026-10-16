/**
 * file: src/domains/ai/machine.ts
 * description: YYC³ AI 域 — ReAct-C 九步状态机（transition 转移表 + evaluateReflect 反思判定，纯函数零副作用）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[ai],[react-c],[state-machine],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-2 — 九步状态机（承接解耦设计 §二）：
 *   - 线性推进：perceive..act 经 STEP_OK 依次前进；observe 经 OBSERVED 进 reflect
 *   - 回环：reflect VERDICT(fail) 且 reviseRound<2 → revise(+1)；revise REVISED → act 重执行
 *   - 封顶：reflect VERDICT(fail) 且 reviseRound≥2 → consolidate(degraded=true) 强制终局
 *   - REVISED 路由裁定：按末次裁决分流——pass → consolidate（固化前修整）；fail → act（回环）
 *   - 步内重试：STEP_FAIL(retryable) 原步驻留 ≤3 次；耗尽 / 不可重试 / 预算超限 → failed
 *     （缩参重试属 runner 层新任务，预算在机器层面终局）
 *   - 人工接管：failed + HANDOFF → handoff-required（断点由 runner 落 checkpoint）
 *   - 纯度：返回全新 state（不 mutate 入参），checkpoint 可安全快照；
 *     output/observation 载荷不入机（留痕走 runner 的 trace 通道），机器仅承载路由语义
 *   - evaluateReflect：Step7 判定纯函数，保守基线 confidence≥0.75 且无禁用风险标签
 *
 * dependencies: ./index, ./ports
 * exports: ReactCEvent, ReactCVerdict, ReactCState, createInitialReactCState, transition,
 *          REVISE_ROUND_CAP, STEP_RETRY_CAP, ReflectThresholds, DEFAULT_REFLECT_THRESHOLDS, evaluateReflect
 */
import { REACT_C_STEPS, type ReactCStepKey } from "./index";
import type { AgentError, AgentOutput } from "./ports";

/** 复检回环上限：最多 2 次 7→8→5→6→7 回环，第 3 次 reflect fail 必然终局 */
export const REVISE_ROUND_CAP = 2;
/** 步内重试上限：同一工作步最多驻留重试 3 次，耗尽转 failed */
export const STEP_RETRY_CAP = 3;

/** 状态机事件（编排器 runner 依适配器产出合成，机器不直接消费传输细节） */
export type ReactCEvent =
  | { type: "SUBMIT" }
  | { type: "STEP_OK"; output: AgentOutput }
  | { type: "STEP_FAIL"; error: AgentError }
  | { type: "OBSERVED"; observation: string }
  | { type: "VERDICT"; pass: boolean; score: number }
  | { type: "REVISED" }
  | { type: "CANCEL" }
  | { type: "HANDOFF" };

/** 单次反思裁决记录（append-only，at 为注入时钟时刻） */
export interface ReactCVerdict {
  pass: boolean;
  score: number;
  at: number;
}

/** 状态机状态（全字段不可变；verdicts 为快照数组） */
export interface ReactCState {
  step: ReactCStepKey | "idle" | "done" | "failed" | "handoff-required";
  /** 回环轮次 [0, REVISE_ROUND_CAP]：每次 VERDICT(fail) 进入 revise 时 +1 */
  reviseRound: number;
  /** 步内重试计数 [0, STEP_RETRY_CAP]，步进成功即清零 */
  stepRetries: number;
  verdicts: readonly ReactCVerdict[];
  /** 复检封顶强制终局时为 true（终局产物须携带风险标签审计） */
  degraded: boolean;
}

export function createInitialReactCState(): ReactCState {
  return { step: "idle", reviseRound: 0, stepRetries: 0, verdicts: [], degraded: false };
}

/** 契约违例（traceId/agentId 由调用方 runner 以任务上下文补全） */
function contractViolation(message: string): AgentError {
  const error = new Error(message) as AgentError;
  error.name = "AgentError";
  error.code = "contract-violated";
  error.retryable = false;
  error.traceId = "";
  error.agentId = "";
  return error;
}

/** 线性 STEP_OK 推进的末步索引（act --STEP_OK--> observe；observe 须 OBSERVED 事件） */
const LINEAR_LAST_INDEX = 4;

function stepIndexOf(step: ReactCState["step"]): number {
  return REACT_C_STEPS.findIndex((s) => s.key === step);
}

/**
 * 九步状态机转移表（纯函数）：非法转移抛 AgentError(code="contract-violated")。
 * now 为注入时钟（verdicts 时间戳），缺省 Date.now。
 */
export function transition(state: ReactCState, event: ReactCEvent, now: number = Date.now()): ReactCState {
  const { step } = state;
  switch (event.type) {
    case "SUBMIT": {
      if (step !== "idle") throw contractViolation(`SUBMIT 仅限 idle（当前 ${step}）`);
      return { ...state, step: "perceive", stepRetries: 0 };
    }
    case "STEP_OK": {
      // 沉淀完成 → 闭环终态（设计转移表：9 consolidate | STEP_OK | done）
      if (step === "consolidate") return { ...state, step: "done", stepRetries: 0 };
      const index = stepIndexOf(step);
      if (index < 0 || index > LINEAR_LAST_INDEX) {
        throw contractViolation(`STEP_OK 仅限线性步 perceive..act 与 consolidate（当前 ${step}）`);
      }
      const next = REACT_C_STEPS[index + 1]?.key;
      if (!next) throw contractViolation(`线性推进越界（当前 ${step}）`);
      return { ...state, step: next, stepRetries: 0 };
    }
    case "STEP_FAIL": {
      if (stepIndexOf(step) < 0) throw contractViolation(`STEP_FAIL 仅限九步工作态（当前 ${step}）`);
      if (event.error.code === "budget-exceeded" || !event.error.retryable || state.stepRetries >= STEP_RETRY_CAP) {
        return { ...state, step: "failed", stepRetries: 0 };
      }
      return { ...state, stepRetries: state.stepRetries + 1 };
    }
    case "OBSERVED": {
      if (step !== "observe") throw contractViolation(`OBSERVED 仅限 observe（当前 ${step}）`);
      return { ...state, step: "reflect", stepRetries: 0 };
    }
    case "VERDICT": {
      if (step !== "reflect") throw contractViolation(`VERDICT 仅限 reflect（当前 ${step}）`);
      const verdicts: readonly ReactCVerdict[] = [...state.verdicts, { pass: event.pass, score: event.score, at: now }];
      if (event.pass) return { ...state, step: "revise", verdicts, stepRetries: 0 };
      if (state.reviseRound >= REVISE_ROUND_CAP) {
        return { ...state, step: "consolidate", verdicts, degraded: true, stepRetries: 0 };
      }
      return { ...state, step: "revise", reviseRound: state.reviseRound + 1, verdicts, stepRetries: 0 };
    }
    case "REVISED": {
      if (step !== "revise") throw contractViolation(`REVISED 仅限 revise（当前 ${step}）`);
      const last = state.verdicts[state.verdicts.length - 1];
      if (!last) throw contractViolation("REVISED 缺少前置 VERDICT 裁决记录");
      // pass → 固化前修整进沉淀；fail → 回环重执行（act → observe → reflect 复检）
      return last.pass ? { ...state, step: "consolidate", stepRetries: 0 } : { ...state, step: "act", stepRetries: 0 };
    }
    case "CANCEL": {
      if (stepIndexOf(step) < 0) throw contractViolation(`CANCEL 仅限九步工作态（当前 ${step}）`);
      return { ...state, step: "failed", stepRetries: 0 };
    }
    case "HANDOFF": {
      if (step !== "failed") throw contractViolation(`HANDOFF 仅限 failed（当前 ${step}）`);
      return { ...state, step: "handoff-required", stepRetries: 0 };
    }
  }
}

/** 反思判定阈值（score 基线为置信度；工业级校准需真实流量数据） */
export interface ReflectThresholds {
  minConfidence: number;
  forbiddenRiskTags?: readonly string[];
}

/** 保守首版基线：confidence ≥ 0.75 且无 "error" 风险标签 */
export const DEFAULT_REFLECT_THRESHOLDS: ReflectThresholds = {
  minConfidence: 0.75,
  forbiddenRiskTags: ["error"],
};

/** Step7 判定纯函数：编排器据其产出合成 VERDICT 事件（适配器不裁决） */
export function evaluateReflect(
  output: AgentOutput,
  thresholds: ReflectThresholds = DEFAULT_REFLECT_THRESHOLDS,
): { pass: boolean; score: number } {
  const forbidden = thresholds.forbiddenRiskTags ?? [];
  const flagged = output.riskTags.some((tag) => forbidden.includes(tag));
  return { pass: !flagged && output.confidence >= thresholds.minConfidence, score: output.confidence };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
