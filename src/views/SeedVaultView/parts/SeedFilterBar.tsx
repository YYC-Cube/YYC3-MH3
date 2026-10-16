/**
 * file: src/views/SeedVaultView/parts/SeedFilterBar.tsx
 * description: YYC³ 视图分区 — SeedVaultView 筛选与视图模式栏（搜索 + 评级页签 + 网格/列表切换）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[filter],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的筛选与视图模式栏 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: SeedFilterBarProps, SeedFilterBar
 */
import { LayoutGrid, List, Search } from "lucide-react";
import React from "react";

export interface SeedFilterBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedTier: string;
  setSelectedTier: React.Dispatch<React.SetStateAction<string>>;
  viewMode: "grid" | "list";
  setViewMode: React.Dispatch<React.SetStateAction<"grid" | "list">>;
}

export const SeedFilterBar: React.FC<SeedFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTier,
  setSelectedTier,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="p-3 rounded-xl bg-[#0c1a30] border border-[#1e2f47] flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97a8]" />
          <input
            type="text"
            placeholder="搜索种子号、名称或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded bg-[#15294a] text-[#e8f0f8] placeholder-[#8b949e] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
          />
        </div>
      </div>

      {/* Tier filter tabs */}
      <div className="flex items-center gap-1 bg-[#15294a] p-0.5 rounded-lg border border-[#1e2f47]">
        {[
          { id: "all", label: "全部" },
          { id: "S", label: "S级 宗师基线" },
          { id: "A", label: "A级 优质" },
          { id: "Experimental", label: "实验变异" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTier(t.id)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              selectedTier === t.id
                ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                : "text-[#8a97a8] hover:text-[#e8f0f8]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 bg-[#15294a] p-0.5 rounded-lg border border-[#1e2f47]">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-1 rounded cursor-pointer ${
            viewMode === "grid" ? "bg-[#0a1628] text-[#00e0b8]" : "text-[#8a97a8]"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-1 rounded cursor-pointer ${
            viewMode === "list" ? "bg-[#0a1628] text-[#00e0b8]" : "text-[#8a97a8]"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
