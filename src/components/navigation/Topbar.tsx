/**
 * file: src/components/navigation/Topbar.tsx
 * description: YYC³ 导航组件 — Topbar
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[navigation],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 导航组件 — Topbar
 *
 * dependencies: lucide-react, react, ../../types, ../common
 * exports: TopbarProps, Topbar
 */
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HardDrive,
  Info,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AuthUser, NavigateExtra, NavTabId, NotificationItem } from "../../types";
import { Badge } from "../common";

/** 通知中心分类页签 */
export type NotifTab = "all" | "alarm" | "completed" | "system";

const NOTIF_TABS: { id: NotifTab; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "alarm", label: "告警预警" },
  { id: "completed", label: "批次完成" },
  { id: "system", label: "系统自愈" },
];

export interface TopbarProps {
  activeTab: NavTabId;
  currentUser?: AuthUser | null;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onOpenSearch: () => void;
  onNewBatchClick: () => void;
  onOpenYYC3: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

const TAB_TITLES: Record<
  NavTabId,
  {
    parent: string;
    current: string;
    siblings: { id: NavTabId; label: string }[];
  }
> = {
  "design-system": {
    parent: "MiniMax-H3 设计体系",
    current: "设计规范与全量组件库",
    siblings: [
      { id: "design-system", label: "设计规范与全量组件库" },
      { id: "docs", label: "内置文档中心 (22篇指南)" },
    ],
  },
  dashboard: {
    parent: "生产驾驶舱",
    current: "总览驾驶舱 Dashboard",
    siblings: [
      { id: "dashboard", label: "总览驾驶舱 Dashboard" },
      { id: "workbench", label: "五步闭环流水线工作台" },
      { id: "ops", label: "系统运维与算力监控" },
    ],
  },
  workbench: {
    parent: "核心生产",
    current: "五步闭环流水线工作台",
    siblings: [
      { id: "workbench", label: "五步闭环流水线工作台" },
      { id: "batch-detail", label: "批次复盘与产物分析" },
      { id: "seed", label: "Seed 种子库全生命周期" },
      { id: "prompt", label: "提示词工程中心" },
    ],
  },
  "batch-detail": {
    parent: "核心生产",
    current: "批次详情与复盘分析",
    siblings: [
      { id: "workbench", label: "返回流水线工作台" },
      { id: "batch-detail", label: "批次详情与复盘分析" },
      { id: "seed", label: "Seed 种子库" },
    ],
  },
  seed: {
    parent: "核心资产",
    current: "Seed 种子库全生命周期",
    siblings: [
      { id: "seed", label: "Seed 种子库全生命周期" },
      { id: "workbench", label: "流水线工作台" },
      { id: "prompt", label: "提示词工程中心" },
    ],
  },
  prompt: {
    parent: "工程中心",
    current: "提示词工程中心与测试台",
    siblings: [
      { id: "prompt", label: "提示词工程中心" },
      { id: "workbench", label: "流水线工作台" },
      { id: "seed", label: "Seed 种子库" },
    ],
  },
  models: {
    parent: "计算资源",
    current: "本地模型权重与环境诊断",
    siblings: [
      { id: "models", label: "本地模型权重与环境" },
      { id: "ops", label: "系统运维监控" },
    ],
  },
  agent: {
    parent: "漫剧编排",
    current: "多 Agent 工作流编排画布",
    siblings: [
      { id: "agent", label: "多 Agent 工作流编排" },
      { id: "platform", label: "平台管理中心" },
      { id: "workbench", label: "流水线工作台" },
    ],
  },
  platform: {
    parent: "调度与后期",
    current: "平台管理中心 (调度/媒体/分析/配置)",
    siblings: [
      { id: "platform", label: "平台管理中心" },
      { id: "workbench", label: "流水线工作台" },
      { id: "dashboard", label: "总览驾驶舱" },
      { id: "ops", label: "系统运维监控" },
    ],
  },
  ops: {
    parent: "运维中心",
    current: "硬件指标监控与看门狗告警",
    siblings: [
      { id: "ops", label: "系统运维监控" },
      { id: "models", label: "模型与资源管理" },
      { id: "nightly", label: "夜间批量控制台" },
    ],
  },
  nightly: {
    parent: "无人值守",
    current: "夜间低蓝光批量控制台",
    siblings: [
      { id: "nightly", label: "夜间批量控制台" },
      { id: "ops", label: "系统运维监控" },
    ],
  },
  docs: {
    parent: "知识中心",
    current: "内置工程文档中心 (22篇)",
    siblings: [
      { id: "docs", label: "内置文档中心" },
      { id: "design-system", label: "设计规范与组件库" },
    ],
  },
  settings: {
    parent: "全局配置",
    current: "系统设置与硬件限制",
    siblings: [
      { id: "settings", label: "系统设置与快捷键" },
      { id: "models", label: "本地模型管理" },
    ],
  },
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "completed",
    title: "批次 BATCH-20250412-088 已完成",
    description: "科技发布会数字人 4K 60FPS 渲染完成，5维综合得分 96.8分，已自动回写 S级 Seed。",
    timestamp: "10:05",
    read: false,
    targetTab: "batch-detail",
    targetId: "BATCH-20250412-088",
  },
  {
    id: "notif-2",
    type: "alarm",
    title: "显存峰值告警：达到 22.8 GB",
    description: "批次 086 在双关键帧扩散时触发 VRAM 阈值警示，已由智云·守护自动优化。",
    timestamp: "09:32",
    read: false,
    targetTab: "ops",
  },
  {
    id: "notif-3",
    type: "system",
    title: "看门狗自愈服务探活正常",
    description:
      "本地遥测聚合与 DiffSynth Worker 保持 1s 心跳探活，连续稳定运行 14 天（演示快照）。",
    timestamp: "08:00",
    read: true,
    targetTab: "ops",
  },
];

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
  const meta = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;
  const [isBreadcrumbOpen, setIsBreadcrumbOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<NotifTab>("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (breadcrumbRef.current && !breadcrumbRef.current.contains(e.target as Node)) {
        setIsBreadcrumbOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (activeNotifTab === "all") return true;
    return n.type === activeNotifTab;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onShowToast("info", "所有通知已标为已读");
  };

  return (
    <header className="h-14 px-4 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between select-none z-30 relative">
      {/* Left Breadcrumb with secondary jump dropdown */}
      <div className="flex items-center gap-2 text-xs relative" ref={breadcrumbRef}>
        <span className="text-[#8a97a8] font-medium">{meta.parent}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#8b949e]" />

        {/* Current Path with Dropdown */}
        <button
          onClick={() => setIsBreadcrumbOpen((p) => !p)}
          className="flex items-center gap-1 font-semibold text-[#00e0b8] hover:text-[#33e7c6] transition-colors p-1 rounded hover:bg-[#15294a] cursor-pointer"
        >
          <span>{meta.current}</span>
          <ChevronDown className="w-3 h-3 ml-0.5 text-[#8a97a8]" />
        </button>

        {/* Secondary jump menu dropdown */}
        {isBreadcrumbOpen && (
          <div className="absolute top-8 left-16 w-56 rounded-xl bg-[#0c1a30] border border-[#1e2f47] shadow-2xl p-1.5 space-y-1 z-40 animate-in fade-in zoom-in-95 backdrop-blur-md">
            <div className="text-[10px] uppercase font-semibold text-[#8b949e] px-2 py-1">
              同层级功能快捷直达
            </div>
            {meta.siblings.map((sib) => (
              <button
                key={sib.id}
                onClick={() => {
                  onNavigate(sib.id);
                  setIsBreadcrumbOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  sib.id === activeTab
                    ? "bg-[#00e0b8]/15 text-[#00e0b8] font-semibold"
                    : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
                }`}
              >
                <span>{sib.label}</span>
                {sib.id === activeTab && <Check className="w-3.5 h-3.5 text-[#00e0b8]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Middle Global Search Bar Trigger (Ctrl + K) */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full h-8 px-3 rounded-lg bg-[#15294a]/80 hover:bg-[#182f54] text-[#8a97a8] hover:text-[#e8f0f8] border border-[#1e2f47] hover:border-[#00e0b8]/40 flex items-center justify-between text-xs transition-all cursor-pointer group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#8a97a8] group-hover:text-[#00e0b8] transition-colors" />
            <span className="text-[#8b949e] group-hover:text-[#8a97a8]">
              全局搜索批次ID / 种子名称 / 文档 / 模型...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#8a97a8] bg-[#0a1628] rounded border border-[#1e2f47]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Quick Controls & Notifications */}
      <div className="flex items-center gap-3">
        {/* Hardware quick badge */}
        <div
          onClick={() => onNavigate("ops")}
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#15294a]/80 border border-[#1e2f47] text-[11px] font-mono cursor-pointer hover:border-[#00e0b8]/40 transition-colors"
          title="点击下钻系统运维大屏"
        >
          <HardDrive className="w-3.5 h-3.5 text-[#00e0b8]" />
          <span className="text-[#8a97a8]">VRAM</span>
          <span className="text-[#00e0b8] font-bold">19.4G</span>
          <span className="text-[#8b949e]">/ 24G</span>
        </div>

        {/* AI Assistant Quick Pill */}
        <button
          onClick={onOpenYYC3}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00e0b8]/10 hover:bg-[#00e0b8]/20 border border-[#00e0b8]/40 text-[#00e0b8] text-xs font-medium transition-all cursor-pointer shadow-[0_0_8px_rgba(0,224,184,0.15)] active:scale-95"
          title="打开 YYC³ AI Family 全局浮窗中心 (Ctrl+/)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00e0b8]" />
          <span>YYC³ AI</span>
        </button>

        {/* New batch button */}
        <button
          onClick={onNewBatchClick}
          className="h-8 px-3 rounded-[6px] bg-[#00e0b8] hover:bg-[#00c9a4] text-[#0a1628] text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,224,184,0.3)] transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>新建批次</span>
        </button>

        {/* Notifications Center with 3 Tabs Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationOpen((p) => !p)}
            className="relative p-2 rounded-lg bg-[#15294a] hover:bg-[#182f54] text-[#8a97a8] hover:text-[#e8f0f8] border border-[#1e2f47] transition-colors cursor-pointer"
            title="通知中心"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff7a45] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-11 w-84 sm:w-96 rounded-2xl bg-[#0c1a30] border border-[#1e2f47] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
              {/* Header */}
              <div className="p-3.5 border-b border-[#1e2f47] flex items-center justify-between bg-[#0f1f38]/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00e0b8]" />
                  <span className="font-semibold text-xs text-[#e8f0f8]">系统与生产通知</span>
                  {unreadCount > 0 && (
                    <Badge variant="brand" size="xs">
                      {unreadCount} 未读
                    </Badge>
                  )}
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#00e0b8] hover:underline cursor-pointer"
                >
                  全部标为已读
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="px-3 py-2 border-b border-[#1e2f47] bg-[#0c1a30] flex gap-1 text-xs">
                {NOTIF_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveNotifTab(t.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                      activeNotifTab === t.id
                        ? "bg-[#15294a] text-[#00e0b8] font-semibold border border-[#1e2f47]"
                        : "text-[#8a97a8] hover:text-[#e8f0f8]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#1e2f47]/50 text-xs">
                {filteredNotifs.length === 0 ? (
                  <div className="p-6 text-center text-[#8b949e] text-xs">暂无此类通知记录</div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.targetTab) onNavigate(n.targetTab, { batchId: n.targetId });
                        setIsNotificationOpen(false);
                      }}
                      className={`p-3.5 hover:bg-[#15294a]/50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !n.read ? "bg-[#00e0b8]/5" : ""
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === "alarm" ? (
                          <AlertTriangle className="w-4 h-4 text-[#ff7a45] flex-shrink-0" />
                        ) : n.type === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00e0b8] flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`font-semibold truncate ${
                              !n.read ? "text-[#e8f0f8]" : "text-[#8a97a8]"
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="font-mono text-[10px] text-[#8b949e] ml-2 flex-shrink-0">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8a97a8] leading-relaxed line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Profile Pill & Dropdown (Login System Integration) */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((p) => !p)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#15294a] hover:bg-[#182f54] border border-[#1e2f47] text-xs cursor-pointer transition-colors shadow-xs"
          >
            <div className="w-5 h-5 rounded-full bg-[#00e0b8]/20 border border-[#00e0b8] flex items-center justify-center text-[10px] text-[#00e0b8] font-bold">
              {currentUser?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-[#e8f0f8] font-medium hidden md:inline">
              {currentUser?.displayName || "本地超级管理员"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#8a97a8]" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-11 w-64 rounded-xl bg-[#0c1a30] border border-[#1e2f47] shadow-2xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md text-xs">
              <div className="pb-2 border-b border-[#1e2f47]">
                <div className="font-bold text-[#e8f0f8]">
                  {currentUser?.displayName || "本地超级管理员"}
                </div>
                <div className="text-[11px] font-mono text-[#00e0b8]">
                  @{currentUser?.username || "admin"} ·{" "}
                  {currentUser?.role === "admin" ? "超级管理员 (Full Access)" : "操作员"}
                </div>
                <div className="text-[10px] text-[#8b949e] font-mono mt-1">
                  设备: {currentUser?.device || "Workstation RTX 4090"}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#e8f0f8] hover:bg-[#15294a] hover:text-[#00e0b8] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="text-[#00e0b8]">⚿</span>
                  <span>切换账号 / 登录页面组件</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#ff7a45] hover:bg-[#ff7a45]/15 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>↪</span>
                  <span>安全退出登录</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
