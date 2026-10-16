/**
 * file: src/domains/platform/queue/ports.ts
 * description: YYC³ 基础设施域 — 任务队列端口（出站端口，实现方为适配器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[port],[platform],[queue]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 任务队列端口 — 入队/出队/事件订阅（领域事件异步解耦通道，见 06 跨域规范）
 *
 * dependencies: —
 * exports: QueueEventType, QueueTask, QueueEvent, TaskQueuePort
 */

/** 队列事件类型 */
export type QueueEventType = "enqueued" | "dequeued" | "completed" | "failed";

/** 队列任务项（泛型载荷，默认 unknown 防类型后门） */
export interface QueueTask<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
}

/** 队列事件（状态流转留痕） */
export interface QueueEvent<TPayload = unknown> {
  type: QueueEventType;
  task: QueueTask<TPayload>;
  at: string;
}

/**
 * 任务队列端口（FIFO 入出队 + 事件订阅）。
 *
 * 实现方：
 * - `adapters/memory`（内存队列，断网默认）
 * - `adapters/local`（后续接真实引擎 SSE / 本地作业服务）
 *
 * `onEvent` 返回退订函数（取消订阅）；跨域协作经本端口的事件通道解耦。
 */
export interface TaskQueuePort<TPayload = unknown> {
  enqueue(task: QueueTask<TPayload>): Promise<void>;
  dequeue(): Promise<QueueTask<TPayload> | null>;
  onEvent(listener: (event: QueueEvent<TPayload>) => void): () => void;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
