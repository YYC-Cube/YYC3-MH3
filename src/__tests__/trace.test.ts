/**
 * file: src/__tests__/trace.test.ts
 * description: YYC³ P0-2 全链路 traceId 内核原语测试（工厂 / 环境作用域 / 嵌套恢复）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[trace],[observability],[kernel],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0-2 验收 —— traceId 工厂互异、默认无作用域、同步/异步作用域设置与恢复
 *        （含异常路径与嵌套逐层恢复）。
 *
 * dependencies: vitest, ../kernel/trace
 * exports: —
 */
import { describe, expect, it } from "vitest";

import { currentTraceId, newTraceId, runWithTrace, runWithTraceAsync } from "../kernel/trace";

describe("P0-2 全链路 traceId · 内核原语", () => {
  it("newTraceId 产出非空且互异的 id（连续 100 次零重复）", () => {
    const ids = new Set(Array.from({ length: 100 }, () => newTraceId()));
    expect(ids.size).toBe(100);
    for (const id of ids) expect(id.length).toBeGreaterThan(8);
  });

  it("默认不在任何 trace 作用域：currentTraceId 为 undefined", () => {
    expect(currentTraceId()).toBeUndefined();
  });

  it("runWithTrace 设置环境 traceId 并在结束后恢复（异常亦恢复）", () => {
    expect(runWithTrace("t-1", () => currentTraceId())).toBe("t-1");
    expect(currentTraceId()).toBeUndefined();
    expect(() =>
      runWithTrace("t-2", () => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(currentTraceId()).toBeUndefined();
  });

  it("嵌套作用域逐层恢复（内层不影响外层）", () => {
    runWithTrace("outer", () => {
      expect(currentTraceId()).toBe("outer");
      runWithTrace("inner", () => expect(currentTraceId()).toBe("inner"));
      expect(currentTraceId()).toBe("outer");
    });
    expect(currentTraceId()).toBeUndefined();
  });

  it("runWithTraceAsync 在异步结算后恢复（成功与失败路径均恢复）", async () => {
    const seen = await runWithTraceAsync("async-1", async () => {
      await Promise.resolve();
      return currentTraceId();
    });
    expect(seen).toBe("async-1");
    expect(currentTraceId()).toBeUndefined();

    await expect(
      runWithTraceAsync("async-2", async () => {
        throw new Error("x");
      }),
    ).rejects.toThrow("x");
    expect(currentTraceId()).toBeUndefined();
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
