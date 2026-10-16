/**
 * file: src/orchestrator/worker.ts
 * description: 编排内核 · 任务泵（dequeue → run 主循环；调度注入三形态同构）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [orchestrator],[worker],[queue],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-3 执行泵——worker 主循环：dequeue 命令 → 交 run（runner 驱动状态机）
 *   → 终态后即刻续取；空队列按 pollMs 空转。调度函数注入：
 *   默认 setTimeout 宏任务（页面内形态，RSC/SSR 安全）；同一注入点可替换为
 *   WebWorker postMessage / Node setImmediate（三形态同构，编排逻辑零改动）。
 *   非 Agent 载荷跳过并告警（onLog）；run 异常不终止泵（下轮继续）。
 *
 * dependencies: ../domains/platform/queue/ports, ./command-bus, ./protocol
 * exports: AgentWorkerDeps, AgentWorker, createAgentWorker
 */
import type { QueueTask, TaskQueuePort } from "../domains/platform/queue/ports";
import { AGENT_TASK_TYPE } from "./command-bus";
import type { AgentCommand, AgentTaskEvent } from "./protocol";

export interface AgentWorkerDeps {
  queue: TaskQueuePort<AgentCommand>;
  /** 单命令执行（通常为 runTask 包装：返回终态事件） */
  run(command: AgentCommand): Promise<AgentTaskEvent>;
  /** 空转轮询间隔 ms（默认 250；注入 schedule 后由假时钟驱动） */
  pollMs?: number;
  /** 调度注入（缺省 setTimeout 宏任务；签名 (fn, ms) → void） */
  schedule?: (fn: () => void, ms: number) => void;
  onLog?: (entry: { level: "warn"; message: string }) => void;
}

export interface AgentWorker {
  start(): void;
  stop(): void;
  /** 手动驱动一轮（测试/无调度环境下直接推进） */
  tick(): Promise<void>;
  /** 泵是否仍在运行 */
  running(): boolean;
}

export function createAgentWorker(deps: AgentWorkerDeps): AgentWorker {
  let alive = false;
  const schedule = deps.schedule ?? ((fn: () => void, ms: number) => void setTimeout(fn, ms));
  const pollMs = deps.pollMs ?? 250;

  async function tick(): Promise<void> {
    if (!alive) return;
    let task: QueueTask<AgentCommand> | null = null;
    try {
      task = await deps.queue.dequeue();
    } catch (error) {
      deps.onLog?.({ level: "warn", message: `dequeue-failed:${String(error)}` });
    }
    if (!task) {
      schedule(() => void tick(), pollMs); // 空转等待
      return;
    }
    if (task.type !== AGENT_TASK_TYPE) {
      deps.onLog?.({ level: "warn", message: `skip-non-agent-task:${task.type}` });
      schedule(() => void tick(), 0);
      return;
    }
    try {
      await deps.run(task.payload);
    } catch (error) {
      deps.onLog?.({ level: "warn", message: `run-failed:${String(error)}` }); // 泵不因单任务异常终止
    }
    schedule(() => void tick(), 0);
  }

  return {
    start() {
      if (alive) return;
      alive = true;
      schedule(() => void tick(), 0);
    },
    stop() {
      alive = false;
    },
    tick,
    running() {
      return alive;
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
