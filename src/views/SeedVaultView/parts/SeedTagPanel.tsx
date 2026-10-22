/**
 * file: src/views/SeedVaultView/parts/SeedTagPanel.tsx
 * description: YYC³ 视图分区 — SeedVaultView 左侧标签体系分组面板
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[tag],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的标签分组面板 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../types
 * exports: SeedTagPanelProps, SeedTagPanel
 */
import { Tag } from "lucide-react";
import React from "react";
import { SeedItem } from "../../../types";

export interface SeedTagPanelProps {
  seeds: SeedItem[];
  allTags: string[];
  selectedTag: string;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
}

export const SeedTagPanel: React.FC<SeedTagPanelProps> = ({ seeds, allTags, selectedTag, setSelectedTag }) => {
  return (
    <div className="w-56 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0 p-3 space-y-3 select-none">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1e2f47]">
        <Tag className="w-4 h-4 text-[#00e0b8]" />
        <span className="text-xs font-semibold text-[#e8f0f8]">标签体系分组</span>
      </div>

      <div className="space-y-1 text-xs">
        <button
          onClick={() => setSelectedTag("all")}
          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
            selectedTag === "all"
              ? "bg-[#00e0b8]/15 text-[#00e0b8] font-semibold"
              : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
          }`}
        >
          <span>全部标签</span>
          <span className="font-mono text-[10px] text-[#8b949e]">{seeds.length}</span>
        </button>

        {allTags.map((tag) => {
          const count = seeds.filter((s) => s.tags.includes(tag)).length;
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-[#00e0b8]/15 text-[#00e0b8] font-semibold"
                  : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
              }`}
            >
              <span className="truncate">{tag}</span>
              <span className="font-mono text-[10px] text-[#8b949e]">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
