/**
 * file: src/orchestrator/protocol.ts
 * description: 编排内核 · 命令/事件契约（UI→命令→队列→worker→事件→UI 的唯一载荷协议）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [orchestrator],[protocol],[react-c],[queue]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-3 双通道裁定（承接解耦设计 §三）——
 *   命令通道：AgentCommand 经 TaskQueuePort.enqueue 入队（QueueTask.payload = AgentCommand）
 *   事件通道：AgentTaskEvent 经本域 EventBusPort 回流（QueueEvent 事件类型锁定四值，
 *   不承载九步进度语义——进度走专用总线，终态同步走 QueueEvent completed/failed）
 *   全部事件携带 traceId（全链路串联）；UI 只发命令、只收事件。
 *
 * dependencies: ../domains/ai/ports, ../domains/ai/machine
 * exports: AgentCommand, TaskCheckpoint, AgentTaskEvent, EventBusPort, createEventBus
 */
import type { ReactCState } from "../domains/ai/machine";
import type { AgentContext, AgentError, AgentInput, AgentOutput } from "../domains/ai/ports";

/** UI → 编排：唯一入队载荷（taskId 为幂等键，重发去重） */
export interface AgentCommand {
  kind: "agent.invoke";
  /** 幂等键（调用方生成；进程内生命周期去重） */
  taskId: string;
  /** ∈ AGENT_REGISTRY 八员 id（runner 经 AgentPort.listAgents 校验） */
  agentId: string;
  input: AgentInput;
  sessionId: string;
  /** 任务级预算（相对入队时刻；超限合成 budget-exceeded 强制终局） */
  budget?: { deadlineMs?: number };
  /** 人工接管恢复时携带断点（首跑缺省；state 为机器快照） */
  resume?: { traceId: string; state: ReactCState };
}

/** 断点快照（state 为机器纯函数产出的不可变状态，可直接序列化） */
export interface TaskCheckpoint {
  taskId: string;
  traceId: string;
  agentId: string;
  state: ReactCState;
  at: number;
}

/** 编排 → UI：事件回流（全部携带 traceId；STEP_* 附逐步追踪） */
export type AgentTaskEvent =
  | { type: "TASK_ACCEPTED"; taskId: string; traceId: string; at: number }
  | {
      type: "STEP_ENTERED";
      taskId: string;
      traceId: string;
      stepKey: string;
      index: number;
      startedAt: number;
      reviseRound: number;
    }
  | {
      type: "STEP_EXITED";
      taskId: string;
      traceId: string;
      stepKey: string;
      durationMs: number;
      tokensUsed: number;
      model: string;
      riskTags: readonly string[];
    }
  | { type: "REVISE_ROUND"; taskId: string; traceId: string; round: 1 | 2; reason: string }
  | { type: "TASK_COMPLETED"; taskId: string; traceId: string; output: AgentOutput; totalMs: number }
  | { type: "TASK_DEGRADED"; taskId: string; traceId: string; output: AgentOutput; reviseRound: 2 }
  | { type: "TASK_FAILED"; taskId: string; traceId: string; error: AgentError }
  | { type: "HANDOFF_REQUIRED"; taskId: string; traceId: string; checkpoint: TaskCheckpoint };

/** 进度事件总线端口（进程内发布/订阅；跨进程桥接属适配器演进，不在内核） */
export interface EventBusPort<TEvent = AgentTaskEvent> {
  publish(event: TEvent): void;
  subscribe(listener: (event: TEvent) => void): () => void;
}

/** 内存事件总线（同步广播 + 退订；监听器异常互不影响且不上抛发布方） */
export function createEventBus<TEvent = AgentTaskEvent>(): EventBusPort<TEvent> & { listenerCount(): number } {
  const listeners = new Set<(event: TEvent) => void>();
  return {
    publish(event) {
      for (const listener of [...listeners]) {
        try {
          listener(event);
        } catch {
          // 单监听器故障不阻断广播（事件通道自身零异常外泄）
        }
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

/** 供 runner 构造 context 的最小工厂（traceId/sessionId 由命令派生） */
export function contextFrom(command: AgentCommand, traceId: string): AgentContext {
  return { traceId, sessionId: command.sessionId };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
