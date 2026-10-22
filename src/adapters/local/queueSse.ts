/**
 * file: src/adapters/local/queueSse.ts
 * description: YYC³ 适配器层 — 任务队列 local/SSE 实现（真实引擎通道，Track A 可插拔）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[local],[sse],[queue],[platform]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 任务队列 SSE 适配器 — 实现 TaskQueuePort 端口，对接本地作业引擎：
 *        - enqueue：POST 任务至引擎端点（2xx 视为受理）+ 本地 enqueued 事件广播
 *        - SSE 事件流（{endpoint}/events）：引擎广播 QueueEvent JSON，
 *          enqueued 事件回填本地待处理缓冲（与本地受理回声按任务 id 去重），
 *          completed/failed/dequeued 事件直接透传监听器
 *        - dequeue：本地缓冲 FIFO 弹出（空队返回 null）+ dequeued 广播
 *        - size / drain（端口外观测扩展）：与 memory 适配器同语义
 *
 *        连接与注入约定：
 *        - 端点由组合根注入（本文件零 URL 字面量，离线门禁友好）
 *        - fetchImpl / eventSourceFactory 可注入（测试用替身，无真实网络）
 *        - EventSource 原生自动重连；工厂抛错（如 SSR 无 EventSource）时
 *          进入降级模式：入队/出队仍可用，仅失去引擎事件流
 *
 * dependencies: ../../domains/platform/queue/ports
 * exports: EventSourceLike, SseQueueOptions, createSseTaskQueue
 */
import { QueueEvent, QueueEventType, QueueTask, TaskQueuePort } from "../../domains/platform/queue/ports";

/** EventSource 最小结构（测试替身可注入；原生实例天然满足） */
export interface EventSourceLike {
  addEventListener(type: string, listener: (event: { data?: string }) => void): void;
  close(): void;
}

/** SSE 适配器装配项（端点必填，网络原语可注入；网络原语与载荷类型无关故不泛型化） */
export interface SseQueueOptions {
  /** 引擎端点根路径（POST 目标；事件流为 `${endpoint}/events`） */
  endpoint: string;
  /** fetch 实现（默认全局 fetch；测试注入替身） */
  fetchImpl?: typeof fetch;
  /** EventSource 工厂（默认 `new EventSource(url)`；测试注入替身） */
  eventSourceFactory?: (url: string) => EventSourceLike;
}

/** 事件监听器集合类型 */
type QueueListener<TPayload> = (event: QueueEvent<TPayload>) => void;

/** 去重集合容量上限（防长会话内存泄漏；超限整表清空，误收重复事件仅影响一次回填） */
const SEEN_CAP = 1000;

/** SSE message.data 最小形状守卫（非 QueueEvent 结构一律丢弃；载荷泛型由调用侧收窄） */
function isQueueEventShape(raw: unknown): raw is QueueEvent<unknown> {
  if (typeof raw !== "object" || raw === null) return false;
  const candidate = raw as Partial<QueueEvent<unknown>>;
  const typeOk =
    candidate.type === "enqueued" ||
    candidate.type === "dequeued" ||
    candidate.type === "completed" ||
    candidate.type === "failed";
  const taskOk =
    typeof candidate.task === "object" &&
    candidate.task !== null &&
    typeof (candidate.task as QueueTask<unknown>).id === "string" &&
    typeof (candidate.task as QueueTask<unknown>).type === "string";
  return typeOk && taskOk;
}

/**
 * 本地作业引擎 SSE 任务队列（Track A 可插拔；Track B 静态导出默认仍走 memory）。
 *
 * 组合根装配示例（Track A 接线时启用）：
 * `queue: createSseTaskQueue({ endpoint: "/api/task-queue" })`
 */
export function createSseTaskQueue<TPayload = unknown>(
  options: SseQueueOptions,
): TaskQueuePort<TPayload> & {
  size(): number;
  drain(): QueueTask<TPayload>[];
} {
  const { endpoint, fetchImpl = fetch, eventSourceFactory } = options;
  const pending: QueueTask<TPayload>[] = [];
  const listeners = new Set<QueueListener<TPayload>>();
  const seenEnqueued = new Set<string>();

  /** 同步广播（监听器异常隔离，与 memory 适配器同语义） */
  const emit = (type: QueueEventType, task: QueueTask<TPayload>): void => {
    const event: QueueEvent<TPayload> = { type, task, at: new Date().toISOString() };
    for (const listener of listeners) {
      try {
        listener(event);
      } catch {
        /* 单个监听器失败不阻断其余监听器与队列主流程 */
      }
    }
  };

  /** enqueued 去重回填：本地受理与引擎回声只回填一次 */
  const admitEnqueued = (task: QueueTask<TPayload>): void => {
    if (seenEnqueued.has(task.id)) return;
    if (seenEnqueued.size >= SEEN_CAP) seenEnqueued.clear();
    seenEnqueued.add(task.id);
    pending.push(task);
    emit("enqueued", task);
  };

  /** 引擎事件流消费（JSON 解析失败 / 非法形状静默丢弃） */
  const consumeWire = (data: string | undefined): void => {
    if (!data) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    if (!isQueueEventShape(parsed)) return;
    const event = parsed as QueueEvent<TPayload>; // 形状守卫后收窄载荷泛型
    if (event.type === "enqueued") {
      admitEnqueued(event.task);
      return;
    }
    // dequeued/completed/failed：引擎侧状态流转，直接透传监听器
    emit(event.type, event.task);
  };

  // 事件流订阅（工厂缺失或抛错 → 降级模式：通道可用，仅失去引擎事件流）
  if (eventSourceFactory) {
    try {
      const source = eventSourceFactory(`${endpoint}/events`);
      source.addEventListener("message", (event) => consumeWire(event.data));
    } catch {
      /* 降级模式：保持入队/出队可用 */
    }
  }

  return {
    async enqueue(task) {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!response.ok) {
        throw new Error(`任务入队被引擎拒绝（HTTP ${response.status}）`);
      }
      admitEnqueued(task);
    },
    async dequeue() {
      const task = pending.shift() ?? null;
      if (task) emit("dequeued", task);
      return task;
    },
    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    size() {
      return pending.length;
    },
    drain() {
      const flushed = [...pending];
      pending.length = 0;
      return flushed;
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
