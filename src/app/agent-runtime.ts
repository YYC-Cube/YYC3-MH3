/**
 * file: src/app/agent-runtime.ts
 * description: YYC³ 应用层 — Agent 运行时客户端单例（命令/事件双通道装配 + worker 常驻 + 取消表）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[agent-runtime],[orchestrator],[react-c],[singleton]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-5 UI 改接（承接解耦设计 §四 PR-5）——UI 唯一运行时入口：
 *   - 适配器矩阵按 NEXT_PUBLIC_AI_ADAPTER 切换（memory|local|vllm|registry，
 *     缺省 memory 断网默认；vllm 构造期守卫要求 NEXT_PUBLIC_VLLM_BASE_URL）
 *   - 装配五件套：memory 队列（命令通道）+ EventBus（进度事件通道）+
 *     checkpoint store（断点）+ 常驻 worker（dequeue→run 泵）+ 取消表
 *   - UI 只发命令（submit，taskId 幂等）、只收事件（subscribe）；
 *     运行中任务按 taskId 定位 handle 供协作式取消（当前步完成后生效）
 *   - 浏览器上下文才 start worker（SSR/RSC 零泵）；getAgentRuntime() 模块级单例
 *
 * dependencies: ../adapters/ai-local/agent, ../adapters/ai-registry/agent, ../adapters/ai-vllm/agent, ../adapters/memory/agent, ../adapters/memory/queue, ../domains/ai/ports, ../orchestrator/command-bus, ../orchestrator/protocol, ../orchestrator/runner, ../orchestrator/resilience, ../orchestrator/worker
 * exports: AiAdapterId, AgentRuntime, AgentRuntimeOptions, createAgentRuntime, getAgentRuntime, resetAgentRuntime
 */
import { createLocalAgent } from "../adapters/ai-local/agent";
import { createRegistryAgent } from "../adapters/ai-registry/agent";
import { createVllmAgent } from "../adapters/ai-vllm/agent";
import { createMemoryAgent } from "../adapters/memory/agent";
import { createInMemoryQueue } from "../adapters/memory/queue";
import type { AgentPort } from "../domains/ai/ports";
import { createCommandBus } from "../orchestrator/command-bus";
import {
  type AgentCommand,
  type AgentTaskEvent,
  createEventBus,
} from "../orchestrator/protocol";
import { runTask } from "../orchestrator/runner";
import { createMemoryCheckpointStore } from "../orchestrator/resilience";
import { createAgentWorker } from "../orchestrator/worker";

/** 适配器矩阵标识（env NEXT_PUBLIC_AI_ADAPTER 取值域） */
export type AiAdapterId = "memory" | "local" | "vllm" | "registry";

/** env 解析：非法/缺省一律回落 memory（断网默认，永不因配置白屏） */
function readAdapterId(): AiAdapterId {
  const raw = process.env.NEXT_PUBLIC_AI_ADAPTER;
  return raw === "local" || raw === "vllm" || raw === "registry" ? raw : "memory";
}

/** 适配器矩阵（app 层为合法装配点；orchestrator/domains 不触网络原语） */
function createAdapter(id: AiAdapterId): AgentPort {
  switch (id) {
    case "memory":
      return createMemoryAgent();
    case "local":
      return createLocalAgent();
    case "vllm":
      return createVllmAgent(); // 构造期守卫：缺 NEXT_PUBLIC_VLLM_BASE_URL 即抛错（fail-fast）
    case "registry":
      return createRegistryAgent();
  }
}

export interface AgentRuntimeOptions {
  /** 显式适配器（测试注入口；注入后 adapterId 仅作标识） */
  adapter?: AgentPort;
  /** 显式适配器标识（缺省读 NEXT_PUBLIC_AI_ADAPTER，再缺省 memory） */
  adapterId?: AiAdapterId;
  /** 是否自动启动 worker 泵（缺省：浏览器上下文才启动，SSR/RSC 零泵） */
  autoStart?: boolean;
  /** 浏览器判定注入（测试确定性；缺省 typeof window 检测） */
  isBrowser?: () => boolean;
}

export interface AgentRuntime {
  /** 当前适配器标识（观测） */
  adapterId(): AiAdapterId;
  /** 当前适配器（目录/单步透出，观测与测试用；UI 主通道是 submit/subscribe） */
  agent(): AgentPort;
  /** UI 唯一命令入口：入队（taskId 幂等，duplicate 拒绝） */
  submit(command: AgentCommand): Promise<{ accepted: boolean; reason?: "duplicate" }>;
  /** 进度事件订阅（返回退订函数） */
  subscribe(listener: (event: AgentTaskEvent) => void): () => void;
  /** 协作式取消：按 taskId 定位运行中 handle（当前步完成后生效；不在运行则 false） */
  cancel(taskId: string): boolean;
  /** worker 泵状态（观测） */
  workerRunning(): boolean;
  /** 停泵（单例消费方一般不调用；测试/热重载清理用） */
  stop(): void;
}

/** 组装运行时（每次新实例；单例语义见 getAgentRuntime） */
export function createAgentRuntime(options: AgentRuntimeOptions = {}): AgentRuntime {
  const adapterId: AiAdapterId = options.adapterId ?? readAdapterId();
  const agent = options.adapter ?? createAdapter(adapterId);
  const queue = createInMemoryQueue<AgentCommand>();
  const bus = createEventBus<AgentTaskEvent>();
  const store = createMemoryCheckpointStore();
  const busCommand = createCommandBus(queue);

  // 取消表：taskId → 运行中 handle（worker.run 同步登记，终态后摘除）
  const handles = new Map<string, { cancel(): void; promise: Promise<AgentTaskEvent> }>();

  const worker = createAgentWorker({
    queue,
    run: (command) => {
      const handle = runTask(command, { agent, bus, store });
      handles.set(command.taskId, handle);
      return handle.promise.finally(() => handles.delete(command.taskId));
    },
  });

  const shouldAutoStart = options.autoStart ?? (options.isBrowser?.() ?? typeof window !== "undefined");
  if (shouldAutoStart) worker.start();

  return {
    adapterId: () => adapterId,
    agent: () => agent,
    submit: (command) => busCommand.submit(command),
    subscribe: (listener) => bus.subscribe(listener),
    cancel: (taskId) => {
      const handle = handles.get(taskId);
      if (!handle) return false;
      handle.cancel();
      return true;
    },
    workerRunning: () => worker.running(),
    stop: () => worker.stop(),
  };
}

/** 模块级单例（浏览器与 SSR 各自一份 JS 上下文；测试经 reset 清理） */
let runtimeSingleton: AgentRuntime | null = null;

/** 运行时单例入口（UI/Provider 层统一经此取运行时） */
export function getAgentRuntime(): AgentRuntime {
  if (runtimeSingleton === null) {
    runtimeSingleton = createAgentRuntime();
  }
  return runtimeSingleton;
}

/** 单例重置（测试隔离/热重载；停泵后重建） */
export function resetAgentRuntime(): void {
  runtimeSingleton?.stop();
  runtimeSingleton = null;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
