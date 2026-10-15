/**
 * file: src/app/app-shell.tsx
 * description: YYC³ 应用外壳 — 登录守卫 + 导航三件套 + 全局弹窗群（App.tsx 职责承接）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[shell],[navigation],[client]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 —— 根入口 App.tsx 退役，外壳职责迁入路由层：
 *   - 登录守卫：未认证/登录视图开启时整树切换 LoginView（Modal 语义保留，不设路由）
 *   - 导航外壳：Sidebar（路由事实源激活态）+ Topbar（pathname 反查）+ main{children}
 *     + StatusBar —— children 由各路由段 page.tsx 注入（14 视图路由化）
 *   - 全局弹窗群：⌘K 搜索 / 新建批次 / YYC³ AI 浮窗 + Toast 容器（UIShell 壳态）
 *   - 快捷键中枢：Ctrl+B / Ctrl+K / Ctrl+/ 原语义保留
 *   - React.lazy ×14 全删 —— 代码分割由 App Router 路由级承接
 *
 * dependencies: next/navigation, react, ./contexts, ./navigation, ./useKeyboardShortcuts, ../components/*
 * exports: AppShell
 */
"use client";

import { usePathname } from "next/navigation";
import { lazy, Suspense } from "react";

import { NewBatchModal } from "../components/batch/NewBatchModal";
import { ToastContainer } from "../components/common/Toast";
import { ViewFallback } from "../components/common/ViewFallback";
import { GlobalSearchModal } from "../components/navigation/GlobalSearchModal";
import { Sidebar } from "../components/navigation/Sidebar";
import { StatusBar } from "../components/navigation/StatusBar";
import { Topbar } from "../components/navigation/Topbar";
import { YYC3FamilyModal } from "../components/yyc3/YYC3FamilyModal";
import { YYC3FloatingTrigger } from "../components/yyc3/YYC3FloatingTrigger";
import { tabFromPathname } from "../config";
import { NewBatchDraft } from "../types";
import {
  useAuthContext,
  useProductionDataContext,
  useToastContext,
  useUIShellContext,
} from "./contexts";
import { useAppNavigate } from "./navigation";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

const LoginView = lazy(() => import("../views/LoginView").then((m) => ({ default: m.LoginView })));

export function AppShell({ children }: { children: React.ReactNode }) {
  // 领域状态（P2 Provider 树共享）
  const { toasts, showToast, dismissToast } = useToastContext();
  const { currentUser, isLoginViewOpen, setIsLoginViewOpen, login, bypassLogin, logout } =
    useAuthContext();
  const { batches, seeds, createBatch } = useProductionDataContext();

  // 外壳 UI 态（P3 UIShell 域）
  const ui = useUIShellContext();

  // 导航（P3：路由事实源 + 副作用承接）
  const pathname = usePathname();
  const activeTab = tabFromPathname(pathname ?? "/");
  const navigate = useAppNavigate();

  // Global Keyboard Shortcuts (Ctrl+B, Ctrl+K, Ctrl+/)
  useKeyboardShortcuts({
    onToggleSidebar: ui.toggleSidebar,
    onToggleSearch: ui.toggleSearch,
    onToggleYYC3: ui.toggleYYC3,
  });

  const handleCreateNewBatch = (draft: NewBatchDraft) => {
    // 构造规则在领域层；本处仅编排关闭弹窗/跳转工作台/成功反馈
    const created = createBatch(draft);
    ui.closeNewBatchModal();
    navigate("workbench");
    showToast("success", `新批次 ${created.id} 已创建并启动`, "已直接载入流水线工作台中栏");
  };

  // If in Login view or not authenticated
  if (isLoginViewOpen || !currentUser) {
    return (
      <Suspense fallback={<ViewFallback />}>
        <LoginView onLoginSuccess={login} onPreviewBypass={bypassLogin} onShowToast={showToast} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a1628] text-[#e8f0f8] font-sans antialiased flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation（激活态：usePathname 路由事实源） */}
        <Sidebar collapsed={ui.sidebarCollapsed} onToggleCollapse={ui.toggleSidebar} />

        {/* Main Content Viewport（children = 各路由段 page.tsx） */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar with notification dropdown */}
          <Topbar
            activeTab={activeTab}
            currentUser={currentUser}
            onNavigate={navigate}
            onOpenSearch={ui.openSearch}
            onNewBatchClick={ui.openNewBatchModal}
            onOpenYYC3={ui.openYYC3}
            onOpenLogin={() => setIsLoginViewOpen(true)}
            onLogout={() => {
              logout();
              showToast("info", "已安全退出登录");
            }}
            onShowToast={showToast}
          />

          <main className="flex-1 flex overflow-hidden relative">{children}</main>
        </div>
      </div>

      {/* Industrial Bottom Status Bar (Requirement 2.3) */}
      <StatusBar
        onNavigateOps={() => navigate("ops")}
        onOpenYYC3={ui.openYYC3}
        onShowToast={showToast}
      />

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={ui.isSearchOpen}
        onClose={ui.closeSearch}
        onNavigate={navigate}
        batches={batches}
        seeds={seeds}
      />

      {/* YYC³ AI Family Global Floating Modal (Ctrl + /) */}
      <YYC3FamilyModal
        isOpen={ui.isYYC3Open}
        onClose={ui.closeYYC3}
        onApplyAction={(type) => {
          if (type === "apply_params") {
            showToast("success", "已将 AI 推荐参数注入工作台");
            navigate("workbench");
          } else if (type === "inject_recommendation") {
            showToast("success", "已采纳 AI 诊断方案");
            navigate("workbench");
          }
        }}
        onShowToast={showToast}
      />

      {/* Bottom Right Floating Launcher Trigger */}
      <YYC3FloatingTrigger onClick={ui.openYYC3} />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* New Batch Modal */}
      <NewBatchModal
        isOpen={ui.isNewBatchModalOpen}
        onClose={ui.closeNewBatchModal}
        onSubmit={handleCreateNewBatch}
      />
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
