/**
 * file: src/orchestrator/resilience.ts
 * description: 编排内核 · 韧性件（checkpoint 断点端口 / 回滚 / 人工接管状态）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [orchestrator],[resilience],[checkpoint],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-3 韧性三件事——
 *   ① checkpoint：TaskCheckpointStore 端口（save/load，实现方为适配器——
 *      内存默认；浏览器持久化桥属 PR-4/5，内核零存储原语）
 *   ② rollback：纯函数，丢弃断点与产物集合（零部分状态外泄），返回可审计摘要
 *   ③ handoff：fromCheckpoint 从断点恢复（SUBMIT 之外任意步续跑，同 traceId）
 *
 * dependencies: ../domains/ai/machine, ../domains/ai/ports, ./protocol
 * exports: TaskCheckpoint, TaskCheckpointStore, MemoryCheckpointStore, rollback, isResumableState
 */
import type { ReactCState } from "../domains/ai/machine";
import type { AgentCommand, AgentTaskEvent, TaskCheckpoint } from "./protocol";

/** 断点存储契约（定义于 protocol，此处再导出保持单一事实来源） */
export type { TaskCheckpoint };

/**
 * 断点存储端口（实现方：adapters/memory 默认；浏览器持久化桥 PR-4/5）。
 * save 失败不阻断任务流（runner 静默降级 + onLog 回调留痕）。
 */
export interface TaskCheckpointStore {
  save(checkpoint: TaskCheckpoint): Promise<void>;
  load(taskId: string): Promise<TaskCheckpoint | null>;
}

/** 内存断点存储（断网默认；进程生命周期 = 数据生命周期） */
export function createMemoryCheckpointStore(): TaskCheckpointStore {
  const map = new Map<string, TaskCheckpoint>();
  return {
    async save(checkpoint) {
      map.set(checkpoint.taskId, checkpoint);
    },
    async load(taskId) {
      return map.get(taskId) ?? null;
    },
  };
}

/** 回滚摘要（审计面：废弃时的步位与轮次） */
export interface RollbackSummary {
  taskId: string;
  traceId: string;
  discardedStep: ReactCState["step"];
  reviseRound: number;
  at: number;
}

/** 回滚（纯函数）：丢弃断点与状态——零部分状态外泄，返回审计摘要 */
export function rollback(checkpoint: TaskCheckpoint, now: number): RollbackSummary {
  return {
    taskId: checkpoint.taskId,
    traceId: checkpoint.traceId,
    discardedStep: checkpoint.state.step,
    reviseRound: checkpoint.state.reviseRound,
    at: now,
  };
}

/** 可恢复步位判定：SUBMIT 之外的任意机器状态均可续跑（终态/失败态除外由 runner 裁定） */
export function isResumableState(state: ReactCState): boolean {
  return state.step !== "idle";
}

/** 事件类型守卫（恢复通道校验用） */
export function isAgentTaskEvent(value: unknown): value is AgentTaskEvent {
  return typeof value === "object" && value !== null && "type" in value;
}

/** 断点派生恢复命令（同 taskId 同 traceId，携带机器快照） */
export function resumeCommand(checkpoint: TaskCheckpoint, input: AgentCommand["input"]): AgentCommand {
  return {
    kind: "agent.invoke",
    taskId: checkpoint.taskId,
    agentId: checkpoint.agentId,
    input,
    sessionId: `resume:${checkpoint.traceId}`,
    resume: { traceId: checkpoint.traceId, state: checkpoint.state },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
