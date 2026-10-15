/**
 * file: src/app/contexts.tsx
 * description: YYC³ 应用层 — 状态 Context 化（P2：四大领域状态 Provider 树 + fail-fast 消费守卫）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[context],[provider],[state]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P2 —— App.tsx 领域状态装配迁出为 Provider 树：
 *   - Toast / 认证会话 / 生产数据 / 运维遥测四域各一 Context，Provider 内
 *     持有原状态 Hook（实现零改动复用），消费侧经 useXxxContext 读取
 *   - AppProviders 组合 Provider 树，挂 app/layout.tsx —— P3 路由拆分后
 *     全部路由段天然共享同一状态树（跨页 toast/登录态/批次选中不丢）
 *   - 消费守卫 fail-fast：缺 Provider 直接抛错，杜绝静默空状态
 *   - P3 增补：UIShell 壳态域（侧栏折叠/⌘K 搜索/新建批次/AI 浮窗四开关）——
 *     外壳 UI 态跨路由段共享（DesignSystemView 等视图可直达全局弹窗）
 *
 * dependencies: react, ./useToast, ./useAuthSession, ./useProductionData, ./useOpsTelemetry
 * exports: AppProviders, useToastContext, useAuthContext, useProductionDataContext, useOpsTelemetryContext, useUIShellContext
 */
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { useAuthSession } from "./useAuthSession";
import { useOpsTelemetry } from "./useOpsTelemetry";
import { useProductionData } from "./useProductionData";
import { useToast } from "./useToast";

// ---- 四域 Context 定义（value 类型由原 Hook 返回类型推断，契约零漂移） ----

type ToastState = ReturnType<typeof useToast>;
const ToastContext = createContext<ToastState | null>(null);

type AuthState = ReturnType<typeof useAuthSession>;
const AuthContext = createContext<AuthState | null>(null);

type ProductionDataState = ReturnType<typeof useProductionData>;
const ProductionDataContext = createContext<ProductionDataState | null>(null);

type OpsTelemetryState = ReturnType<typeof useOpsTelemetry>;
const OpsTelemetryContext = createContext<OpsTelemetryState | null>(null);

/** P3 外壳 UI 态（侧栏折叠 + 三个全局弹窗开关，App.tsx 迁出） */
function useUIShellState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isYYC3Open, setIsYYC3Open] = useState(false);
  return {
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((p) => !p),
    isSearchOpen,
    openSearch: () => setIsSearchOpen(true),
    closeSearch: () => setIsSearchOpen(false),
    toggleSearch: () => setIsSearchOpen((p) => !p),
    isNewBatchModalOpen,
    openNewBatchModal: () => setIsNewBatchModalOpen(true),
    closeNewBatchModal: () => setIsNewBatchModalOpen(false),
    isYYC3Open,
    openYYC3: () => setIsYYC3Open(true),
    closeYYC3: () => setIsYYC3Open(false),
    toggleYYC3: () => setIsYYC3Open((p) => !p),
  };
}

type UIShellState = ReturnType<typeof useUIShellState>;
const UIShellContext = createContext<UIShellState | null>(null);

// ---- fail-fast 消费守卫 ----

function requireProvider<T>(value: T | null, name: string): T {
  if (value === null) {
    throw new Error(`${name} 必须在 <AppProviders> 内消费（05 清单 P2：状态树唯一装配点）`);
  }
  return value;
}

/** Toast 通知域消费入口 */
export function useToastContext(): ToastState {
  return requireProvider(useContext(ToastContext), "useToastContext");
}

/** 认证会话域消费入口 */
export function useAuthContext(): AuthState {
  return requireProvider(useContext(AuthContext), "useAuthContext");
}

/** 生产数据域消费入口（批次/种子/选中批次） */
export function useProductionDataContext(): ProductionDataState {
  return requireProvider(useContext(ProductionDataContext), "useProductionDataContext");
}

/** 运维遥测域消费入口（服务/指标/告警/日志） */
export function useOpsTelemetryContext(): OpsTelemetryState {
  return requireProvider(useContext(OpsTelemetryContext), "useOpsTelemetryContext");
}

/** 外壳 UI 态消费入口（侧栏折叠/⌘K/新建批次/AI 浮窗开关） */
export function useUIShellContext(): UIShellState {
  return requireProvider(useContext(UIShellContext), "useUIShellContext");
}

// ---- Provider 组合树（挂 app/layout.tsx，全路由段共享） ----

/**
 * 应用状态 Provider 树：
 * Toast（独立通知域）→ Auth（会话）→ ProductionData（生产域，依赖单例端口）
 * → OpsTelemetry（遥测域，依赖单例端口）
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastContext.Provider value={useToast()}>
      <AuthContext.Provider value={useAuthSession()}>
        <ProductionDataContext.Provider value={useProductionData()}>
          <OpsTelemetryContext.Provider value={useOpsTelemetry()}>
            <UIShellContext.Provider value={useUIShellState()}>{children}</UIShellContext.Provider>
          </OpsTelemetryContext.Provider>
        </ProductionDataContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
