/**
 * file: src/components/navigation/GlobalSearchModal/parts/SearchInputBar.tsx
 * description: YYC³ 导航组件 — GlobalSearchModal 搜索输入栏（含关闭按钮）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[search],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: GlobalSearchModal 顶部搜索输入栏（自动聚焦 + 关闭按钮），
 *        逐字搬移自原 GlobalSearchModal.tsx（Search Input Bar）。
 *
 * dependencies: react, lucide-react
 * exports: SearchInputBarProps, SearchInputBar
 */
import { Search, X } from "lucide-react";
import React from "react";

export interface SearchInputBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

export const SearchInputBar: React.FC<SearchInputBarProps> = ({ query, onQueryChange, onClose }) => {
  return (
    <div className="p-3.5 border-b border-[#1e2f47] flex items-center gap-3 bg-[#0c1a30]">
      <Search className="w-5 h-5 text-[#00e0b8] flex-shrink-0" />
      <input
        type="text"
        autoFocus
        placeholder="搜索功能页面、批次编号、Seed 种子、文档、模型..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full bg-transparent text-sm text-[#e8f0f8] placeholder-[#8b949e] focus:outline-none"
      />
      <button
        onClick={onClose}
        className="p-1 rounded text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
