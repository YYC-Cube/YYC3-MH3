/**
 * file: src/components/navigation/GlobalSearchModal/parts/CategoryTabs.tsx
 * description: YYC³ 导航组件 — GlobalSearchModal 搜索分类页签
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
 * brief: GlobalSearchModal 搜索分类页签（全部/页面/批次/Seed/文档/模型），
 *        逐字搬移自原 GlobalSearchModal.tsx（Category Tabs）。
 *
 * dependencies: react, ../searchCategories
 * exports: CategoryTabsProps, CategoryTabs
 */
import React from "react";
import { SEARCH_CATEGORIES, SearchCategory } from "../searchCategories";

export interface CategoryTabsProps {
  searchCategory: SearchCategory;
  onSelectCategory: (category: SearchCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ searchCategory, onSelectCategory }) => {
  return (
    <div className="px-4 py-2 border-b border-[#1e2f47] bg-[#0c1a30]/60 flex gap-2 overflow-x-auto text-xs">
      {SEARCH_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
            searchCategory === cat.id
              ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
              : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
