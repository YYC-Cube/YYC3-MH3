/**
 * file: src/components/navigation/Topbar/parts/TopbarQuickActions.tsx
 * description: YYC³ 导航分区 — Topbar 右侧快捷动作组（硬件徽标下钻 + YYC³ AI 浮窗 + 新建批次）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[actions],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Topbar 逐字提取的快捷动作组 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../types
 * exports: TopbarQuickActionsProps, TopbarQuickActions
 */
import { HardDrive, Plus, Sparkles } from "lucide-react";
import React from "react";
import { NavTabId } from "../../../../types";

export interface TopbarQuickActionsProps {
  onNavigate: (tab: NavTabId) => void;
  onOpenYYC3: () => void;
  onNewBatchClick: () => void;
}

export const TopbarQuickActions: React.FC<TopbarQuickActionsProps> = ({ onNavigate, onOpenYYC3, onNewBatchClick }) => {
  return (
    <>
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
    </>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
