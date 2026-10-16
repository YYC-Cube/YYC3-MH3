/**
 * file: src/__tests__/seedvault.integration.test.tsx
 * description: YYC³ P1-3 UI 层集成测试（种子库视图：夹具渲染 / 搜索过滤 / 对比勾选 / 基因谱系抽屉 / 载入工作台）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[integration],[ui],[seed-vault],[p1-3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-3 验收 —— 种子库关键交互断言（真实 memory 种子夹具 + 真实 Toast 域）：
 *   ① 夹具渲染：种子卡（名称 / 种子号）可见；
 *   ② 搜索过滤：关键词命中过滤与无命中清空；
 *   ③ 对比勾选：header 计数 (N/3) 联动；
 *   ④ 基因谱系抽屉：打开抽屉 → 一键应用回调 + Toast + 导航 workbench。
 *
 * dependencies: vitest, @testing-library/react, ../app/contexts, ../views/SeedVaultView
 * exports: —
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppProviders, useProductionDataContext, useToastContext } from "../app/contexts";
import { ToastContainer } from "../components/common/Toast";
import { SeedVaultView } from "../views/SeedVaultView";

const { navigateSpy, applySeedSpy } = vi.hoisted(() => ({
  navigateSpy: vi.fn(),
  applySeedSpy: vi.fn(),
}));

/** 种子库挂载壳：种子数据取自真实 ProductionData 域（memory 夹具），Toast 为真实域 */
function SeedVaultHarness() {
  const { seeds } = useProductionDataContext();
  const { showToast, toasts, dismissToast } = useToastContext();
  return (
    <>
      {/* Toast 渲染容器归 AppShell 承载；独立挂载视图时须显式补挂，否则通知无 DOM 出口 */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <SeedVaultView
        seeds={seeds}
        onNavigate={navigateSpy}
        onApplySeedToWorkbench={applySeedSpy}
        onShowToast={showToast}
      />
    </>
  );
}

function mountVault() {
  return render(
    <AppProviders>
      <SeedVaultHarness />
    </AppProviders>,
  );
}

describe("种子库集成 · 夹具渲染与搜索过滤", () => {
  afterEach(() => {
    cleanup();
  });

  it("memory 种子夹具渲染：种子卡名称与种子号可见", () => {
    mountVault();
    expect(screen.getByText("钛极超稳态·CEO领袖种子")).toBeTruthy();
    expect(screen.getByText("#81923011")).toBeTruthy();
  });

  it("搜索关键词过滤：命中唯一卡片，无命中清空网格", () => {
    mountVault();
    const search = screen.getByPlaceholderText("搜索种子号、名称或标签...");

    fireEvent.change(search, { target: { value: "幽玄" } });
    expect(screen.getByText("幽玄沉香·古风漫剧女主")).toBeTruthy();
    expect(screen.queryByText("钛极超稳态·CEO领袖种子")).toBeNull();

    fireEvent.change(search, { target: { value: "不存在的种子XYZ" } });
    expect(screen.queryByText("幽玄沉香·古风漫剧女主")).toBeNull();
  });
});

describe("种子库集成 · 对比勾选与详情抽屉", () => {
  afterEach(() => {
    cleanup();
    navigateSpy.mockClear();
    applySeedSpy.mockClear();
  });

  it("勾选加入对比 → header 计数联动 (1/3) → (2/3)", () => {
    mountVault();
    // React 19 checkbox 的 onChange 由 click 合成；jsdom 不执行激活行为，
    // 且手动赋值会被 ValueTracker 判为无变化（去重）——故仅驱动两张不同卡片的
    // 首次勾选（各自的首个 click 均为真实变更），断言计数绑定与 (N/3) 展示。
    // （toggle 的取消分支由 useSeedVaultView 状态机覆盖，此处聚焦 UI 计数联动）
    const boxes = screen.getAllByTitle("勾选加入多种子对比");

    fireEvent.click(boxes[0]!);
    expect(screen.getByText("对比已选种子 (1/3)")).toBeTruthy();

    fireEvent.click(boxes[1]!);
    expect(screen.getByText("对比已选种子 (2/3)")).toBeTruthy();
  });

  it("基因谱系抽屉：打开显示谱系标题 → 一键应用触发回写回调 + Toast + 导航工作台", () => {
    mountVault();

    // 打开首张卡片的基因谱系抽屉（排序首项 = 钛极超稳态）
    fireEvent.click(screen.getAllByRole("button", { name: "基因谱系" })[0]!);
    expect(screen.getByText("Seed #81923011 · 基因参数谱系与版本历史")).toBeTruthy();

    // 抽屉底部一键应用：回调 + 成功反馈 + 路由编排
    fireEvent.click(screen.getByRole("button", { name: "一键应用此 Seed 到流水线工作台" }));
    expect(applySeedSpy).toHaveBeenCalledWith(expect.objectContaining({ seedNumber: 81923011 }));
    expect(screen.getByText("已应用种子 #81923011")).toBeTruthy();
    expect(navigateSpy).toHaveBeenCalledWith("workbench");
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
