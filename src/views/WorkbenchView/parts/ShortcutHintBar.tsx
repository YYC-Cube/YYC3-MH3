/**
 * file: src/views/WorkbenchView/parts/ShortcutHintBar.tsx
 * description: YYC³ 功能视图 — WorkbenchView 底部悬浮快捷键提示条
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 底部悬浮快捷键提示（Space / Ctrl+Enter / Ctrl+S / Ctrl+/），
 *        逐字搬移自原 WorkbenchView.tsx（Requirement 2.1）。
 *
 * dependencies: react
 * exports: ShortcutHintBar
 */
import React from "react";

export const ShortcutHintBar: React.FC = () => {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#0c1a30]/90 border border-[#1e2f47] shadow-xl backdrop-blur-md flex items-center gap-4 text-[11px] text-[#8a97a8] pointer-events-none select-none z-20">
      <span className="flex items-center gap-1.5">
        <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">Space</kbd>
        <span>播放/暂停</span>
      </span>
      <span className="text-[#1e2f47]">|</span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">Ctrl+Enter</kbd>
        <span>启动生成</span>
      </span>
      <span className="text-[#1e2f47]">|</span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">Ctrl+S</kbd>
        <span>保存模板</span>
      </span>
      <span className="text-[#1e2f47]">|</span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">Ctrl+/</kbd>
        <span>YYC³ AI协同</span>
      </span>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
