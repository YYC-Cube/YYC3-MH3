/**
 * file: src/__tests__/workbench.integration.test.tsx
 * description: YYC³ P1-3 UI 层集成测试（工作台路由段：登录守卫 / 新建批次全链路 / 流水线执行控制）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[integration],[ui],[workbench],[p1-3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-3 验收 —— UI 层从「仅冒烟」升级为关键交互断言：
 *   ① 登录守卫：打开登录视图 → LoginView 挂载 → 体验旁路返回工作台；
 *   ② 新建批次全链路：Topbar 入口 → NewBatchModal 表单 → 创建（真实 memory 仓储）
 *      → 成功 Toast + 批次队列出现新条目 + 路由 push 至 /workbench；
 *   ③ 流水线执行控制：运行中批次暂停/续跑（fake timers 推进 1s tick）/终止归零。
 *   挂载口径：AppProviders + AppShell + 真实 workbench 路由段页（next/navigation 桩化）。
 *
 * dependencies: vitest, @testing-library/react, ../app/app-shell, ../app/contexts, ../app/workbench/page
 * exports: —
 */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEffect } from "react";

const { pushSpy } = vi.hoisted(() => ({ pushSpy: vi.fn() }));

// next/navigation 桩：路由事实源固定为工作台段（push 由 useAppNavigate 副作用承接）
vi.mock("next/navigation", () => ({
  usePathname: () => "/workbench",
  useRouter: () => ({ push: pushSpy }),
}));

import { AppShell } from "../app/app-shell";
import { AppProviders, useAuthContext } from "../app/contexts";
import WorkbenchPage from "../app/workbench/page";
import { PIPELINE_COMPLETION_NOTICE } from "../domains/production/pipeline";

/** 打开登录视图的探针（经真实 AuthContext 触发，不绕过外壳守卫） */
function LoginGateProbe() {
  const { setIsLoginViewOpen } = useAuthContext();
  useEffect(() => {
    setIsLoginViewOpen(true);
  }, [setIsLoginViewOpen]);
  return null;
}

function mountApp(options?: { withLoginProbe?: boolean }) {
  return render(
    <AppProviders>
      {options?.withLoginProbe ? <LoginGateProbe /> : null}
      <AppShell>
        <WorkbenchPage />
      </AppShell>
    </AppProviders>,
  );
}

describe("工作台集成 · 登录守卫", () => {
  afterEach(() => {
    cleanup();
  });

  it("打开登录视图 → LoginView 挂载（体验旁路入口可见）", async () => {
    mountApp({ withLoginProbe: true });
    // LoginView 为 React.lazy 懒加载：异步解析后断言（Suspense fallback → 视图）
    // 高负载下 chunk 解析可超 1s，显式放宽 waitFor 预算（默认 1000ms 曾被门禁捕获 flaky）
    expect(await screen.findByText("体验模式直接进入", {}, { timeout: 10_000 })).toBeTruthy();
  }, 15_000);

  it("体验旁路 → 回到已认证外壳，工作台挂载运行中批次（初始 68% → 暂停态按钮）", async () => {
    mountApp({ withLoginProbe: true });
    fireEvent.click(await screen.findByText("体验模式直接进入", {}, { timeout: 10_000 }));
    const pauseBtn = await screen.findByRole("button", { name: /暂停生成 \(Pause\)/ }, { timeout: 10_000 });
    expect(pauseBtn).toBeTruthy();
    // 初始夹具批次名出现在批次队列（真实 memory 仓储数据）
    expect(screen.getByText("金融早报数字人-主播04号-4K超分")).toBeTruthy();
  }, 15_000);
});

describe("工作台集成 · 新建批次全链路（Topbar → 弹窗 → memory 仓储 → 队列）", () => {
  afterEach(() => {
    cleanup();
  });

  it("创建批次后：成功 Toast + 队列出现新批次 + 路由 push 至 /workbench", async () => {
    mountApp();

    // 1. Topbar 快捷动作打开新建批次弹窗（动态分块异步加载，findBy 等待 chunk）
    fireEvent.click(screen.getByText("新建批次"));
    expect(await screen.findByText("创建新数字人生产批次", {}, { timeout: 10_000 })).toBeTruthy();

    // 2. 填写批次任务名称（Input 组件 label htmlFor 关联）
    fireEvent.change(screen.getByLabelText("批次任务名称"), {
      target: { value: "回归测试批次-UI" },
    });

    // 3. 提交 → 外壳编排：createBatch（真实仓储）→ 关弹窗 → 跳工作台 → 成功反馈
    fireEvent.click(screen.getByRole("button", { name: "创建并立即启动五步流水线" }));

    expect(screen.getByText(/新批次 BATCH-.*已创建并启动/)).toBeTruthy();
    expect(screen.getByText("回归测试批次-UI")).toBeTruthy(); // 队列出现新条目
    expect(pushSpy).toHaveBeenCalledWith(expect.stringContaining("workbench"));
  }, 15_000);
});

describe("工作台集成 · 流水线执行控制（fake timers 推进 1s tick）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("暂停运行中批次 → 续跑 → 终止归零（按钮三态 + Toast 反馈）", () => {
    mountApp();

    // 初始：夹具批次 running 68% → 运行中（暂停按钮）
    const pauseBtn = screen.getByRole("button", { name: /暂停生成 \(Pause\)/ });

    // 1. 暂停
    fireEvent.click(pauseBtn);
    expect(screen.getByText("流水线已暂停")).toBeTruthy();
    const startBtn = screen.getByRole("button", { name: /启动生成 \(Ctrl\+Enter\)/ });

    // 2. 续跑：进度未满原地续跑（68 → tick 推进后仍在运行态）
    fireEvent.click(startBtn);
    expect(screen.getByRole("button", { name: /暂停生成 \(Pause\)/ })).toBeTruthy();
    actAdvance(2000);
    expect(screen.getByRole("button", { name: /暂停生成 \(Pause\)/ })).toBeTruthy();

    // 3. 终止：进度归零回到启动态 + warning 反馈
    fireEvent.click(screen.getByRole("button", { name: "终止" }));
    expect(screen.getByRole("button", { name: /启动生成 \(Ctrl\+Enter\)/ })).toBeTruthy();
    expect(screen.getByText("批次已重置终止")).toBeTruthy();
  });

  it("推进流水线至完成 → 成功通知（advancePipeline 闭环）", () => {
    mountApp();
    // 夹具批次 68%：+5/tick，8 tick 到 100%；
    // 逐 tick 推进（每 tick 单独 act）让 React 重渲染并清理 interval——
    // 一次性推进大时长会让 interval 以旧闭包连续触发，completed 分支重复发通知
    fireEvent.click(screen.getByRole("button", { name: /暂停生成 \(Pause\)/ }));
    fireEvent.click(screen.getByRole("button", { name: /启动生成 \(Ctrl\+Enter\)/ }));
    for (let i = 0; i < 8; i += 1) {
      actAdvance(1000);
    }
    // advancePipeline completed → 精确断言完成通知标题（有且仅一条）
    expect(screen.getByText(PIPELINE_COMPLETION_NOTICE.title)).toBeTruthy();
  });
});

/** fake timers 推进（包 act 触发 effect 刷新） */
function actAdvance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
