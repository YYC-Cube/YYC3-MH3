/**
 * file: src/components/navigation/Topbar/useTopbar.ts
 * description: YYC³ 导航状态 — Topbar 下拉菜单状态机（面包屑/通知中心/账号菜单 + 点击外关）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[hook],[state],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Topbar 唯一状态真值源 —— 从原组件逐字提取的状态与事件编排，零重设计。
 *
 * dependencies: react, ../../../types
 * exports: NotifTab, ShowToastFn, TopbarState, UseTopbarOptions, useTopbar
 */
import React, { useEffect, useRef, useState } from "react";
import { NotificationItem } from "../../../types";

/** 通知中心分类页签 */
export type NotifTab = "all" | "alarm" | "completed" | "system";

/** Toast 上报回调签名（容器与各分区共用） */
export type ShowToastFn = (
  type: "success" | "error" | "warning" | "info",
  msg: string,
  sub?: string,
) => void;

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

export interface UseTopbarOptions {
  onShowToast: ShowToastFn;
}

/** Topbar 状态与事件编排的完整装配面 */
export interface TopbarState {
  isBreadcrumbOpen: boolean;
  setIsBreadcrumbOpen: React.Dispatch<React.SetStateAction<boolean>>;
  breadcrumbRef: React.RefObject<HTMLDivElement | null>;
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notifRef: React.RefObject<HTMLDivElement | null>;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  activeNotifTab: NotifTab;
  setActiveNotifTab: React.Dispatch<React.SetStateAction<NotifTab>>;
  filteredNotifs: NotificationItem[];
  unreadCount: number;
  handleMarkAllRead: () => void;
}

export function useTopbar({ onShowToast }: UseTopbarOptions): TopbarState {
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

  return {
    isBreadcrumbOpen,
    setIsBreadcrumbOpen,
    breadcrumbRef,
    isNotificationOpen,
    setIsNotificationOpen,
    notifRef,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userMenuRef,
    activeNotifTab,
    setActiveNotifTab,
    filteredNotifs,
    unreadCount,
    handleMarkAllRead,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
