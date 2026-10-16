/**
 * file: src/__tests__/observability-bridge.test.ts
 * description: YYC³ P0-5 可观测端口契约测试（桥接适配器 + 组合根接线验证）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[observability],[contract],[port],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0-5 验收 —— ObservabilityPort 契约满足：emitLog 直写、emitMetric 攒批、
 *        flush 批量落盘（空缓冲早退 + 上限自动 flush）；且组合根 AppPorts 实际供给
 *        observability（接线断裂即红）。
 *
 * dependencies: vitest, ../adapters/observabilityBridge, ../app/composition, ../types
 * exports: —
 */
import { describe, expect, it, vi } from "vitest";

import { createTelemetryObservability, ObservabilitySink } from "../adapters/observabilityBridge";
import { getPorts } from "../app/composition";
import { LogEntry, OpsMetric } from "../types";

/** 契约样本日志 */
function sampleLog(traceId?: string): LogEntry {
  return {
    id: "log-1",
    timestamp: "10:00:00",
    level: "info",
    stage: "test",
    message: "hello",
    ...(traceId ? { traceId } : {}),
  };
}

/** 契约样本指标（OpsMetric 全字段） */
function sampleMetric(time: string): OpsMetric {
  return { time, gpuVram: 1, gpuUtil: 2, cpuUtil: 3, memUtil: 4, diskIops: 5, temp: 6 };
}

/** 组装 fake 落盘 sink（对齐遥测端口 appendLog/appendMetrics 契约） */
function makeSink(): {
  sink: ObservabilitySink;
  logs: LogEntry[];
  batches: OpsMetric[][];
  appendLog: ReturnType<typeof vi.fn>;
  appendMetrics: ReturnType<typeof vi.fn>;
} {
  const logs: LogEntry[] = [];
  const batches: OpsMetric[][] = [];
  const appendLog = vi.fn(async (e: LogEntry) => {
    logs.push(e);
    return e;
  });
  const appendMetrics = vi.fn(async (items: OpsMetric[]) => {
    batches.push(items);
  });
  return { sink: { appendLog, appendMetrics }, logs, batches, appendLog, appendMetrics };
}

describe("P0-5 可观测端口 · 桥接契约", () => {
  it("emitLog 直写落盘通道（逐条留痕 + traceId 透传）", async () => {
    const { sink, logs, appendLog } = makeSink();
    const obs = createTelemetryObservability(sink);
    await obs.emitLog(sampleLog("tr-9"));
    expect(appendLog).toHaveBeenCalledTimes(1);
    expect(logs[0]?.traceId).toBe("tr-9");
  });

  it("emitMetric 攒批：flush 前不落盘，flush 时批量写回且顺序保留", async () => {
    const { sink, batches, appendMetrics } = makeSink();
    const obs = createTelemetryObservability(sink);
    await obs.emitMetric(sampleMetric("t1"));
    await obs.emitMetric(sampleMetric("t2"));
    expect(appendMetrics).not.toHaveBeenCalled();
    await obs.flush();
    expect(appendMetrics).toHaveBeenCalledTimes(1);
    expect(batches[0]?.map((m) => m.time)).toEqual(["t1", "t2"]);
  });

  it("flush 空缓冲早退（无重复落盘）；二次 flush 不重复写", async () => {
    const { sink, appendMetrics } = makeSink();
    const obs = createTelemetryObservability(sink);
    await obs.flush();
    expect(appendMetrics).not.toHaveBeenCalled();
    await obs.emitMetric(sampleMetric("t1"));
    await obs.flush();
    await obs.flush();
    expect(appendMetrics).toHaveBeenCalledTimes(1);
  });

  it("缓冲上限防御：满 128 条自动 flush（防长会话内存无界增长）", async () => {
    const { sink, batches, appendMetrics } = makeSink();
    const obs = createTelemetryObservability(sink);
    for (let i = 0; i < 128; i += 1) {
      await obs.emitMetric(sampleMetric(`t${i}`));
    }
    expect(appendMetrics).toHaveBeenCalledTimes(1);
    expect(batches[0]?.length).toBe(128);
  });

  it("组合根实际供给 observability 端口（AppPorts 接线断裂即红）", async () => {
    const ports = getPorts();
    expect(typeof ports.observability.emitMetric).toBe("function");
    expect(typeof ports.observability.emitLog).toBe("function");
    expect(typeof ports.observability.flush).toBe("function");
    // 端到端：经真实端口 emitLog → 遥测日志表可见（P0-5 真实落盘链路）
    const before = (await ports.telemetry.listLogs()).length;
    await ports.observability.emitLog(sampleLog("tr-e2e"));
    const logs = await ports.telemetry.listLogs();
    expect(logs.length).toBeGreaterThan(before);
    expect(logs[0]?.traceId).toBe("tr-e2e");
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
