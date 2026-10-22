/**
 * file: src/components/navigation/Topbar/parts/TopbarSearch.tsx
 * description: YYC³ 导航分区 — Topbar 中部全局搜索触发条（Ctrl + K）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[search],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Topbar 逐字提取的全局搜索触发条 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: TopbarSearchProps, TopbarSearch
 */
import { Search } from "lucide-react";
import React from "react";

export interface TopbarSearchProps {
  onOpenSearch: () => void;
}

export const TopbarSearch: React.FC<TopbarSearchProps> = ({ onOpenSearch }) => {
  return (
    <div className="flex-1 max-w-md mx-6 hidden md:block">
      <button
        onClick={onOpenSearch}
        className="w-full h-8 px-3 rounded-lg bg-[#15294a]/80 hover:bg-[#182f54] text-[#8a97a8] hover:text-[#e8f0f8] border border-[#1e2f47] hover:border-[#00e0b8]/40 flex items-center justify-between text-xs transition-all cursor-pointer group shadow-inner"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#8a97a8] group-hover:text-[#00e0b8] transition-colors" />
          <span className="text-[#8b949e] group-hover:text-[#8a97a8]">全局搜索批次ID / 种子名称 / 文档 / 模型...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#8a97a8] bg-[#0a1628] rounded border border-[#1e2f47]">
          Ctrl K
        </kbd>
      </button>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
