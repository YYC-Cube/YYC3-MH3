/**
 * file: src/__tests__/metrics-exporter.test.ts
 * description: YYC³ 运行时指标定时导出测试 — 指标载荷 + 配置钳制 + 调度行为 + 零公网守卫
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[contract],[metrics],[exporter],[loki],[scheduler],[p2]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 第七批 ② 契约（唯一判据：默认零网络行为；显式回环配置后按周期推送
 *        可被 Loki 直接消费的 logfmt 指标行）：
 *   1. toLokiMetricsPayload：顶层 logfmt 指标字段 + 纳秒时间戳 + heapMb 随行
 *   2. readMetricsExportConfig：默认关 / 端点启用 / 间隔钳制 [5s, 1h]
 *   3. createLokiSink.pushPayload：载荷直推 + pushed 计数 + disabled no-op
 *   4. startMetricsExporter：假时钟周期推送 / 推送失败静默 / stop 生效
 *   5. startRuntimeMetricsExport：回环端点真实推送 / 非回环构造期拒绝不抛错
 *
 * dependencies: vitest, ../app/metrics-exporter, ../adapters/lokiSink,
 *               ../domains/platform/observability/export
 * exports: —
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLokiSink } from "../adapters/lokiSink";
import { readMetricsExportConfig, startMetricsExporter, startRuntimeMetricsExport } from "../app/metrics-exporter";
import type { LokiPushPayload } from "../domains/platform/observability/export";
import { toLokiMetricsPayload } from "../domains/platform/observability/export";
import type { RuntimeMetricsSnapshot } from "../domains/platform/observability/metrics";

/** 基准快照（与 observability-export.test.ts 同构造，全部预算内） */
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

const LABELS = { app: "yyc3-mh3", source: "metrics-test" };
const FIXED_AT = new Date("2026-10-16T08:00:00.000Z");

describe("toLokiMetricsPayload · 指标即日志载荷", () => {
  it("输出顶层 logfmt 指标字段（六族对应）+ 纳秒时间戳", () => {
    const payload = toLokiMetricsPayload(makeSnapshot(), LABELS, { at: FIXED_AT, heapMb: 5.2 });
    expect(payload.streams).toHaveLength(1);
    expect(payload.streams[0]?.stream).toEqual(LABELS);
    const [ts, line] = payload.streams[0]?.values[0] ?? ["", ""];
    expect(ts).toBe(String(FIXED_AT.getTime() * 1_000_000));
    expect(line).toContain("level=info");
    expect(line).toContain("stage=metrics:runtime");
    expect(line).toContain("pageViews=120");
    expect(line).toContain("errors=1");
    expect(line).toContain("errorRate=0.0083");
    expect(line).toContain("navP95Ms=155");
    expect(line).toContain("longTaskP95Ms=0");
    expect(line).toContain("budgetViolations=0");
    expect(line).toContain("heapMb=5.2");
  });

  it("预算三项全越界 → budgetViolations=3；heapMb 缺省/非法省略字段", () => {
    const allOver = makeSnapshot({
      overBudget: { errorRate: true, p95LatencyMs: true, p95LongTaskMs: true },
    });
    const line = toLokiMetricsPayload(allOver, LABELS, { at: FIXED_AT }).streams[0]?.values[0]?.[1] ?? "";
    expect(line).toContain("budgetViolations=3");
    expect(line).not.toContain("heapMb=");

    const nanHeap = toLokiMetricsPayload(makeSnapshot(), LABELS, {
      at: FIXED_AT,
      heapMb: Number.NaN,
    });
    expect(nanHeap.streams[0]?.values[0]?.[1] ?? "").not.toContain("heapMb=");
  });
});

describe("readMetricsExportConfig · 配置钳制", () => {
  it("默认关（无端点 → enabled=false，endpoint=null）", () => {
    expect(readMetricsExportConfig({})).toEqual({
      enabled: false,
      endpoint: null,
      intervalMs: 60_000,
    });
  });

  it("端点存在即启用；间隔非法回退默认", () => {
    const cfg = readMetricsExportConfig({
      NEXT_PUBLIC_LOKI_ENDPOINT: "http://127.0.0.1:3100/loki/api/v1/push",
      NEXT_PUBLIC_METRICS_EXPORT_MS: "not-a-number",
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.endpoint).toBe("http://127.0.0.1:3100/loki/api/v1/push");
    expect(cfg.intervalMs).toBe(60_000);
  });

  it("间隔钳制到 [5s, 1h]", () => {
    expect(readMetricsExportConfig({ NEXT_PUBLIC_METRICS_EXPORT_MS: "1000" }).intervalMs).toBe(5_000);
    expect(readMetricsExportConfig({ NEXT_PUBLIC_METRICS_EXPORT_MS: "99999999" }).intervalMs).toBe(3_600_000);
  });
});

describe("createLokiSink.pushPayload · 载荷直推", () => {
  const payload: LokiPushPayload = {
    streams: [{ stream: LABELS, values: [["1700000000000000000", "pageViews=1"]] }],
  };

  it("enabled 时 POST JSON 载荷，pushed=values 总数", async () => {
    const fetchImpl = vi.fn(
      async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }),
    );
    const sink = createLokiSink({
      enabled: true,
      endpoint: "http://127.0.0.1:3100/loki/api/v1/push",
      labels: LABELS,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const result = await sink.pushPayload(payload);
    expect(result).toEqual({ ok: true, pushed: 1 });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] ?? ["", undefined];
    expect(url).toBe("http://127.0.0.1:3100/loki/api/v1/push");
    expect(JSON.parse((init?.body as string) ?? "{}")).toEqual(payload);
  });

  it("disabled no-op 不发请求；空载荷 no-op", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }));
    const sink = createLokiSink({
      enabled: false,
      endpoint: "http://127.0.0.1:3100/loki/api/v1/push",
      labels: LABELS,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(await sink.pushPayload(payload)).toEqual({ ok: true, pushed: 0, reason: "disabled" });
    expect(await sink.pushPayload({ streams: [] })).toEqual({ ok: true, pushed: 0 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("HTTP 500 → ok=false", async () => {
    const sink = createLokiSink({
      enabled: true,
      endpoint: "http://127.0.0.1:3100/loki/api/v1/push",
      labels: LABELS,
      fetchImpl: (async () => new Response(null, { status: 500 })) as unknown as typeof fetch,
    });
    const result = await sink.pushPayload(payload);
    expect(result).toEqual({ ok: false, pushed: 0, reason: "loki http 500" });
  });
});

describe("startMetricsExporter · 调度行为（假时钟）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("disabled → no-op stop，不产生任何推送", async () => {
    const push = vi.fn(async () => ({ ok: true, pushed: 1 }));
    const stop = startMetricsExporter({
      config: { enabled: false, endpoint: null, intervalMs: 1_000 },
      labels: LABELS,
      push,
    });
    await vi.advanceTimersByTimeAsync(10_000);
    stop();
    expect(push).not.toHaveBeenCalled();
  });

  it("按周期推送指标载荷；推送拒绝静默不中断调度", async () => {
    const snapshot = vi.fn(() => makeSnapshot({ pageViews: 7 }));
    let calls = 0;
    const push = vi.fn(async () => {
      calls += 1;
      if (calls === 1) throw new Error("network down");
      return { ok: true, pushed: 1 };
    });
    const stop = startMetricsExporter({
      config: { enabled: true, endpoint: "http://127.0.0.1:3100/loki/api/v1/push", intervalMs: 5_000 },
      labels: LABELS,
      push,
      snapshot,
      readHeapMb: () => 4.2,
      now: () => FIXED_AT,
    });
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(push).toHaveBeenCalledTimes(2);
    expect(snapshot).toHaveBeenCalledTimes(2);
    stop();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(push).toHaveBeenCalledTimes(2); // stop 后不再推送
  });
});

describe("startRuntimeMetricsExport · 默认接线（零公网守卫）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("未配置端点 → 零网络行为", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const stop = startRuntimeMetricsExport();
    await vi.advanceTimersByTimeAsync(120_000);
    stop();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("回环端点 → 按周期 POST 指标行（可被 Loki 消费）", async () => {
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_LOKI_ENDPOINT", "http://127.0.0.1:3100/loki/api/v1/push");
    vi.stubEnv("NEXT_PUBLIC_METRICS_EXPORT_MS", "10000");
    const stop = startRuntimeMetricsExport();
    await vi.advanceTimersByTimeAsync(10_000);
    stop();
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] ?? ["", undefined];
    expect(url).toBe("http://127.0.0.1:3100/loki/api/v1/push");
    expect(init?.method).toBe("POST");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.streams[0].stream).toEqual({ app: "yyc3-mh3", source: "metrics-exporter" });
    expect(body.streams[0].values[0][1]).toContain("stage=metrics:runtime");
  });

  it("非回环端点 → 构造期拒绝（不抛错、不产生网络行为）", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_LOKI_ENDPOINT", "https://loki.example.com/loki/api/v1/push");
    const stop = startRuntimeMetricsExport();
    await vi.advanceTimersByTimeAsync(120_000);
    stop();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
