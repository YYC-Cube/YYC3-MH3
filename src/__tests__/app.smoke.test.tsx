/**
 * file: src/__tests__/app.smoke.test.tsx
 * description: YYC³ 冒烟测试用例（P3：AppShell 路由外壳 + 根路由页）
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-10-11
 * updated: 2026-10-15
 * status: active
 * tags: [test],[smoke],[p3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P3 适配 —— App.tsx 退役，渲染对象换为 AppShell（导航外壳）+ 根 page
 *        （design-system 视图）；next/navigation 双 hook 以 pathname="/" 桩化
 *
 * dependencies: vitest, @testing-library/react, ../app/app-shell, ../app/page, ../app/contexts
 * exports: —
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// next/navigation 桩：AppShell/Sidebar 的路由事实源（pathname="/" → design-system）
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

import { AppShell } from "../app/app-shell";
import { AppProviders } from "../app/contexts";
import RootPage from "../app/page";

function renderApp() {
  return render(
    <AppProviders>
      <AppShell>
        <RootPage />
      </AppShell>
    </AppProviders>,
  );
}

describe("App 全局冒烟", () => {
  it("应用可完整挂载，底部状态栏显示本地优先标识", () => {
    renderApp();
    expect(screen.getByText(/MiniMax-H3 v2\.1 PRO 本地优先/)).toBeInTheDocument();
  });

  it("根路由挂载后载入设计体系视图", async () => {
    renderApp();
    const matches = await screen.findAllByText(/设计规范与全量组件库/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("顶部状态栏显示 YYC³ AI 协同连接状态", () => {
    renderApp();
    expect(screen.getByText(/YYC³ AI 协同已连接/)).toBeInTheDocument();
  });

  it("P2 守卫：状态 Context 缺 Provider 时 fail-fast 抛错（防静默空状态）", () => {
    // 直接渲染 AppShell（无 Provider 树）应抛出装配缺失错误
    expect(() =>
      render(
        <AppShell>
          <div>stub</div>
        </AppShell>,
      ),
    ).toThrow(/AppProviders/);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
