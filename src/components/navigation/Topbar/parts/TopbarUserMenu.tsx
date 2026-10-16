/**
 * file: src/components/navigation/Topbar/parts/TopbarUserMenu.tsx
 * description: YYC³ 导航分区 — Topbar 账号概览胶囊 + 账号菜单下拉（切换账号 / 安全退出）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[user],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Topbar 逐字提取的账号菜单 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../../types
 * exports: TopbarUserMenuProps, TopbarUserMenu
 */
import { ChevronDown } from "lucide-react";
import React from "react";
import { AuthUser } from "../../../../types";

export interface TopbarUserMenuProps {
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser?: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const TopbarUserMenu: React.FC<TopbarUserMenuProps> = ({
  userMenuRef,
  isUserMenuOpen,
  setIsUserMenuOpen,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  return (
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
