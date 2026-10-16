/**
 * file: src/__tests__/adapters.sse-queue.test.ts
 * description: local/SSE 队列适配器单元测试 — 注入 fetch/EventSource 替身驱动引擎通道
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[adapter],[sse],[queue]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P4-4 验收测试（零真实网络，fetch/EventSource 全替身注入）：
 *        enqueue POST 受理与拒绝 / SSE 事件回填与消费 / 本地-引擎回声去重 /
 *        completed·failed 透传 / 退订 / 降级模式（工厂抛错）/ 观测扩展。
 *
 * dependencies: vitest, ../adapters/local/queueSse, ../domains/platform/queue/ports
 * exports: —
 */
import { describe, expect, it, vi } from "vitest";
import { createSseTaskQueue, EventSourceLike } from "../adapters/local/queueSse";
import { QueueEvent, QueueTask } from "../domains/platform/queue/ports";

/** EventSource 替身：记录订阅，测试手动派发 message */
function createFakeEventSource(): EventSourceLike & {
  dispatch(data: string): void;
} {
  let messageListener: ((event: { data?: string }) => void) | null = null;
  return {
    addEventListener(type, listener) {
      if (type === "message") messageListener = listener;
    },
    close() {
      messageListener = null;
    },
    dispatch(data) {
      messageListener?.({ data });
    },
  };
}

/** fetch 替身：受理全部 POST（记录请求体） */
function createAcceptingFetch(): typeof fetch & { bodies: string[] } {
  const impl = (() => {
    const fn = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(String(init?.body ?? ""));
      return new Response(null, { status: 202 });
    }) as unknown as typeof fetch & { bodies: string[] };
    return fn;
  })();
  const bodies: string[] = [];
  impl.bodies = bodies;
  return impl;
}

const task = (id: string): QueueTask<{ n: number }> => ({
  id,
  type: "render",
  payload: { n: 1 },
});

describe("adapters/local · SSE 任务队列", () => {
  it("enqueue：POST 任务 JSON 至端点并广播 enqueued", async () => {
    const fetchImpl = createAcceptingFetch();
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl,
      eventSourceFactory: () => source,
    });
    const events: QueueEvent<{ n: number }>[] = [];
    queue.onEvent((e) => events.push(e));

    await queue.enqueue(task("t-1"));
    expect(fetchImpl.bodies).toHaveLength(1);
    expect(JSON.parse(fetchImpl.bodies[0] ?? "{}")).toMatchObject({ id: "t-1", type: "render" });
    expect(events.map((e) => e.type)).toEqual(["enqueued"]);
  });

  it("enqueue：引擎非 2xx 拒绝时抛错且不广播", async () => {
    const rejectingFetch = vi.fn(
      async () => new Response(null, { status: 503 }),
    ) as unknown as typeof fetch;
    const queue = createSseTaskQueue({ endpoint: "/api/task-queue", fetchImpl: rejectingFetch });
    const events: QueueEvent[] = [];
    queue.onEvent((e) => events.push(e));

    await expect(queue.enqueue(task("t-1"))).rejects.toThrow("拒绝");
    expect(events).toHaveLength(0);
  });

  it("SSE enqueued 回填缓冲 → dequeue FIFO 弹出 + dequeued 广播", async () => {
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl: createAcceptingFetch(),
      eventSourceFactory: () => source,
    });
    const events: QueueEvent<{ n: number }>[] = [];
    queue.onEvent((e) => events.push(e));

    source.dispatch(
      JSON.stringify({ type: "enqueued", task: task("e-1"), at: "2026-10-16T00:00:00Z" }),
    );
    source.dispatch(
      JSON.stringify({ type: "enqueued", task: task("e-2"), at: "2026-10-16T00:00:01Z" }),
    );
    expect(queue.size()).toBe(2);

    const first = await queue.dequeue();
    expect(first?.id).toBe("e-1");
    const second = await queue.dequeue();
    expect(second?.id).toBe("e-2");
    expect(await queue.dequeue()).toBeNull();
    expect(events.map((e) => e.type)).toEqual(["enqueued", "enqueued", "dequeued", "dequeued"]);
  });

  it("本地受理与引擎回声按任务 id 去重（不重复回填）", async () => {
    const fetchImpl = createAcceptingFetch();
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl,
      eventSourceFactory: () => source,
    });

    await queue.enqueue(task("dup-1"));
    source.dispatch(
      JSON.stringify({ type: "enqueued", task: task("dup-1"), at: "2026-10-16T00:00:00Z" }),
    );
    expect(queue.size()).toBe(1);
  });

  it("completed/failed 引擎事件直接透传监听器", async () => {
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl: createAcceptingFetch(),
      eventSourceFactory: () => source,
    });
    const events: QueueEvent<{ n: number }>[] = [];
    queue.onEvent((e) => events.push(e));

    source.dispatch(
      JSON.stringify({ type: "completed", task: task("t-9"), at: "2026-10-16T00:00:02Z" }),
    );
    source.dispatch(
      JSON.stringify({ type: "failed", task: task("t-10"), at: "2026-10-16T00:00:03Z" }),
    );
    expect(events.map((e) => e.type)).toEqual(["completed", "failed"]);
  });

  it("onEvent 退订后不再收到事件", async () => {
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl: createAcceptingFetch(),
      eventSourceFactory: () => source,
    });
    const events: QueueEvent<{ n: number }>[] = [];
    const unsubscribe = queue.onEvent((e) => events.push(e));
    unsubscribe();

    source.dispatch(
      JSON.stringify({ type: "enqueued", task: task("t-1"), at: "2026-10-16T00:00:00Z" }),
    );
    expect(events).toHaveLength(0);
    expect(queue.size()).toBe(1); // 缓冲回填不受退订影响
  });

  it("非法 SSE 载荷（坏 JSON / 形状缺失）静默丢弃", async () => {
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl: createAcceptingFetch(),
      eventSourceFactory: () => source,
    });

    source.dispatch("not-json");
    source.dispatch(JSON.stringify({ type: "nope", task: task("x") }));
    source.dispatch(JSON.stringify({ type: "enqueued", task: { id: "missing-type" } }));
    expect(queue.size()).toBe(0);
  });

  it("降级模式：eventSourceFactory 抛错时入队/出队仍可用", async () => {
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl: createAcceptingFetch(),
      eventSourceFactory: () => {
        throw new Error("SSR 无 EventSource");
      },
    });
    await queue.enqueue(task("t-1"));
    expect((await queue.dequeue())?.id).toBe("t-1");
  });

  it("size/drain 观测扩展：清空并返回被移除任务", async () => {
    const source = createFakeEventSource();
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint: "/api/task-queue",
      fetchImpl: createAcceptingFetch(),
      eventSourceFactory: () => source,
    });
    source.dispatch(
      JSON.stringify({ type: "enqueued", task: task("a"), at: "2026-10-16T00:00:00Z" }),
    );
    source.dispatch(
      JSON.stringify({ type: "enqueued", task: task("b"), at: "2026-10-16T00:00:01Z" }),
    );

    const flushed = queue.drain();
    expect(flushed.map((t) => t.id)).toEqual(["a", "b"]);
    expect(queue.size()).toBe(0);
  });
});
