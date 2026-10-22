/**
 * file: src/__tests__/workbench-engine-execution.test.ts
 * description: YYC³ 测试 — Workbench 引擎执行分支（F-1 末跳：队列事件驱动三态 + 模拟循环停用 + 启动失败回滚）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-23
 * updated: 2026-10-23
 * status: active
 * tags: [test],[hook],[workbench],[engine]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: renderHook 驱动 usePipelineExecution：设 NEXT_PUBLIC_ENGINE_BASE_URL 时 start() 走 enqueue
 *        （dryRun=true、批次号提取），enqueued/dequeued/completed/failed 映射三态与 toast；
 *        enqueue 拒绝时回滚 isRunning；未设 env 时保持模拟循环（内存队列不接管）。
 *
 * dependencies: vitest, @testing-library/react, ../views/WorkbenchView/parts/usePipelineExecution
 * exports: —
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePipelineExecution } from "../views/WorkbenchView/parts/usePipelineExecution";
import { QueueEvent, QueueTask, TaskQueuePort } from "../domains/platform/queue/ports";

type Listener = (event: QueueEvent) => void;

/** 可手动派发事件的队列替身（记录 enqueue 载荷） */
function createFakeQueue(accept = true): TaskQueuePort & {
  dispatch(type: QueueEvent["type"], taskId?: string): void;
  enqueued: QueueTask[];
} {
  const listeners = new Set<Listener>();
  const enqueued: QueueTask[] = [];
  return {
    enqueued,
    async enqueue(task) {
      if (!accept) throw new Error("HTTP 409");
      enqueued.push(task);
      listeners.forEach((l) => l({ type: "enqueued", task, at: "t" }));
    },
    async dequeue() {
      return null;
    },
    onEvent(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch(type, taskId) {
      const task = enqueued.at(-1) ?? { id: taskId ?? "x", type: "pipeline.run", payload: {} };
      listeners.forEach((l) => l({ type, task, at: "t" }));
    },
  };
}

const toast = vi.fn();

describe("Workbench 引擎执行分支（F-1 末跳）", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ENGINE_BASE_URL", "http://127.0.0.1:3030/api");
    toast.mockClear();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("start：enqueue pipeline.run（dryRun=true，批次号自 id 提取）且 enqueued→isRunning", async () => {
    const queue = createFakeQueue();
    const { result } = renderHook(() =>
      usePipelineExecution({ onShowToast: toast, engineQueue: queue }),
    );
    await act(async () => {
      result.current.start();
    });
    expect(queue.enqueued[0]?.type).toBe("pipeline.run");
    expect(queue.enqueued[0]?.payload).toMatchObject({ batch: null, dryRun: true });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.progress).toBe(5);
  });

  it("事件驱动：dequeued→20，completed→100+停跑+success toast", async () => {
    const queue = createFakeQueue();
    const { result } = renderHook(() =>
      usePipelineExecution({ onShowToast: toast, engineQueue: queue }),
    );
    await act(async () => {
      result.current.start();
    });
    act(() => queue.dispatch("dequeued"));
    expect(result.current.progress).toBe(20);
    act(() => queue.dispatch("completed"));
    expect(result.current.progress).toBe(100);
    expect(result.current.isRunning).toBe(false);
    expect(toast).toHaveBeenCalledWith("success", "引擎流水线完成", expect.any(String));
  });

  it("failed→停跑+error toast；enqueue 拒绝→回滚 isRunning", async () => {
    const queue = createFakeQueue();
    const { result } = renderHook(() =>
      usePipelineExecution({ onShowToast: toast, engineQueue: queue }),
    );
    await act(async () => {
      result.current.start();
    });
    act(() => queue.dispatch("failed"));
    expect(result.current.isRunning).toBe(false);
    expect(toast).toHaveBeenCalledWith("error", "引擎流水线失败", expect.any(String));

    const rejecting = createFakeQueue(false);
    const r2 = renderHook(() =>
      usePipelineExecution({ onShowToast: toast, engineQueue: rejecting }),
    );
    await act(async () => {
      r2.result.current.start();
    });
    expect(r2.result.current.isRunning).toBe(false);
    expect(toast).toHaveBeenCalledWith("error", "引擎启动失败", expect.stringContaining("409"));
  });

  it("未设 env：start 走模拟循环（不 enqueue），tick 后进度推进", () => {
    vi.stubEnv("NEXT_PUBLIC_ENGINE_BASE_URL", "");
    const queue = createFakeQueue();
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      usePipelineExecution({ onShowToast: toast, engineQueue: queue }),
    );
    act(() => result.current.start());
    expect(queue.enqueued).toHaveLength(0);
    expect(result.current.isRunning).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(result.current.progress).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
