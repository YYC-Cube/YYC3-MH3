/**
 * file: src/App.tsx
 * description: 应用根组件 · 视图路由/领域状态装配/快捷键中枢（瘦身后仅保留组合编排）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-11
 * updated: 2026-10-12
 * status: active
 * tags: [core],[entry],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 应用根组件 · 视图路由/领域状态装配/快捷键中枢
 *
 * dependencies: react, ./app/*, ./components/common/Toast, ./components/common/ViewFallback, ./components/navigation/*, ./components/batch/NewBatchModal, ./components/yyc3/*, ./types
 * exports: App
 */
import { lazy, Suspense, useState } from "react";
import {
  useAuthContext,
  useOpsTelemetryContext,
  useProductionDataContext,
  useToastContext,
} from "./app/contexts";
import { useKeyboardShortcuts } from "./app/useKeyboardShortcuts";
import { NewBatchModal } from "./components/batch/NewBatchModal";
import { ToastContainer } from "./components/common/Toast";
import { ViewFallback } from "./components/common/ViewFallback";
import { GlobalSearchModal } from "./components/navigation/GlobalSearchModal";
import { Sidebar } from "./components/navigation/Sidebar";
import { StatusBar } from "./components/navigation/StatusBar";
import { Topbar } from "./components/navigation/Topbar";
import { YYC3FamilyModal } from "./components/yyc3/YYC3FamilyModal";
import { YYC3FloatingTrigger } from "./components/yyc3/YYC3FloatingTrigger";
import { NavigateExtra, NavTabId, NewBatchDraft } from "./types";

// Views — React.lazy 按视图分包，主包仅保留导航与外壳，消除单 chunk 体积告警
const DesignSystemView = lazy(() =>
  import("./views/DesignSystemView").then((m) => ({
    default: m.DesignSystemView,
  })),
);
const DashboardView = lazy(() =>
  import("./views/DashboardView").then((m) => ({ default: m.DashboardView })),
);
const WorkbenchView = lazy(() =>
  import("./views/WorkbenchView").then((m) => ({ default: m.WorkbenchView })),
);
const BatchDetailView = lazy(() =>
  import("./views/BatchDetailView").then((m) => ({
    default: m.BatchDetailView,
  })),
);
const SeedVaultView = lazy(() =>
  import("./views/SeedVaultView").then((m) => ({ default: m.SeedVaultView })),
);
const PromptHubView = lazy(() =>
  import("./views/PromptHubView").then((m) => ({ default: m.PromptHubView })),
);
const ModelsView = lazy(() =>
  import("./views/ModelsView").then((m) => ({ default: m.ModelsView })),
);
const AgentWorkflowView = lazy(() =>
  import("./views/AgentWorkflowView").then((m) => ({
    default: m.AgentWorkflowView,
  })),
);
const PlatformManagementView = lazy(() =>
  import("./views/PlatformManagementView").then((m) => ({
    default: m.PlatformManagementView,
  })),
);
const OpsMonitorView = lazy(() =>
  import("./views/OpsMonitorView").then((m) => ({ default: m.OpsMonitorView })),
);
const NightlyConsoleView = lazy(() =>
  import("./views/NightlyConsoleView").then((m) => ({
    default: m.NightlyConsoleView,
  })),
);
const DocsCenterView = lazy(() =>
  import("./views/DocsCenterView").then((m) => ({ default: m.DocsCenterView })),
);
const SettingsView = lazy(() =>
  import("./views/SettingsView").then((m) => ({ default: m.SettingsView })),
);
const LoginView = lazy(() => import("./views/LoginView").then((m) => ({ default: m.LoginView })));

export default function App() {
  // 导航外壳态
  const [activeTab, setActiveTab] = useState<NavTabId>("design-system");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isYYC3Open, setIsYYC3Open] = useState(false);

  // 领域状态（P2：Context 化 —— AppProviders 持有，跨路由段共享）
  const { toasts, showToast, dismissToast } = useToastContext();
  const { currentUser, isLoginViewOpen, setIsLoginViewOpen, login, bypassLogin, logout } =
    useAuthContext();
  const { batches, seeds, activeBatchId, setActiveBatchId, adoptSeed, createBatch } =
    useProductionDataContext();

  // 遥测事件表状态（P2：Context 化，TelemetryPort 端口消费）
  const {
    services: opsServices,
    metrics: opsMetrics,
    alarms: opsAlarms,
    logs: opsLogs,
    resolveAlarm: opsResolveAlarm,
  } = useOpsTelemetryContext();

  // Global Keyboard Shortcuts (Ctrl+B, Ctrl+K, Ctrl+/)
  useKeyboardShortcuts({
    onToggleSidebar: () => setSidebarCollapsed((p) => !p),
    onToggleSearch: () => setIsSearchOpen((p) => !p),
    onToggleYYC3: () => setIsYYC3Open((p) => !p),
  });

  const handleNavigate = (tab: NavTabId, extra?: NavigateExtra) => {
    setActiveTab(tab);
    if (extra?.batchId) {
      setActiveBatchId(extra.batchId);
    }
  };

  const handleCreateNewBatch = (draft: NewBatchDraft) => {
    // 构造规则在领域层；本处仅编排关闭弹窗/跳转工作台/成功反馈
    const created = createBatch(draft);
    setIsNewBatchModalOpen(false);
    setActiveTab("workbench");
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
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar with notification dropdown */}
          <Topbar
            activeTab={activeTab}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
            onNewBatchClick={() => setIsNewBatchModalOpen(true)}
            onOpenYYC3={() => setIsYYC3Open(true)}
            onOpenLogin={() => setIsLoginViewOpen(true)}
            onLogout={() => {
              logout();
              showToast("info", "已安全退出登录");
            }}
            onShowToast={showToast}
          />

          {/* Dynamic View Router (lazy chunks + Suspense) */}
          <main className="flex-1 flex overflow-hidden relative">
            <Suspense fallback={<ViewFallback />}>
              {activeTab === "design-system" && (
                <DesignSystemView
                  onOpenYYC3={() => setIsYYC3Open(true)}
                  onOpenLogin={() => setIsLoginViewOpen(true)}
                  onShowToast={showToast}
                  logs={opsLogs}
                />
              )}
              {activeTab === "dashboard" && (
                <DashboardView
                  batches={batches}
                  onNavigate={handleNavigate}
                  onNewBatchClick={() => setIsNewBatchModalOpen(true)}
                  onShowToast={showToast}
                />
              )}
              {activeTab === "workbench" && (
                <WorkbenchView
                  batches={batches}
                  activeBatchId={activeBatchId}
                  onSelectBatch={setActiveBatchId}
                  onAdoptSeed={adoptSeed}
                  onShowToast={showToast}
                  initialLogs={opsLogs}
                />
              )}
              {activeTab === "batch-detail" && (
                <BatchDetailView
                  batchId={activeBatchId}
                  batches={batches}
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                />
              )}
              {activeTab === "seed" && (
                <SeedVaultView
                  seeds={seeds}
                  onNavigate={handleNavigate}
                  onApplySeedToWorkbench={() => {
                    setActiveBatchId(batches[0]!.id); // 演示数据恒非空，回退至首批次
                  }}
                  onShowToast={showToast}
                />
              )}
              {activeTab === "prompt" && (
                <PromptHubView onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {activeTab === "models" && (
                <ModelsView onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {activeTab === "agent" && (
                <AgentWorkflowView onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {activeTab === "platform" && (
                <PlatformManagementView onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {activeTab === "ops" && (
                <OpsMonitorView
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                  metrics={opsMetrics}
                  services={opsServices}
                  logs={opsLogs}
                  initialAlarms={opsAlarms}
                  resolveAlarm={opsResolveAlarm}
                />
              )}
              {activeTab === "nightly" && (
                <NightlyConsoleView onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {activeTab === "docs" && (
                <DocsCenterView onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {activeTab === "settings" && <SettingsView onShowToast={showToast} />}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Industrial Bottom Status Bar (Requirement 2.3) */}
      <StatusBar
        onNavigateOps={() => handleNavigate("ops")}
        onOpenYYC3={() => setIsYYC3Open(true)}
        onShowToast={showToast}
      />

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
        batches={batches}
        seeds={seeds}
      />

      {/* YYC³ AI Family Global Floating Modal (Ctrl + /) */}
      <YYC3FamilyModal
        isOpen={isYYC3Open}
        onClose={() => setIsYYC3Open(false)}
        onApplyAction={(type) => {
          if (type === "apply_params") {
            showToast("success", "已将 AI 推荐参数注入工作台");
            handleNavigate("workbench");
          } else if (type === "inject_recommendation") {
            showToast("success", "已采纳 AI 诊断方案");
            handleNavigate("workbench");
          }
        }}
        onShowToast={showToast}
      />

      {/* Bottom Right Floating Launcher Trigger */}
      <YYC3FloatingTrigger onClick={() => setIsYYC3Open(true)} />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* New Batch Modal */}
      <NewBatchModal
        isOpen={isNewBatchModalOpen}
        onClose={() => setIsNewBatchModalOpen(false)}
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
