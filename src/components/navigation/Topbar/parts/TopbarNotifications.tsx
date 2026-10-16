/**
 * file: src/components/navigation/Topbar/parts/TopbarNotifications.tsx
 * description: YYC³ 导航分区 — Topbar 通知中心铃铛 + 分类页签下拉面板
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[notification],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Topbar 逐字提取的通知中心下拉 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../common, ../../../../types, ../useTopbar
 * exports: TopbarNotificationsProps, TopbarNotifications
 */
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import React from "react";
import { Badge } from "../../../common";
import { NavigateExtra, NavTabId, NotificationItem } from "../../../../types";
import type { NotifTab } from "../useTopbar";

const NOTIF_TABS: { id: NotifTab; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "alarm", label: "告警预警" },
  { id: "completed", label: "批次完成" },
  { id: "system", label: "系统自愈" },
];

export interface TopbarNotificationsProps {
  notifRef: React.RefObject<HTMLDivElement | null>;
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  unreadCount: number;
  activeNotifTab: NotifTab;
  setActiveNotifTab: React.Dispatch<React.SetStateAction<NotifTab>>;
  filteredNotifs: NotificationItem[];
  handleMarkAllRead: () => void;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
}

export const TopbarNotifications: React.FC<TopbarNotificationsProps> = ({
  notifRef,
  isNotificationOpen,
  setIsNotificationOpen,
  unreadCount,
  activeNotifTab,
  setActiveNotifTab,
  filteredNotifs,
  handleMarkAllRead,
  onNavigate,
}) => {
  return (
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
