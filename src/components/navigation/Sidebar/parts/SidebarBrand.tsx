/**
 * file: src/components/navigation/Sidebar/parts/SidebarBrand.tsx
 * description: YYC³ 导航分区 — Sidebar 品牌标头（Logo + 版本徽标 + 折叠切换按钮）
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
 * brief: 从 Sidebar 逐字提取的品牌标头 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: SidebarBrandProps, SidebarBrand
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export interface SidebarBrandProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <div className="h-14 px-3.5 border-b border-[#1e2f47] flex items-center justify-between">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-[#15294a] border border-[#00e0b8]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,224,184,0.3)] overflow-hidden">
          <img
            src="/yyc3-icons/logo.png"
            alt="YYC3 Logo"
            className="w-5 h-5 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-[#e8f0f8] tracking-wide truncate">
              MiniMax-H3 DiffSynth
            </span>
            <span className="text-[10px] text-[#00e0b8] font-mono tracking-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8] animate-pulse" />
              本地版 v2.1 PRO
            </span>
          </div>
        )}
      </div>

      {/* Toggle Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="p-1 rounded hover:bg-[#122340] text-[#8b949e] hover:text-[#e6edf3] transition-colors cursor-pointer"
        title={collapsed ? "展开侧边栏 (Ctrl+B)" : "收起侧边栏 (Ctrl+B)"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
