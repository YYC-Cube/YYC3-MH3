/**
 * file: src/__tests__/perf-sink.test.ts
 * description: YYC³ P0-1 运行时性能采集测试（长任务预算 / 内存采样 / 导航代理 → 结构化留痕）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[perf],[observability],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0-1 验收 —— ① 观测 → 结构化 LogEntry（stage=perf:<kind> + traceId 透传 +
 *         越预算升 warn）；② longtask 预算判定（> 50ms）；③ 导航耗时 p95 代理
 *         阈值（≥ 2s）；④ 不支持环境安全降级为 no-op，停止函数幂等。
 *
 * dependencies: vitest, ../app/perf-sink
 * exports: —
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LONG_TASK_BUDGET_MS,
  PerfObservation,
  startPerfObserver,
  toLogEntry,
} from "../app/perf-sink";

/** 组装观测样本 */
function obs(partial: Partial<PerfObservation> = {}): PerfObservation {
  return {
    kind: "longtask",
    value: 82,
    unit: "ms",
    overBudget: true,
    at: "2026-10-16T02:00:00.000Z",
    traceId: "tr-perf",
    ...partial,
  };
}

describe("P0-1 运行时性能采集", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("长任务预算常量与评分卡目标一致（< 50ms）", () => {
    expect(LONG_TASK_BUDGET_MS).toBe(50);
  });

  it("toLogEntry：越预算长任务 → warn 级 perf:longtask，traceId 透传且标注预算", () => {
    const entry = toLogEntry(obs());
    expect(entry.level).toBe("warn");
    expect(entry.stage).toBe("perf:longtask");
    expect(entry.traceId).toBe("tr-perf");
    expect(entry.message).toContain("长任务 82ms");
    expect(entry.message).toContain("预算 50ms");
  });

  it("toLogEntry：未越预算内存观测 → info 级 perf:memory（无预算标注）", () => {
    const entry = toLogEntry(obs({ kind: "memory", value: 128.4, unit: "MB", overBudget: false }));
    expect(entry.level).toBe("info");
    expect(entry.stage).toBe("perf:memory");
    expect(entry.message).toBe("堆内存 128.4MB");
  });

  it("导航耗时 p95 代理：≥ 2s 判越预算，< 2s 不越线", () => {
    const spy = vi
      .spyOn(performance, "getEntriesByType")
      .mockReturnValue([{ duration: 2500 }] as unknown as PerformanceEntry[]);
    const slow = vi.fn();
    const stopSlow = startPerfObserver(slow);
    stopSlow();
    expect(slow).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "navigation", value: 2500, overBudget: true }),
    );

    spy.mockReturnValue([{ duration: 1200 }] as unknown as PerformanceEntry[]);
    const fast = vi.fn();
    const stopFast = startPerfObserver(fast);
    stopFast();
    expect(fast).toHaveBeenCalledWith(expect.objectContaining({ value: 1200, overBudget: false }));
  });

  it("不支持环境安全降级：返回可调用的停止函数，且停止幂等不抛错", () => {
    const onObserve = vi.fn();
    const stop = startPerfObserver(onObserve);
    expect(typeof stop).toBe("function");
    expect(() => stop()).not.toThrow();
    expect(() => stop()).not.toThrow();
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
