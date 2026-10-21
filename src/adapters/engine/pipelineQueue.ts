/**
 * file: src/adapters/engine/pipelineQueue.ts
 * description: YYC³ 适配器层 — 引擎流水线任务队列（直连后端 console BFF /api/pipeline，F-1 双 BFF 融合首步）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-22
 * updated: 2026-10-22
 * status: active
 * tags: [adapter],[engine],[queue],[sse],[integration]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: TaskQueuePort 的「真实引擎」实现——把后端 YYC3-MiniMax-H3 console BFF 的契约
 *        （POST /pipeline/run + SSE 命名事件 state/log/file/heartbeat）映射为前端通用队列事件
 *        enqueued/dequeued/completed/failed。后端为单飞锁语义，本适配器同样一次只跟踪一个在跑任务。
 *        - enqueue：仅受理 `pipeline.run`；POST 成功即 enqueued，并建立 SSE 订阅
 *        - state=running → dequeued（每任务至多一次）；completed/failed → 对应终态并释放
 *        - log/file 事件经 onLog/onFile 钩子外送（遥测留痕由装配方决定），heartbeat 忽略
 *        - dequeue 恒返回 null：引擎自驱动，前端不出队
 *        零硬编码端点：baseUrl 由组合根从 NEXT_PUBLIC_ENGINE_BASE_URL 注入（回环 only）。
 *
 * dependencies: ../../domains/platform/queue/ports
 * exports: PIPELINE_TASK_TYPE, PipelineRunPayload, EngineRunStatus, EngineLogLine, EngineFileChange,
 *          NamedEventSourceLike, EnginePipelineQueueOptions, createEnginePipelineQueue
 */
import {
  QueueEvent,
  QueueEventType,
  QueueTask,
  TaskQueuePort,
} from "../../domains/platform/queue/ports";

/** 本适配器唯一受理的任务类型 */
export const PIPELINE_TASK_TYPE = "pipeline.run";

/** 任务载荷：对应后端 POST /pipeline/run 请求体 */
export interface PipelineRunPayload {
  batch: string | null;
  dryRun?: boolean;
}

/** 后端 RunStatus（apps/console/server/lib/pipeline-manager.ts）镜像 */
export interface EngineRunStatus {
  state: "idle" | "running" | "completed" | "failed";
  batch: string | null;
  startedAt: number | null;
  endedAt: number | null;
  exitCode: number | null;
}

/** 后端 LogLine 镜像 */
export interface EngineLogLine {
  ts: number;
  text: string;
}

/** 后端 FileChange 镜像（manifest.json / report_batch*.md / batches.json 变更） */
export interface EngineFileChange {
  path: string;
  kind: "manifest" | "report" | "batches";
  ts: number;
}

/** 支持命名事件的 EventSource 最小结构（原生实例天然满足；测试可注入替身） */
export interface NamedEventSourceLike {
  addEventListener(type: string, listener: (event: { data?: string }) => void): void;
  close(): void;
}

export interface EnginePipelineQueueOptions {
  /** 后端 BFF 根，如 `http://127.0.0.1:3030/api`（不带尾斜杠） */
  baseUrl: string;
  /** fetch 注入（测试替身 / SSR） */
  fetchImpl?: typeof fetch;
  /** EventSource 工厂（默认 `new EventSource(url)`；SSR 无 EventSource 时抛错 → 降级为不订阅） */
  eventSourceFactory?: (url: string) => NamedEventSourceLike;
  /** 后端令牌配置时 fail-closed，需 Bearer；本地回环未配置令牌可省略 */
  authToken?: string;
  onStatus?: (status: EngineRunStatus) => void;
  onLog?: (line: EngineLogLine) => void;
  onFile?: (change: EngineFileChange) => void;
}

type Listener = (event: QueueEvent<PipelineRunPayload>) => void;

function parseJson<T>(raw: string | undefined, consume: (value: T) => void): void {
  if (!raw) return;
  try {
    consume(JSON.parse(raw) as T);
  } catch {
    /* 非 JSON 帧（如心跳空体）静默忽略 */
  }
}

export function createEnginePipelineQueue(
  options: EnginePipelineQueueOptions,
): TaskQueuePort<PipelineRunPayload> {
  const listeners = new Set<Listener>();
  const fetchImpl = options.fetchImpl ?? fetch;
  let source: NamedEventSourceLike | null = null;
  let active: QueueTask<PipelineRunPayload> | null = null;
  let dequeuedEmitted = false;

  const emit = (type: QueueEventType, task: QueueTask<PipelineRunPayload>): void => {
    const event: QueueEvent<PipelineRunPayload> = { type, task, at: new Date().toISOString() };
    listeners.forEach((listener) => listener(event));
  };

  const handleState = (status: EngineRunStatus): void => {
    options.onStatus?.(status);
    if (!active) return;
    if (status.state === "running" && !dequeuedEmitted) {
      dequeuedEmitted = true;
      emit("dequeued", active);
      return;
    }
    if (status.state === "completed" || status.state === "failed") {
      const finished = active;
      active = null;
      dequeuedEmitted = false;
      emit(status.state, finished);
    }
  };

  const ensureStream = (): void => {
    if (source) return;
    const factory =
      options.eventSourceFactory ?? ((url: string) => new EventSource(url) as NamedEventSourceLike);
    try {
      source = factory(`${options.baseUrl}/pipeline/stream`);
    } catch {
      source = null;
      return;
    }
    source.addEventListener("state", (e) => parseJson<EngineRunStatus>(e.data, handleState));
    source.addEventListener("log", (e) =>
      parseJson<EngineLogLine>(e.data, (line) => options.onLog?.(line)),
    );
    source.addEventListener("file", (e) =>
      parseJson<EngineFileChange>(e.data, (change) => options.onFile?.(change)),
    );
  };

  return {
    async enqueue(task) {
      if (task.type !== PIPELINE_TASK_TYPE) {
        throw new Error(`engine 队列仅受理 ${PIPELINE_TASK_TYPE}，收到 ${task.type}`);
      }
      if (active) {
        throw new Error(`engine 单飞：任务 ${active.id} 仍在运行，拒绝 ${task.id}`);
      }
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (options.authToken) headers.authorization = `Bearer ${options.authToken}`;
      const response = await fetchImpl(`${options.baseUrl}/pipeline/run`, {
        method: "POST",
        headers,
        body: JSON.stringify({ batch: task.payload.batch, dryRun: task.payload.dryRun === true }),
      });
      if (!response.ok) {
        throw new Error(`engine 拒绝启动流水线：HTTP ${response.status}`);
      }
      active = task;
      dequeuedEmitted = false;
      emit("enqueued", task);
      ensureStream();
    },
    async dequeue() {
      return null;
    },
    onEvent(listener) {
      listeners.add(listener);
      ensureStream();
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
