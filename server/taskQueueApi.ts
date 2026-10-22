/**
 * file: server/taskQueueApi.ts
 * description: YYC³ 服务端 — 任务队列引擎（纯函数核心）+ Web 标准薄壳（SSE 事件流，Track A）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [server],[bff],[task-queue],[sse]
 * category: server
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 任务队列真实引擎服务端（P4-4 Track A 插位）——与客户端适配器
 *        `src/adapters/local/queueSse.ts` 的线协议逐字对齐：
 *   - POST /api/task-queue          受理任务入队（形状校验，202/400）→ 广播 enqueued
 *   - GET  /api/task-queue          队列快照（size + 任务列表，可观测）
 *   - GET  /api/task-queue/events   SSE 事件流（event: message + data: QueueEvent JSON，
 *                                   retry 提示 + 15s 心跳注释行防代理空闲断连）
 *   - POST /api/task-queue/dispatch 状态流转驱动（worker 消费/完成/失败回报，
 *                                   队内任务移除 + 广播，队外任务仅广播透传）
 *
 *   装配约定（与 routeHandler.ts 同型，Track A 启用时）：
 *       // app/api/task-queue/route.ts
 *       import { handleTaskQueueRequest } from "@/server/taskQueueApi";
 *       export { handleTaskQueueRequest as GET, handleTaskQueueRequest as POST };
 *   Track B 静态导出与 API Route 互斥（05 清单 §3.2），故本文件独立于 app/。
 *
 *   线协议类型在本文件内自定义（结构与 src/domains/platform/queue/ports 的
 *   QueueEvent/QueueTask 兼容，server 侧不反向依赖 src，分层红线同 registryApi）。
 *
 * dependencies: node 无（Web 标准 API：Request/Response/ReadableStream/TextEncoder）
 * exports: QueueWireTask, QueueWireEvent, TaskQueueEngine, createTaskQueueEngine, handleTaskQueueRequest
 */

/** 线上任务（与客户端 QueueTask<TPayload> 结构兼容，payload 保持开放） */
export interface QueueWireTask {
  id: string;
  type: string;
  payload?: unknown;
}

/** 队列事件类型（与客户端 QueueEventType 字面量对齐） */
export type QueueWireEventType = "enqueued" | "dequeued" | "completed" | "failed";

/** 线上事件（与客户端 QueueEvent 结构兼容；at 为 ISO 时间戳） */
export interface QueueWireEvent {
  type: QueueWireEventType;
  task: QueueWireTask;
  at: string;
}

/** SSE 事件监听器 */
type QueueEventListener = (event: QueueWireEvent) => void;

/** 任务形状守卫：id/type 必须为非空字符串（payload 开放） */
function isWireTask(value: unknown): value is QueueWireTask {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && candidate.id.length > 0 && typeof candidate.type === "string";
}

/** dispatch 请求体守卫：type 三态 + taskId 非空字符串 */
interface DispatchBody {
  type: Exclude<QueueWireEventType, "enqueued">;
  taskId: string;
}

function isDispatchBody(value: unknown): value is DispatchBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.type === "dequeued" || candidate.type === "completed" || candidate.type === "failed") &&
    typeof candidate.taskId === "string" &&
    candidate.taskId.length > 0
  );
}

/** SSE 响应头（no-transform 防中间压缩缓冲破坏事件边界） */
const SSE_HEADERS: HeadersInit = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
};

/** 心跳间隔（毫秒）：注释行保活，防反向代理空闲超时断流 */
const HEARTBEAT_MS = 15_000;

/**
 * 任务队列引擎（纯函数核心，框架无关）：
 *
 * - enqueue：任务尾插 + enqueued 广播
 * - dispatch：按 taskId 移除队内匹配（无则视为队外任务）+ 事件广播
 * - snapshot：只读快照（size + 任务副本列表）
 * - subscribe：订阅事件流，返回退订函数（监听器异常不阻断广播循环）
 */
export interface TaskQueueEngine {
  enqueue(task: QueueWireTask): void;
  dispatch(body: DispatchBody): void;
  snapshot(): { size: number; tasks: QueueWireTask[] };
  subscribe(listener: QueueEventListener): () => void;
}

export function createTaskQueueEngine(): TaskQueueEngine {
  const tasks: QueueWireTask[] = [];
  const listeners = new Set<QueueEventListener>();

  const emit = (type: QueueWireEventType, task: QueueWireTask): void => {
    const event: QueueWireEvent = { type, task, at: new Date().toISOString() };
    for (const listener of listeners) {
      try {
        listener(event);
      } catch {
        /* 单个监听器失败不阻断其余监听器与广播主流程 */
      }
    }
  };

  return {
    enqueue(task) {
      tasks.push({ ...task });
      emit("enqueued", task);
    },
    dispatch(body) {
      const index = tasks.findIndex((t) => t.id === body.taskId);
      const task =
        index >= 0
          ? (tasks.splice(index, 1)[0] as QueueWireTask)
          : { id: body.taskId, type: "external", payload: null };
      emit(body.type, task);
    },
    snapshot() {
      return { size: tasks.length, tasks: tasks.map((t) => ({ ...t })) };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** SSE 事件流响应：retry 提示 + 订阅广播 + 心跳；cancel（客户端断开）时全量回收 */
function createEventStreamResponse(engine: TaskQueueEngine): Response {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string): void => {
        controller.enqueue(encoder.encode(chunk));
      };
      send("retry: 3000\n\n");
      unsubscribe = engine.subscribe((event) => {
        send(`event: message\ndata: ${JSON.stringify(event)}\n\n`);
      });
      heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat !== null) clearInterval(heartbeat);
    },
  });
  return new Response(stream, { headers: SSE_HEADERS });
}

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

/**
 * Web 标准请求薄壳（与 routeHandler.handleWebRequest 同型）：
 * 按方法 + 路径分发至引擎；引擎模块级单例（进程内一份队列与广播组）。
 */
export async function handleTaskQueueRequest(req: Request): Promise<Response> {
  const engine = getEngineSingleton();
  const pathname = new URL(req.url).pathname;

  if (req.method === "GET" && (pathname === "/api/task-queue/events" || pathname.endsWith("/task-queue/events"))) {
    return createEventStreamResponse(engine);
  }
  if (req.method === "GET" && (pathname === "/api/task-queue" || pathname.endsWith("/task-queue"))) {
    return json({ ok: true, ...engine.snapshot() }, 200);
  }
  if (req.method === "POST" && (pathname === "/api/task-queue" || pathname.endsWith("/task-queue"))) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "请求体必须为合法 JSON" }, 400);
    }
    if (!isWireTask(body)) {
      return json({ ok: false, error: "任务形状校验失败：id（非空字符串）与 type（字符串）必填" }, 400);
    }
    engine.enqueue(body);
    return json({ ok: true, size: engine.snapshot().size }, 202);
  }
  if (req.method === "POST" && (pathname === "/api/task-queue/dispatch" || pathname.endsWith("/task-queue/dispatch"))) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "请求体必须为合法 JSON" }, 400);
    }
    if (!isDispatchBody(body)) {
      return json(
        {
          ok: false,
          error: "dispatch 形状校验失败：type（dequeued/completed/failed）与 taskId 必填",
        },
        400,
      );
    }
    engine.dispatch(body);
    return json({ ok: true, size: engine.snapshot().size }, 202);
  }
  return json({ ok: false, error: `未知端点：${req.method} ${pathname}` }, 404);
}

/** 引擎模块级单例（与 routeHandler 的 api 单例语义一致；测试经 createTaskQueueEngine 隔离） */
let engineSingleton: TaskQueueEngine | null = null;
function getEngineSingleton(): TaskQueueEngine {
  if (engineSingleton === null) {
    engineSingleton = createTaskQueueEngine();
  }
  return engineSingleton;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
