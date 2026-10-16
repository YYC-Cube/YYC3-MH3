/**
 * file: src/views/LoginView/parts/LoginBrandHeader.tsx
 * description: YYC³ 视图分区 — LoginView 品牌标头（Logo + 版本徽标 + 品牌口号）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的品牌标头 JSX（零重设计）。
 *
 * dependencies: react
 * exports: LoginBrandHeader
 */
import React from "react";

export const LoginBrandHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-6 space-y-2">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c2440] via-[#0f2d4e] to-[#0a1b2f] border-2 border-[#00e0b8] flex items-center justify-center p-2.5 shadow-[0_0_24px_rgba(0,224,184,0.35)] animate-in zoom-in-95 duration-300">
          <img
            src="/yyc3-icons/logo.png"
            alt="YYC3 Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e0b8] border-2 border-[#0a1628]" />
        </span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[#e8f0f8] tracking-tight flex items-center justify-center gap-2">
          <span>MiniMax-H3 DiffSynth</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono">
            本地版 v2.1 PRO
          </span>
        </h1>
        <p className="text-xs text-[#00e0b8] font-mono tracking-widest mt-1">言启象限 · 语枢未来</p>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
