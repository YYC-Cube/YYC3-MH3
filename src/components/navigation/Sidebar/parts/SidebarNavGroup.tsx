/**
 * file: src/components/navigation/Sidebar/parts/SidebarNavGroup.tsx
 * description: YYC³ 导航分区 — Sidebar 单个导航分组（分组标题 + 导航项激活态渲染）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[sidebar],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Sidebar 逐字提取的导航分组 JSX（零重设计）。
 *
 * dependencies: react, ../../../../types, ./navItems
 * exports: SidebarNavGroupProps, SidebarNavGroup
 */
import React from "react";
import type { NavTabId } from "../../../../types";
import type { NavItemDef } from "./navItems";

export interface SidebarNavGroupProps {
  title: string;
  items: NavItemDef[];
  collapsed: boolean;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  title,
  items,
  collapsed,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-2 text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider mb-1">{title}</div>
      )}
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group relative ${
              isActive
                ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/40 shadow-[0_0_12px_rgba(0,212,170,0.15)] font-semibold"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#122340]"
            }`}
            title={collapsed ? item.label : undefined}
          >
            {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00d4aa] rounded-r" />}
            <span className={`${isActive ? "text-[#00d4aa]" : "group-hover:text-[#e6edf3]"}`}>{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span
                className={`ml-auto text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive
                    ? "bg-[#00d4aa] text-[#071425] font-bold"
                    : "bg-[#122340] text-[#8b949e] border border-[#30363d]"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
