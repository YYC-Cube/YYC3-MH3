/**
 * file: src/__tests__/adapters.engine-pipeline.test.ts
 * description: YYC³ 测试 — 引擎流水线队列适配器契约（后端 /api/pipeline ↔ 前端 TaskQueuePort 映射）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-22
 * updated: 2026-10-22
 * status: active
 * tags: [test],[adapter],[engine],[integration]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 以 fetch / 命名事件 EventSource 替身验证：POST 请求体契约、enqueued→dequeued→completed/failed
 *        状态映射（dequeued 每任务至多一次）、log/file 钩子外送、单飞拒绝与非 2xx 拒绝。
 *
 * dependencies: vitest, ../adapters/engine/pipelineQueue, ../domains/platform/queue/ports
 * exports: —
 */
import { describe, expect, it, vi } from "vitest";
import {
  createEnginePipelineQueue,
  NamedEventSourceLike,
  PIPELINE_TASK_TYPE,
  PipelineRunPayload,
} from "../adapters/engine/pipelineQueue";
import { QueueEvent, QueueTask } from "../domains/platform/queue/ports";

/** 命名事件 EventSource 替身：按事件名登记，测试手动派发 */
function createFakeNamedSource(): NamedEventSourceLike & {
  dispatch(type: string, data: unknown): void;
  closed: boolean;
} {
  const listeners = new Map<string, (event: { data?: string }) => void>();
  return {
    closed: false,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    close() {
      this.closed = true;
    },
    dispatch(type, data) {
      listeners.get(type)?.({ data: JSON.stringify(data) });
    },
  };
}

function createFetch(status = 200): typeof fetch & { calls: { url: string; body: string }[] } {
  const calls: { url: string; body: string }[] = [];
  const fn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), body: String(init?.body ?? "") });
    return new Response(JSON.stringify({ started: status === 200 }), { status });
  }) as unknown as typeof fetch & { calls: { url: string; body: string }[] };
  fn.calls = calls;
  return fn;
}

const runTask = (id: string, batch = "1016"): QueueTask<PipelineRunPayload> => ({
  id,
  type: PIPELINE_TASK_TYPE,
  payload: { batch, dryRun: true },
});

const statusOf = (state: "idle" | "running" | "completed" | "failed", batch = "1016") => ({
  state,
  batch,
  startedAt: 1,
  endedAt: state === "running" ? null : 2,
  exitCode: state === "failed" ? 1 : state === "completed" ? 0 : null,
});

describe("adapters/engine · 流水线队列（后端 /api/pipeline 契约）", () => {
  it("enqueue：POST {batch,dryRun} 至 /pipeline/run，广播 enqueued，并订阅 /pipeline/stream", async () => {
    const fetchImpl = createFetch();
    const source = createFakeNamedSource();
    const urls: string[] = [];
    const queue = createEnginePipelineQueue({
      baseUrl: "http://127.0.0.1:3030/api",
      fetchImpl,
      eventSourceFactory: (url) => {
        urls.push(url);
        return source;
      },
    });
    const events: QueueEvent<PipelineRunPayload>[] = [];
    queue.onEvent((e) => events.push(e));

    await queue.enqueue(runTask("run-1"));

    expect(fetchImpl.calls[0]?.url).toBe("http://127.0.0.1:3030/api/pipeline/run");
    expect(JSON.parse(fetchImpl.calls[0]?.body ?? "{}")).toEqual({ batch: "1016", dryRun: true });
    expect(urls).toEqual(["http://127.0.0.1:3030/api/pipeline/stream"]);
    expect(events.map((e) => e.type)).toEqual(["enqueued"]);
  });

  it("state 映射：running→dequeued（仅一次）→completed→释放后可再入队", async () => {
    const source = createFakeNamedSource();
    const queue = createEnginePipelineQueue({
      baseUrl: "http://127.0.0.1:3030/api",
      fetchImpl: createFetch(),
      eventSourceFactory: () => source,
    });
    const types: string[] = [];
    queue.onEvent((e) => types.push(e.type));

    await queue.enqueue(runTask("run-1"));
    source.dispatch("state", statusOf("running"));
    source.dispatch("state", statusOf("running"));
    source.dispatch("heartbeat", {});
    source.dispatch("state", statusOf("completed"));
    expect(types).toEqual(["enqueued", "dequeued", "completed"]);

    await expect(queue.enqueue(runTask("run-2"))).resolves.toBeUndefined();
    expect(types.at(-1)).toBe("enqueued");
  });

  it("state=failed → failed；log/file 事件经钩子外送，不进入队列事件", async () => {
    const source = createFakeNamedSource();
    const onLog = vi.fn();
    const onFile = vi.fn();
    const onStatus = vi.fn();
    const queue = createEnginePipelineQueue({
      baseUrl: "http://127.0.0.1:3030/api",
      fetchImpl: createFetch(),
      eventSourceFactory: () => source,
      onLog,
      onFile,
      onStatus,
    });
    const types: string[] = [];
    queue.onEvent((e) => types.push(e.type));

    await queue.enqueue(runTask("run-x"));
    source.dispatch("log", { ts: 1, text: "[pipeline] dry-run start" });
    source.dispatch("file", { path: "output_batch1016/manifest.json", kind: "manifest", ts: 2 });
    source.dispatch("state", statusOf("failed"));

    expect(onLog).toHaveBeenCalledWith({ ts: 1, text: "[pipeline] dry-run start" });
    expect(onFile).toHaveBeenCalledWith({
      path: "output_batch1016/manifest.json",
      kind: "manifest",
      ts: 2,
    });
    expect(onStatus).toHaveBeenCalledTimes(1);
    expect(types).toEqual(["enqueued", "failed"]);
  });

  it("拒绝：错误任务类型 / 引擎非 2xx / 单飞冲突 —— 均抛错且不广播", async () => {
    const source = createFakeNamedSource();
    const rejecting = createEnginePipelineQueue({
      baseUrl: "http://127.0.0.1:3030/api",
      fetchImpl: createFetch(409),
      eventSourceFactory: () => source,
    });
    const events: QueueEvent[] = [];
    rejecting.onEvent((e) => events.push(e));
    await expect(
      rejecting.enqueue({ id: "bad", type: "render", payload: { batch: null } }),
    ).rejects.toThrow(PIPELINE_TASK_TYPE);
    await expect(rejecting.enqueue(runTask("r-409"))).rejects.toThrow("HTTP 409");
    expect(events).toEqual([]);

    const single = createEnginePipelineQueue({
      baseUrl: "http://127.0.0.1:3030/api",
      fetchImpl: createFetch(),
      eventSourceFactory: () => createFakeNamedSource(),
    });
    await single.enqueue(runTask("a"));
    await expect(single.enqueue(runTask("b"))).rejects.toThrow("单飞");
    expect(await single.dequeue()).toBeNull();
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
