/**
 * file: src/__tests__/error-observability.test.tsx
 * description: YYC³ P0 可观测测试 — 错误留痕 sink + 渲染错误边界（错误不静默）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[observability],[error],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0 验收 —— ① reportClientError 经遥测端口落 error 留痕；
 *        ② ErrorBoundary 捕获渲染错误 + onError 回调；③ 重试重置；
 *        ④ ErrorSink 捕获 window.onerror。
 *
 * dependencies: vitest, @testing-library/react, ../app/error-sink, ../app/composition, ../components/common/ErrorBoundary
 * exports: —
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getPorts } from "../app/composition";
import { ErrorSink, reportClientError } from "../app/error-sink";
import { ErrorBoundary } from "../components/common/ErrorBoundary";

describe("P0 可观测 · 错误留痕最小闭环", () => {
  it("reportClientError 经遥测端口写入 error 级留痕（最新在前）", async () => {
    const before = (await getPorts().telemetry.listLogs()).length;
    reportClientError("测试错误消息", "测试来源");
    await waitFor(async () => {
      const logs = await getPorts().telemetry.listLogs();
      expect(logs.length).toBeGreaterThan(before);
      expect(logs[0]!.level).toBe("error");
      expect(logs[0]!.stage).toBe("client-runtime");
      expect(logs[0]!.message).toBe("测试错误消息");
      expect(logs[0]!.suggestion).toBe("测试来源");
    });
  });

  it("ErrorBoundary 捕获子树渲染错误 → 兜底 UI + onError 回调", () => {
    const onError = vi.fn();
    const Boom = () => {
      throw new Error("boom");
    };
    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/界面渲染异常/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("ErrorBoundary 重试按钮重置边界状态并恢复子树", () => {
    let shouldThrow = true;
    const Maybe = () => {
      if (shouldThrow) throw new Error("first");
      return <span>恢复内容</span>;
    };
    render(
      <ErrorBoundary>
        <Maybe />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/界面渲染异常/)).toBeInTheDocument();
    shouldThrow = false;
    fireEvent.click(screen.getByText("重试"));
    expect(screen.getByText("恢复内容")).toBeInTheDocument();
  });

  it("ErrorSink 捕获 window.onerror 事件 → 遥测留痕", async () => {
    render(<ErrorSink />);
    const before = (await getPorts().telemetry.listLogs()).length;
    act(() => {
      window.dispatchEvent(new ErrorEvent("error", { message: "window 级错误" }));
    });
    await waitFor(async () => {
      const logs = await getPorts().telemetry.listLogs();
      expect(logs.length).toBeGreaterThan(before);
      expect(logs[0]!.message).toBe("window 级错误");
    });
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
