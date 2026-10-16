/**
 * file: server/sse.integration.test.ts
 * description: SSE 全链路集成测试 — 真实 TCP socket + 真实 EventSource（客户端适配器 ↔ 服务端引擎）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[integration],[sse],[full-link]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P4-4 全链路联调（E2）——与单元测试（替身注入）的本质区别：客户端
 *        `createSseTaskQueue` 使用 **真实 fetch + 真实 EventSource**（Node 22
 *        原生，WHATWG 规范与浏览器同源实现），服务端 `handleTaskQueueRequest`
 *        经 **真实 node:http TCP socket** 承载（node:http ↔ Web Request/Response
 *        适配薄壳，即 Track A 反向代理形态），两端走真实网络分帧：
 *   1. 客户端 enqueue → 服务端受理 → SSE 回声 enqueued（本地受理 + 引擎回声按 id 去重）
 *   2. 外部 POST dispatch → 服务端移除队内任务 → 客户端实时收到 completed
 *   3. 引擎快照经 GET 端点验证（受理/流转后的 size 变化）
 *
 * dependencies: vitest, node:http, node:stream, ./taskQueueApi, ../src/adapters/local/queueSse
 * exports: —
 */
// @vitest-environment node
import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSseTaskQueue, EventSourceLike } from "../src/adapters/local/queueSse";
import { handleTaskQueueRequest } from "./taskQueueApi";

/**
 * 真实 SSE 客户端工厂（Node 环境无原生 EventSource 全局时的同规范实现）：
 * 真 fetch GET /events 长连 + 真实流分帧解析（event/data 行、空行定帧），
 * close 经 AbortController 断连（服务端 pipeline 取消 → 引擎退订 + 心跳清理）。
 * 与浏览器 EventSource 同走线协议，联调信度等价。
 */
function makeFetchEventSource(url: string): EventSourceLike {
  const controller = new AbortController();
  const listeners = new Set<(event: { data?: string }) => void>();
  void (async () => {
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "text/event-stream" },
      });
      if (res.body === null) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary >= 0) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const data = frame
            .split("\n")
            .filter((line) => line.startsWith("data: "))
            .map((line) => line.slice(6))
            .join("\n");
          if (data) {
            for (const listener of listeners) listener({ data });
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch {
      /* 主动断连（abort）或服务端关闭：静默退出 */
    }
  })();
  return {
    addEventListener(_type, listener) {
      listeners.add(listener);
    },
    close() {
      controller.abort();
    },
  };
}

/** Track A 反向代理形态的最小适配：node:http 收 → Web Request → 引擎薄壳 → 回写 */
async function adapt(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = `http://127.0.0.1${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
  }
  const method = req.method ?? "GET";
  const chunks: Buffer[] = [];
  if (method !== "GET" && method !== "HEAD") {
    for await (const chunk of req) chunks.push(chunk as Buffer);
  }
  const webRes = await handleTaskQueueRequest(
    new Request(url, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
    }),
  );
  res.writeHead(webRes.status, Object.fromEntries(webRes.headers));
  if (webRes.body === null) {
    res.end();
    return;
  }
  // SSE 长流：客户端断开 → res close → pipeline 取消 Web 流 → 引擎退订 + 心跳清理
  await pipeline(Readable.fromWeb(webRes.body as unknown as NodeWebReadableStream), res).catch(
    () => undefined,
  );
}

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    void adapt(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  if (typeof addr === "object" && addr !== null) {
    baseUrl = `http://127.0.0.1:${addr.port}`;
  } else {
    throw new Error("node:http 服务监听失败");
  }
});

afterAll(async () => {
  server.closeAllConnections?.();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

/** 轮询直至谓词成立（SSE 事件到达为异步推流，2.5s 死线防悬挂） */
async function waitFor<T>(probe: () => T | null, deadlineMs = 2500): Promise<T> {
  const start = Date.now();
  for (;;) {
    const hit = probe();
    if (hit !== null) return hit;
    if (Date.now() - start > deadlineMs) throw new Error("waitFor 超时：SSE 事件未在死线内到达");
    await new Promise((r) => setTimeout(r, 25));
  }
}

/**
 * 订阅就绪探测：经原生 fetch 投递哨兵任务（服务端广播至全部已订阅监听器），
 * 客户端收到 enqueued:哨兵 即证明该 EventSource 已完成服务端订阅，
 * 消除「广播早于订阅建立」的时序竞态。哨兵不进客户端缓冲（不经适配器入队）。
 */
async function waitSubscribed(events: string[], tag: string, endpoint: string): Promise<void> {
  const probeId = `probe-${tag}`;
  const sent = await fetch(`${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: probeId, type: "probe" }),
  });
  expect(sent.status).toBe(202);
  await waitFor(() => (events.includes(`enqueued:${probeId}`) ? true : null));
}

describe("server/taskQueueApi ↔ adapters/local/queueSse · 全链路（真实 socket）", () => {
  it("enqueue 全链路：客户端 POST 受理 → SSE 引擎回声 → 本地/远端按 id 去重", async () => {
    const endpoint = `${baseUrl}/api/task-queue`;
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint,
      eventSourceFactory: makeFetchEventSource,
    });
    const events: string[] = [];
    queue.onEvent((e) => events.push(`${e.type}:${e.task.id}`));
    await waitSubscribed(events, "t1", endpoint);

    await queue.enqueue({ id: "link-1", type: "render", payload: { n: 1 } });

    // 引擎回声（经真实 SSE 分帧回环）到达后，与本地受理去重 → 恰一条 enqueued、缓冲一份
    await waitFor(() => (events.includes("enqueued:link-1") ? true : null));
    await new Promise((r) => setTimeout(r, 120)); // 留出潜在重复回声窗口
    expect(events.filter((e) => e === "enqueued:link-1")).toHaveLength(1);
    expect(queue.size()).toBe(2); // 哨兵广播与 link-1 各回填一份（广播不分投递者）

    // 服务端快照与客户端缓冲一致
    const snapshot = (await (await fetch(endpoint)).json()) as { size: number };
    expect(snapshot.size).toBe(2);
  });

  it("dispatch 全链路：外部 POST completed → 服务端移除队内任务 → 客户端实时收到事件", async () => {
    const endpoint = `${baseUrl}/api/task-queue`;
    const queue = createSseTaskQueue<{ n: number }>({
      endpoint,
      eventSourceFactory: makeFetchEventSource,
    });
    const events: string[] = [];
    queue.onEvent((e) => events.push(`${e.type}:${e.task.id}`));
    await waitSubscribed(events, "t2", endpoint);

    await queue.enqueue({ id: "link-2", type: "render", payload: { n: 2 } });
    const before = ((await (await fetch(endpoint)).json()) as { size: number }).size;

    const dispatch = await fetch(`${baseUrl}/api/task-queue/dispatch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "completed", taskId: "link-2" }),
    });
    expect(dispatch.status).toBe(202);

    const seen = await waitFor(() =>
      events.includes("completed:link-2") ? "completed:link-2" : null,
    );
    expect(seen).toBe("completed:link-2");

    // 队内任务已被流转移除（快照相对 before 回落 1）
    const after = ((await (await fetch(endpoint)).json()) as { size: number }).size;
    expect(after).toBe(before - 1);
  });

  it("非法 dispatch：形状校验 400，客户端不产生事件", async () => {
    const queue = createSseTaskQueue<{ n: number }>({ endpoint: `${baseUrl}/api/task-queue` });
    const events: string[] = [];
    queue.onEvent((e) => events.push(`${e.type}:${e.task.id}`));

    const bad = await fetch(`${baseUrl}/api/task-queue/dispatch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "exploded", taskId: "x" }),
    });
    expect(bad.status).toBe(400);
    await new Promise((r) => setTimeout(r, 120));
    expect(events).toHaveLength(0);
  });
});
