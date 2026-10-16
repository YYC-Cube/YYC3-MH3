/**
 * file: src/orchestrator/command-bus.ts
 * description: 编排内核 · 命令总线（submit 入队 + taskId 幂等去重 + traceId 发放契约）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [orchestrator],[command-bus],[queue]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-3 命令通道——UI 唯一入口：submit 校验形状并入队
 *   （QueueTask{ id: taskId, type: "agent.task", payload: AgentCommand }）；
 *   taskId 去重（进程生命周期内重发拒绝，幂等键语义）；队列实现经注入
 *   TaskQueuePort（memory/IDB/SSE 可替换）。去重集内存态属诚实边界：
 *   跨进程幂等需队列侧唯一键（PR-4 队列适配器演进）。
 *
 * dependencies: ../domains/platform/queue/ports, ./protocol
 * exports: CommandBus, createCommandBus, AGENT_TASK_TYPE
 */
import type { TaskQueuePort } from "../domains/platform/queue/ports";
import type { AgentCommand } from "./protocol";

/** 队列任务类型标识（worker 据此过滤非 Agent 载荷） */
export const AGENT_TASK_TYPE = "agent.task";

export interface SubmitResult {
  accepted: boolean;
  /** accepted=false 时给出原因（duplicate = 幂等键已见） */
  reason?: "duplicate";
}

export interface CommandBus {
  submit(command: AgentCommand): Promise<SubmitResult>;
  /** 已受理 taskId 集合大小（观测/测试用） */
  seenCount(): number;
}

export function createCommandBus(queue: TaskQueuePort<AgentCommand>): CommandBus {
  const seen = new Set<string>();
  return {
    async submit(command: AgentCommand): Promise<SubmitResult> {
      if (seen.has(command.taskId)) return { accepted: false, reason: "duplicate" };
      seen.add(command.taskId);
      await queue.enqueue({ id: command.taskId, type: AGENT_TASK_TYPE, payload: command });
      return { accepted: true };
    },
    seenCount() {
      return seen.size;
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
