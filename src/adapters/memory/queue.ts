/**
 * file: src/adapters/memory/queue.ts
 * description: YYC³ 适配器层 — 任务队列 memory 实现（FIFO 内存队列 + 事件回调）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[memory],[queue],[platform]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 任务队列内存适配器 — 实现 TaskQueuePort 端口（enqueue/dequeue/onEvent）
 *        并附 size/drain 观测扩展；FIFO 入出队，事件回调（enqueued/dequeued）
 *        同步广播，onEvent 返回退订函数。completed/failed 事件类型保留给后续
 *        接真实引擎的 local 适配器（06 跨域规范：领域事件异步解耦通道）。
 *
 * dependencies: ../../domains/platform/queue/ports
 * exports: createInMemoryQueue
 */
import { QueueEvent, QueueEventType, QueueTask, TaskQueuePort } from "../../domains/platform/queue/ports";

/** 事件监听器集合类型 */
type QueueListener<TPayload> = (event: QueueEvent<TPayload>) => void;

/**
 * 内存任务队列（断网默认异步解耦通道）：
 *
 * - enqueue：任务尾插 + enqueued 事件广播
 * - dequeue：队首弹出（空队返回 null）+ dequeued 事件广播
 * - onEvent：订阅状态流转事件，返回退订函数（取消订阅）
 * - size / drain（端口外观测扩展）：当前积压量 / 清空并返回被移除任务
 */
export function createInMemoryQueue<TPayload = unknown>(): TaskQueuePort<TPayload> & {
  size(): number;
  drain(): QueueTask<TPayload>[];
} {
  const tasks: QueueTask<TPayload>[] = [];
  const listeners = new Set<QueueListener<TPayload>>();

  /** 同步广播（监听器异常不阻断广播循环，隔离排队主流程） */
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

  return {
    async enqueue(task) {
      tasks.push(task);
      emit("enqueued", task);
    },
    async dequeue() {
      const task = tasks.shift() ?? null;
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
      return tasks.length;
    },
    drain() {
      const flushed = [...tasks];
      tasks.length = 0;
      return flushed;
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
