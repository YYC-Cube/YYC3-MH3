/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/FamilyModalHeader.tsx
 * description: YYC³ AI Family 协同组件 — 浮窗顶栏（品牌 + 统计 Pill + 窗口控制）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[header],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI Family 浮窗顶栏 — 品牌标识、在线/活跃/运行率统计胶囊与全屏/关闭控制
 *
 * dependencies: react, lucide-react
 * exports: FamilyModalHeader, FamilyModalHeaderProps
 */
import { Clock, Maximize2, Minimize2, X, Zap } from "lucide-react";
import type React from "react";

export interface FamilyModalHeaderProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

export const FamilyModalHeader: React.FC<FamilyModalHeaderProps> = ({ isFullscreen, onToggleFullscreen, onClose }) => {
  return (
    <div className="h-14 px-6 border-b border-[#1e2f47] bg-[#0c1a30]/90 flex items-center justify-between select-none z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0c2440] to-[#0a1b2f] border border-[#00e0b8]/40 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(0,224,184,0.4)]">
          <img src="/yyc3-icons/yyc3-logo.png" alt="YYC³ AI Family" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#e8f0f8] tracking-wide">YYC³ AI Family</span>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono">
              智能协同生产系统
            </span>
          </div>
          <p className="text-[10px] text-[#8a97a8]">全局智能协同生产中心 · 8位核心业务 Agent</p>
        </div>
      </div>

      {/* Top-Right Stats Pills from attachment */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#15294a]/80 border border-[#1e2f47] text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e0b8]" />
          </span>
          <span className="text-[#8a97a8]">在线</span>
          <span className="font-mono font-bold text-[#00e0b8]">7/8</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#15294a]/80 border border-[#1e2f47] text-xs">
          <Zap className="w-3.5 h-3.5 text-[#ffb830]" />
          <span className="text-[#8a97a8]">活跃任务</span>
          <span className="font-mono font-bold text-[#e8f0f8]">142</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#15294a]/80 border border-[#1e2f47] text-xs">
          <Clock className="w-3.5 h-3.5 text-[#00b4d8]" />
          <span className="text-[#8a97a8]">运行率</span>
          <span className="font-mono font-bold text-[#00b4d8]">99.8%</span>
        </div>

        {/* Window control buttons */}
        <div className="flex items-center gap-1.5 ml-2 border-l border-[#1e2f47] pl-3">
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a] transition-colors cursor-pointer"
            title={isFullscreen ? "还原窗口" : "全屏展示"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a] transition-colors cursor-pointer"
            title="关闭浮窗 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
