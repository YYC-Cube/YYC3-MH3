/**
 * file: src/components/navigation/Topbar/index.tsx
 * description: YYC³ 导航组件 — Topbar 入口容器（状态装配 + 布局编排，分区下沉 parts）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[container],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Topbar 容器 —— 装配 useTopbar 状态并编排面包屑 / 全局搜索 / 快捷动作 / 通知中心 / 账号菜单。
 *
 * dependencies: react, ../../../types, ./useTopbar, ./parts/*
 * exports: NotifTab, TopbarProps, Topbar
 */
import React from "react";
import { AuthUser, NavigateExtra, NavTabId } from "../../../types";
import { TopbarBreadcrumb } from "./parts/TopbarBreadcrumb";
import { TopbarNotifications } from "./parts/TopbarNotifications";
import { TopbarQuickActions } from "./parts/TopbarQuickActions";
import { TopbarSearch } from "./parts/TopbarSearch";
import { TopbarUserMenu } from "./parts/TopbarUserMenu";
import { useTopbar } from "./useTopbar";
import type { ShowToastFn } from "./useTopbar";

export type { NotifTab } from "./useTopbar";

export interface TopbarProps {
  activeTab: NavTabId;
  currentUser?: AuthUser | null;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onOpenSearch: () => void;
  onNewBatchClick: () => void;
  onOpenYYC3: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onShowToast: ShowToastFn;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  currentUser,
  onNavigate,
  onOpenSearch,
  onNewBatchClick,
  onOpenYYC3,
  onOpenLogin,
  onLogout,
  onShowToast,
}) => {
  const state = useTopbar({ onShowToast });

  return (
    <header className="h-14 px-4 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between select-none z-30 relative">
      {/* Left Breadcrumb with secondary jump dropdown */}
      <TopbarBreadcrumb
        activeTab={activeTab}
        onNavigate={onNavigate}
        isBreadcrumbOpen={state.isBreadcrumbOpen}
        setIsBreadcrumbOpen={state.setIsBreadcrumbOpen}
        breadcrumbRef={state.breadcrumbRef}
      />

      {/* Middle Global Search Bar Trigger (Ctrl + K) */}
      <TopbarSearch onOpenSearch={onOpenSearch} />

      {/* Right Quick Controls & Notifications */}
      <div className="flex items-center gap-3">
        <TopbarQuickActions
          onNavigate={onNavigate}
          onOpenYYC3={onOpenYYC3}
          onNewBatchClick={onNewBatchClick}
        />

        <TopbarNotifications
          notifRef={state.notifRef}
          isNotificationOpen={state.isNotificationOpen}
          setIsNotificationOpen={state.setIsNotificationOpen}
          unreadCount={state.unreadCount}
          activeNotifTab={state.activeNotifTab}
          setActiveNotifTab={state.setActiveNotifTab}
          filteredNotifs={state.filteredNotifs}
          handleMarkAllRead={state.handleMarkAllRead}
          onNavigate={onNavigate}
        />

        <TopbarUserMenu
          userMenuRef={state.userMenuRef}
          isUserMenuOpen={state.isUserMenuOpen}
          setIsUserMenuOpen={state.setIsUserMenuOpen}
          currentUser={currentUser}
          onOpenLogin={onOpenLogin}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
