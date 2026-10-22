/**
 * file: src/orchestrator/runner.ts
 * description: 编排内核 · ReAct-C 状态机驱动器（九步编排 / 预算强制 / 留痕事件 / checkpoint）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [orchestrator],[runner],[react-c],[state-machine]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-3 执行体——runTask 以 domains/ai/machine 转移表驱动九步闭环：
 *   线性步 perceive..act 与 observe/reflect/revise/consolidate 各按唯一事件推进；
 *   reflect 经 evaluateReflect 合成 VERDICT（适配器不裁决）；fail 回环发 REVISE_ROUND；
 *   STEP_FAIL 由机器裁定驻留重试/终局（重试 = 同步重调 invokeStep）；预算超限合成
 *   budget-exceeded 强制终局；每步退场落 checkpoint（失败不阻断）；终态四选一并回传；
 *   TASK_FAILED 后补发 HANDOFF_REQUIRED（断点在 store，人工接管经 resume 续跑）。
 *   取消为协作式：cancel() 置标志，当前步完成后 CANCEL 回滚。
 *
 * dependencies: ../domains/ai/index, ../domains/ai/machine, ../domains/ai/ports, ./protocol, ./resilience
 * exports: AgentRunDeps, AgentRunHandle, runTask
 */
import { REACT_C_STEPS, type ReactCStepKey } from "../domains/ai";
import {
  createInitialReactCState,
  evaluateReflect,
  transition,
  type ReactCEvent,
  type ReactCState,
} from "../domains/ai/machine";
import type { AgentError, AgentOutput, AgentPort, AgentTool } from "../domains/ai/ports";
import { type AgentCommand, type AgentTaskEvent, type EventBusPort } from "./protocol";
import { type TaskCheckpoint, type TaskCheckpointStore } from "./resilience";

export interface AgentRunDeps {
  agent: AgentPort;
  /** 白名单工具（构造时装配，runner 原样透传给每一步） */
  tools?: readonly AgentTool[];
  store?: TaskCheckpointStore;
  bus: EventBusPort<AgentTaskEvent>;
  /** 注入时钟（测试确定性；缺省 Date.now） */
  now?: () => number;
  /** traceId 发放（缺省 crypto.randomUUID） */
  uuid?: () => string;
  /** 韧性留痕回调（checkpoint 失败等降级事件） */
  onLog?: (entry: { level: "warn" | "error"; message: string; traceId: string }) => void;
}

export interface AgentRunHandle {
  /** 终态事件（TASK_COMPLETED / TASK_DEGRADED / TASK_FAILED） */
  promise: Promise<AgentTaskEvent>;
  /** 协作式取消：当前步完成后生效（已处于终态则无操作） */
  cancel(): void;
}

/** 合成机器事件用的 AgentError（code/retryable 由调用点裁定） */
function asAgentError(base: unknown, overrides: Partial<AgentError> = {}): AgentError {
  const error = base instanceof Error ? base : new Error(String(base));
  const agentError = error as AgentError;
  agentError.code = agentError.code ?? "tool-failed";
  agentError.retryable = agentError.retryable ?? true;
  agentError.traceId = agentError.traceId ?? "";
  agentError.agentId = agentError.agentId ?? "";
  return Object.assign(agentError, overrides) as AgentError;
}

/** 驱动一次机器转移并返回新状态（非法转移原样上抛，终态由调用方捕获裁定） */
function drive(state: ReactCState, event: ReactCEvent, now: number): ReactCState {
  return transition(state, event, now);
}

export function runTask(command: AgentCommand, deps: AgentRunDeps): AgentRunHandle {
  const { agent, bus } = deps;
  const now = deps.now ?? (() => Date.now());
  const uuid = deps.uuid ?? (() => globalThis.crypto.randomUUID());
  const tools = deps.tools ?? [];
  const store: TaskCheckpointStore | null = deps.store ?? null;

  let cancelled = false;
  let resolveDone: (event: AgentTaskEvent) => void = () => undefined;
  const promise = new Promise<AgentTaskEvent>((resolve) => {
    resolveDone = resolve;
  });

  const startedAt = now();
  const traceId = command.resume?.traceId ?? uuid();

  async function persist(taskId: string, state: ReactCState): Promise<void> {
    if (!store) return;
    const checkpoint: TaskCheckpoint = { taskId, traceId, agentId: command.agentId, state, at: now() };
    try {
      await store.save(checkpoint);
    } catch (error) {
      deps.onLog?.({ level: "warn", message: `checkpoint-save-failed:${String(error)}`, traceId });
    }
  }

  function emit(event: AgentTaskEvent): void {
    bus.publish(event);
  }

  /** 单步执行：ENTERED → invokeStep → EXITED + checkpoint（返回产出）或失败终局（返回 null） */
  async function stepOnce(
    taskId: string,
    state: ReactCState,
    stepKey: ReactCStepKey,
    input: AgentCommand["input"],
  ): Promise<{ output: AgentOutput } | { terminal: AgentTaskEvent }> {
    const index = REACT_C_STEPS.findIndex((s) => s.key === stepKey);
    emit({ type: "STEP_ENTERED", taskId, traceId, stepKey, index, startedAt: now(), reviseRound: state.reviseRound });
    const stepStart = now();

    // 协作式取消：进入工作步前检查（CANCEL 回滚态落断点后终局）
    if (cancelled) {
      const rolled = drive(state, { type: "CANCEL" }, now());
      await persist(taskId, rolled);
      return {
        terminal: {
          type: "TASK_FAILED",
          taskId,
          traceId,
          error: asAgentError(new Error("cancelled"), {
            code: "cancelled",
            retryable: false,
            traceId,
            agentId: command.agentId,
            stepKey,
          }),
        },
      };
    }

    // 预算强制：到 deadline 即超时（>= 使 0 预算立即终局），合成 budget-exceeded
    const deadlineMs = command.budget?.deadlineMs;
    if (deadlineMs !== undefined && now() - startedAt >= deadlineMs) {
      const timedOut = drive(
        state,
        {
          type: "STEP_FAIL",
          error: asAgentError(new Error("budget"), {
            code: "budget-exceeded",
            retryable: true,
            traceId,
            agentId: command.agentId,
            stepKey,
          }),
        },
        now(),
      );
      await persist(taskId, timedOut);
      return {
        terminal: {
          type: "TASK_FAILED",
          taskId,
          traceId,
          error: asAgentError(new Error(`deadline ${deadlineMs}ms exceeded`), {
            code: "budget-exceeded",
            retryable: true,
            traceId,
            agentId: command.agentId,
            stepKey,
          }),
        },
      };
    }

    try {
      const output = await agent.invokeStep({
        agentId: command.agentId,
        stepKey,
        input,
        context: { traceId, sessionId: command.sessionId, artifacts: output_artifacts?.artifacts },
        tools,
      });
      emit({
        type: "STEP_EXITED",
        taskId,
        traceId,
        stepKey,
        durationMs: now() - stepStart,
        tokensUsed: output.tokensUsed,
        model: output.model,
        riskTags: output.riskTags,
      });
      return { output };
    } catch (raw) {
      const error = asAgentError(raw, { traceId, agentId: command.agentId, stepKey });
      const next = drive(state, { type: "STEP_FAIL", error }, now());
      if (next.step === "failed") {
        const terminal: AgentTaskEvent = { type: "TASK_FAILED", taskId, traceId, error };
        return { terminal };
      }
      return stepOnce(taskId, next, stepKey, input); // 驻留重试（stepRetries 由机器计数）
    }
  }

  // 占位：上游产物沿（PR-3 单命令单步上下文，artifacts 供体在 PR-4 链式任务扩展）
  const output_artifacts: { artifacts?: readonly string[] } = {};

  async function execute(): Promise<void> {
    const taskId = command.taskId;

    // agentId 合法性校验（经端口供数，orchestrator 零 data 依赖）
    const profiles = await agent.listAgents().catch(() => null);
    if (!profiles || !profiles.some((p) => p.id === command.agentId)) {
      const terminal: AgentTaskEvent = {
        type: "TASK_FAILED",
        taskId,
        traceId,
        error: asAgentError(new Error("unknown-agent"), {
          code: "unknown-agent",
          retryable: false,
          traceId,
          agentId: command.agentId,
        }),
      };
      emit(terminal);
      emit({
        type: "HANDOFF_REQUIRED",
        taskId,
        traceId,
        checkpoint: { taskId, traceId, agentId: command.agentId, state: createInitialReactCState(), at: now() },
      });
      resolveDone(terminal);
      return;
    }

    emit({ type: "TASK_ACCEPTED", taskId, traceId, at: now() });

    let state: ReactCState;
    if (command.resume) {
      state = command.resume.state; // 断点续跑（同 traceId）
    } else {
      state = drive(createInitialReactCState(), { type: "SUBMIT" }, now());
    }

    while (state.step !== "done") {
      const stepKey = state.step as ReactCStepKey;
      const result = await stepOnce(taskId, state, stepKey, command.input);
      if ("terminal" in result) {
        emit(result.terminal);
        emit({
          type: "HANDOFF_REQUIRED",
          taskId,
          traceId,
          checkpoint: { taskId, traceId, agentId: command.agentId, state, at: now() },
        });
        resolveDone(result.terminal);
        return;
      }
      const output = result.output;

      switch (stepKey) {
        case "perceive":
        case "reason":
        case "retrieve":
        case "plan":
        case "act":
          state = drive(state, { type: "STEP_OK", output }, now());
          break;
        case "observe":
          state = drive(state, { type: "OBSERVED", observation: output.text }, now());
          break;
        case "reflect": {
          const verdict = evaluateReflect(output);
          const roundBefore = state.reviseRound;
          state = drive(state, { type: "VERDICT", ...verdict }, now());
          if (!verdict.pass && roundBefore < 2) {
            emit({
              type: "REVISE_ROUND",
              taskId,
              traceId,
              round: (roundBefore + 1) as 1 | 2,
              reason: `confidence=${output.confidence}`,
            });
          }
          break;
        }
        case "revise":
          state = drive(state, { type: "REVISED" }, now());
          break;
        case "consolidate":
          state = drive(state, { type: "STEP_OK", output }, now());
          break;
      }

      await persist(taskId, state);
      output_artifacts.artifacts = output.artifacts;
    }

    // 终局（done）：degraded 降级完成 vs 正常完成
    if (state.degraded) {
      const terminal: AgentTaskEvent = {
        type: "TASK_DEGRADED",
        taskId,
        traceId,
        output: {
          agentId: command.agentId,
          text: "",
          confidence: 0,
          tokensUsed: 0,
          model: "n/a",
          riskTags: ["degraded", "reflect-unresolved"],
          artifacts: output_artifacts.artifacts,
        },
        reviseRound: 2,
      };
      emit(terminal);
      resolveDone(terminal);
      return;
    }
    const totalMs = now() - startedAt;
    const terminal: AgentTaskEvent = {
      type: "TASK_COMPLETED",
      taskId,
      traceId,
      output: {
        agentId: command.agentId,
        text: "",
        confidence: 0,
        tokensUsed: 0,
        model: "n/a",
        riskTags: [],
        artifacts: output_artifacts.artifacts,
      },
      totalMs,
    };
    emit(terminal);
    resolveDone(terminal);
  }

  void execute().catch((error: unknown) => {
    // 防御性兜底：机器非法转移等契约异常按 failed 终局（不悬置 promise）
    const terminal: AgentTaskEvent = {
      type: "TASK_FAILED",
      taskId: command.taskId,
      traceId,
      error: asAgentError(error, { code: "contract-violated", retryable: false, traceId, agentId: command.agentId }),
    };
    emit(terminal);
    resolveDone(terminal);
  });

  return {
    promise,
    cancel() {
      cancelled = true;
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
