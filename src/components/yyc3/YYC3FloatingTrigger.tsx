/**
 * file: src/components/yyc3/YYC3FloatingTrigger.tsx
 * description: YYC³ AI Family 协同组件 — YYC3FloatingTrigger
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[ai-family],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ AI Family 协同组件 — YYC3FloatingTrigger
 *
 * dependencies: react, lucide-react
 * exports: YYC3FloatingTriggerProps, YYC3FloatingTrigger
 */
import { Sparkles } from "lucide-react";
import React from "react";

export interface YYC3FloatingTriggerProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export const YYC3FloatingTrigger: React.FC<YYC3FloatingTriggerProps> = ({
  onClick,
  hasUnread = true,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center group select-none">
      {/* Tooltip on hover */}
      <div className="mr-3 px-3 py-1.5 rounded-lg bg-[#0c1a30] border border-[#00e0b8]/40 shadow-xl text-xs text-[#e8f0f8] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 whitespace-nowrap backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#00e0b8]">YYC³ AI Family</span>
          <span className="text-[#8a97a8]">全局协同</span>
          <kbd className="px-1.5 py-0.2 rounded bg-[#15294a] text-[10px] font-mono text-[#00e0b8] border border-[#1e2f47]">
            Ctrl + /
          </kbd>
        </div>
      </div>

      {/* Main Floating Button matching screenshot */}
      <button
        onClick={onClick}
        className="relative w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0c2440] via-[#0f2d4e] to-[#0a1b2f] border-2 border-[#00e0b8] flex items-center justify-center text-[#00e0b8] shadow-[0_0_24px_rgba(0,224,184,0.45)] hover:shadow-[0_0_36px_rgba(0,224,184,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-visible"
        aria-label="唤起 YYC³ AI Family 协同中心"
      >
        {/* Breathing halo ring */}
        <div className="absolute -inset-1 rounded-2xl border border-[#00e0b8]/40 animate-ping opacity-25 pointer-events-none" />

        {/* YYC³ Brand Logo（多端统一标识 /yyc3-icons） */}
        <div className="relative flex items-center justify-center">
          <img
            src="/yyc3-icons/yyc3-logo.png"
            alt="YYC³ AI Family"
            className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,224,184,0.5)]"
          />
          <Sparkles className="w-3.5 h-3.5 text-[#e8f0f8] absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Corner '?' symbol badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#15294a] border border-[#00e0b8] text-[10px] font-bold text-[#00e0b8] flex items-center justify-center shadow-md">
          ?
        </div>

        {/* Live Speaking/Active Indicator */}
        {hasUnread && (
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e0b8] border-2 border-[#0a1628]" />
          </span>
        )}
      </button>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
