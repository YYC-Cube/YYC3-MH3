/**
 * file: src/__tests__/observability-export.test.ts
 * description: YYC³ 可观测出口契约测试 — Prometheus exposition + Loki push 载荷 + BFF scrape 端点
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[contract],[prometheus],[loki],[export],[p2]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-2 线格式契约（唯一判据：出口格式可被 Prometheus/Loki 直接消费）：
 *   1. renderRuntimePrometheus：HELP/TYPE 结构 + 预算越界计数 + 结尾换行
 *   2. toLokiPushPayload：纳秒时间戳 / logfmt 行 / traceId 可检索 / 空批次 / 值转义
 *   3. renderOpsPrometheus + handleWebRequest scrape：HELP/TYPE + time 标签 + 回环 403
 *   4. createLokiSink：非回环构造期拒绝 / disabled no-op / enabled 真实推送与失败结果
 *
 * dependencies: vitest, ../domains/platform/observability/export, ../adapters/lokiSink, ../../server/routeHandler
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { handleWebRequest } from "../../server/routeHandler";
import { createLokiSink } from "../adapters/lokiSink";
import { renderRuntimePrometheus, toLokiPushPayload } from "../domains/platform/observability/export";
import type { RuntimeMetricsSnapshot } from "../domains/platform/observability/metrics";
import type { LogEntry } from "../types";

/** 基准快照（全部预算内） */
function makeSnapshot(overrides: Partial<RuntimeMetricsSnapshot> = {}): RuntimeMetricsSnapshot {
  return {
    pageViews: 120,
    errors: 1,
    errorRate: 1 / 120,
    p95LatencyMs: 155,
    p95LongTaskMs: 0,
    latencySamples: 120,
    longTaskSamples: 0,
    overBudget: { errorRate: false, p95LatencyMs: false, p95LongTaskMs: false },
    ...overrides,
  };
}

/** 基准日志条目 */
function makeLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "log-1",
    timestamp: "2026-10-16T08:00:00.000Z",
    level: "warn",
    stage: "AI 助手",
    message: "local 通道降级",
    traceId: "trace-abc-123",
    ...overrides,
  };
}

describe("renderRuntimePrometheus · 运行时指标 exposition", () => {
  it("输出 HELP/TYPE + 样本行三段式，且以换行结尾", () => {
    const text = renderRuntimePrometheus(makeSnapshot());
    expect(text.endsWith("\n")).toBe(true);
    expect(text).toContain("# HELP yyc3_runtime_page_views_total ");
    expect(text).toContain("# TYPE yyc3_runtime_page_views_total counter");
    expect(text).toContain("yyc3_runtime_page_views_total 120");
    expect(text).toContain("# TYPE yyc3_runtime_client_errors_total counter");
    expect(text).toContain("yyc3_runtime_client_errors_total 1");
  });

  it("预算越界计数 = 三个 overBudget 真值之和", () => {
    const text = renderRuntimePrometheus(
      makeSnapshot({ overBudget: { errorRate: true, p95LatencyMs: true, p95LongTaskMs: false } }),
    );
    expect(text).toContain("yyc3_runtime_budget_violations 2");
  });

  it("errorRate 以比值输出（非百分数），分位值直出", () => {
    const text = renderRuntimePrometheus(makeSnapshot());
    expect(text).toContain("yyc3_runtime_error_rate 0.008333333333333333");
    expect(text).toContain("yyc3_runtime_nav_latency_p95_ms 155");
    expect(text).toContain("yyc3_runtime_long_task_p95_ms 0");
  });
});

describe("toLokiPushPayload · Loki push 载荷", () => {
  const labels = { app: "yyc3-mh3", source: "client" };

  it("单流多值：纳秒时间戳 + logfmt 行含 traceId", () => {
    const payload = toLokiPushPayload([makeLogEntry()], labels);
    expect(payload.streams).toHaveLength(1);
    expect(payload.streams[0]?.stream).toEqual(labels);
    const [ts, line] = payload.streams[0]?.values[0] ?? ["", ""];
    expect(ts).toBe(String(Date.parse("2026-10-16T08:00:00.000Z") * 1_000_000));
    expect(line).toContain("level=warn");
    expect(line).toContain('stage="AI 助手"');
    expect(line).toContain("traceId=trace-abc-123");
    expect(line).toContain('msg="local 通道降级"');
  });

  it("含空白或引号的值以引号包裹并转义内部引号", () => {
    const payload = toLokiPushPayload([makeLogEntry({ message: '含 "引号" 与 空格', traceId: undefined })], labels);
    const line = payload.streams[0]?.values[0]?.[1] ?? "";
    expect(line).toContain('msg="含 \\"引号\\" 与 空格"');
    expect(line).not.toContain("traceId=");
  });

  it("空批次返回空 streams（调用方无需发送）", () => {
    expect(toLokiPushPayload([], labels)).toEqual({ streams: [] });
  });

  it("非法时间戳回退纳秒 0（不伪造时间）", () => {
    const payload = toLokiPushPayload([makeLogEntry({ timestamp: "not-a-date" })], labels);
    expect(payload.streams[0]?.values[0]?.[0]).toBe("0");
  });
});

describe("createLokiSink · 推送适配器", () => {
  const LOOPBACK = "http://127.0.0.1:3100/loki/api/v1/push";

  it("非回环端点构造期即拒绝（零公网守卫）", () => {
    expect(() =>
      createLokiSink({ endpoint: "https://loki.example.com/push", labels: { app: "a", source: "b" } }),
    ).toThrow(/零公网守卫/);
  });

  it("disabled 状态 no-op：不发网络请求", async () => {
    let called = 0;
    const sink = createLokiSink({
      endpoint: LOOPBACK,
      labels: { app: "a", source: "b" },
      enabled: false,
      fetchImpl: (async () => {
        called += 1;
        return new Response("{}");
      }) as typeof fetch,
    });
    const result = await sink.push([makeLogEntry()]);
    expect(result).toEqual({ ok: true, pushed: 0, reason: "disabled" });
    expect(called).toBe(0);
    expect(sink.describe()).toEqual({ enabled: false, endpoint: LOOPBACK });
  });

  it("enabled 推送：POST JSON 载荷，成功返回条数", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const sink = createLokiSink({
      endpoint: LOOPBACK,
      labels: { app: "yyc3-mh3", source: "client" },
      enabled: true,
      fetchImpl: (async (url: string | URL | Request, init?: RequestInit) => {
        captured = { url: String(url), init: init ?? {} };
        return new Response(null, { status: 204 });
      }) as typeof fetch,
    });
    const result = await sink.push([makeLogEntry()]);
    expect(result).toEqual({ ok: true, pushed: 1 });
    expect((captured as { url: string } | null)?.url).toBe(LOOPBACK);
    const body = JSON.parse(String((captured as unknown as { init: RequestInit }).init.body)) as {
      streams: Array<{ values: Array<[string, string]> }>;
    };
    expect(body.streams[0]?.values).toHaveLength(1);
  });

  it("网络失败返回 ok=false 与原因（不静默吞）", async () => {
    const sink = createLokiSink({
      endpoint: LOOPBACK,
      labels: { app: "a", source: "b" },
      enabled: true,
      fetchImpl: (async () => {
        throw new Error("ECONNREFUSED");
      }) as typeof fetch,
    });
    const result = await sink.push([makeLogEntry()]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("ECONNREFUSED");
  });

  it("非 2xx 响应返回 ok=false 与 http 状态原因", async () => {
    const sink = createLokiSink({
      endpoint: LOOPBACK,
      labels: { app: "a", source: "b" },
      enabled: true,
      fetchImpl: (async () => new Response("err", { status: 503 })) as typeof fetch,
    });
    expect((await sink.push([makeLogEntry()])).reason).toBe("loki http 503");
  });
});

describe("handleWebRequest · /api/metrics/prometheus scrape 端点", () => {
  it("回环访问返回 exposition 文本（HELP/TYPE + time 标签样本）", async () => {
    const req = new Request("http://127.0.0.1:3031/api/metrics/prometheus", {
      headers: { host: "127.0.0.1:3031" },
    });
    const res = await handleWebRequest(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toContain("# TYPE yyc3_platform_gpu_util_percent gauge");
    expect(text).toMatch(/yyc3_platform_gpu_vram_gb\{time="\d{2}:\d{2}"\} /);
  });

  it("非回环 Host 返回 403（06 §1.1 同口径）", async () => {
    const req = new Request("http://mh3.yyc3.top/api/metrics/prometheus", {
      headers: { host: "mh3.yyc3.top" },
    });
    const res = await handleWebRequest(req);
    expect(res.status).toBe(403);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
