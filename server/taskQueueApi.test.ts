/**
 * file: server/taskQueueApi.test.ts
 * description: 任务队列引擎服务端测试 — 纯函数核心 + Web 标准薄壳（SSE 流消费）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[server],[task-queue],[sse]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P4-4 服务端验收测试（Node Web 全局 Request/Response/ReadableStream，
 *        零真实网络）：引擎核心 enqueue/dispatch/snapshot/退订；薄壳四端点
 *        （POST 受理与形状拒绝 / GET 快照 / SSE 事件流实时消费 / dispatch
 *        透传与队外回报）与 404 兜底。线协议与客户端 queueSse 适配器对齐。
 *
 * dependencies: vitest, ./taskQueueApi
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { createTaskQueueEngine, handleTaskQueueRequest, QueueWireEvent } from "./taskQueueApi";

const BASE = "http://localhost:3031";

/** SSE 流文本读取器（读到包含目标子串即停；带超时兜底防悬挂） */
async function readSseUntil(res: Response, needle: string, timeoutMs = 5000): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = "";
  const timer = setTimeout(() => reader.cancel(), timeoutMs);
  try {
    while (!text.includes(needle)) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    clearTimeout(timer);
    await reader.cancel().catch(() => undefined);
  }
  return text;
}

const task = (id: string) => ({ id, type: "render", payload: { n: 1 } });

describe("server/taskQueueApi · 引擎核心（纯函数）", () => {
  it("enqueue 入队 + subscribe 广播 + 退订后不再收到", () => {
    const engine = createTaskQueueEngine();
    const events: QueueWireEvent[] = [];
    const unsubscribe = engine.subscribe((e) => events.push(e));

    engine.enqueue(task("t-1"));
    engine.enqueue(task("t-2"));
    expect(engine.snapshot().size).toBe(2);
    expect(events.map((e) => `${e.type}:${e.task.id}`)).toEqual(["enqueued:t-1", "enqueued:t-2"]);

    unsubscribe();
    engine.enqueue(task("t-3"));
    expect(events).toHaveLength(2);
    expect(engine.snapshot().size).toBe(3);
  });

  it("dispatch：队内任务移除并广播；队外任务仅广播（外部任务回报）", () => {
    const engine = createTaskQueueEngine();
    engine.enqueue(task("t-1"));
    engine.enqueue(task("t-2"));
    const events: QueueWireEvent[] = [];
    engine.subscribe((e) => events.push(e));

    engine.dispatch({ type: "dequeued", taskId: "t-1" });
    expect(engine.snapshot().size).toBe(1);
    engine.dispatch({ type: "completed", taskId: "t-2" });
    expect(engine.snapshot().size).toBe(0);
    engine.dispatch({ type: "failed", taskId: "external-9" }); // 队外
    expect(events.map((e) => `${e.type}:${e.task.id}`)).toEqual([
      "dequeued:t-1",
      "completed:t-2",
      "failed:external-9",
    ]);
  });
});

describe("server/taskQueueApi · Web 薄壳（Request/Response）", () => {
  it("POST /api/task-queue：受理 202；非法形状 400；非法 JSON 400", async () => {
    const ok = await handleTaskQueueRequest(
      new Request(`${BASE}/api/task-queue`, { method: "POST", body: JSON.stringify(task("t-1")) }),
    );
    expect(ok.status).toBe(202);
    expect(((await ok.json()) as { size: number }).size).toBe(1);

    const badShape = await handleTaskQueueRequest(
      new Request(`${BASE}/api/task-queue`, {
        method: "POST",
        body: JSON.stringify({ type: "render" }),
      }),
    );
    expect(badShape.status).toBe(400);

    const badJson = await handleTaskQueueRequest(
      new Request(`${BASE}/api/task-queue`, { method: "POST", body: "not-json" }),
    );
    expect(badJson.status).toBe(400);
  });

  it("GET /api/task-queue：队列快照（size + 任务列表）", async () => {
    const res = await handleTaskQueueRequest(new Request(`${BASE}/api/task-queue`));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; size: number; tasks: { id: string }[] };
    expect(body.ok).toBe(true);
    expect(body.size).toBe(body.tasks.length);
  });

  it("GET /api/task-queue/events：SSE 流实时收到 enqueued 事件（event/message/data 帧）", async () => {
    const streamRes = await handleTaskQueueRequest(new Request(`${BASE}/api/task-queue/events`));
    expect(streamRes.headers.get("content-type")).toContain("text/event-stream");
    const reader = streamRes.body!.getReader();

    await handleTaskQueueRequest(
      new Request(`${BASE}/api/task-queue`, {
        method: "POST",
        body: JSON.stringify(task("sse-1")),
      }),
    );

    const decoder = new TextDecoder();
    let text = "";
    const timer = setTimeout(() => reader.cancel(), 5000);
    try {
      while (!text.includes("sse-1")) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }
    } finally {
      clearTimeout(timer);
      await reader.cancel().catch(() => undefined);
    }
    expect(text).toContain("retry: 3000");
    expect(text).toContain("event: message");
    const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
    expect(dataLine).toBeTruthy();
    const event = JSON.parse(dataLine!.slice(6)) as QueueWireEvent;
    expect(event.type).toBe("enqueued");
    expect(event.task.id).toBe("sse-1");
    expect(typeof event.at).toBe("string");
  });

  it("dispatch 端点：SSE 透传 completed/failed；队内任务被移除", async () => {
    await handleTaskQueueRequest(
      new Request(`${BASE}/api/task-queue`, { method: "POST", body: JSON.stringify(task("w-1")) }),
    );
    // 单例引擎跨用例共享：取前置快照做相对断言（本用例只关心 -1 变化）
    const before = (
      (await (await handleTaskQueueRequest(new Request(`${BASE}/api/task-queue`))).json()) as {
        size: number;
      }
    ).size;
    expect(before).toBeGreaterThanOrEqual(1);

    const streamRes = await handleTaskQueueRequest(new Request(`${BASE}/api/task-queue/events`));

    const dispatch = await handleTaskQueueRequest(
      new Request(`${BASE}/api/task-queue/dispatch`, {
        method: "POST",
        body: JSON.stringify({ type: "completed", taskId: "w-1" }),
      }),
    );
    expect(dispatch.status).toBe(202);

    const text = await readSseUntil(streamRes, '"type":"completed"');
    expect(text).toContain('"type":"completed"');
    expect(text).toContain('"id":"w-1"');

    const after = (
      (await (await handleTaskQueueRequest(new Request(`${BASE}/api/task-queue`))).json()) as {
        size: number;
      }
    ).size;
    expect(after).toBe(before - 1);
  });

  it("未知端点 404 兜底", async () => {
    const res = await handleTaskQueueRequest(new Request(`${BASE}/api/nope`));
    expect(res.status).toBe(404);
  });
});
