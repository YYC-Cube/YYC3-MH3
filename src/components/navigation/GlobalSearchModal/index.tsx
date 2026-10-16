/**
 * file: src/components/navigation/GlobalSearchModal/index.tsx
 * description: YYC³ 导航组件 — GlobalSearchModal（全局搜索弹窗容器 · 状态装配 + 区块编排）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[container],[search],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: GlobalSearchModal 入口容器 —— props/状态装配与区块编排，
 *        大块 JSX 下沉至 ./parts（搜索输入栏 / 分类页签 / 结果容器 / 底部提示栏），
 *        状态与匹配派生由 ./useGlobalSearch 收敛，分类契约见 ./searchCategories。
 *
 * dependencies: react, ../../types, ./useGlobalSearch, ./parts/*, ./searchCategories
 * exports: GlobalSearchModalProps, GlobalSearchModal, SearchCategory
 */
import React from "react";
import { BatchItem, NavigateExtra, NavTabId, SeedItem } from "../../../types";
import { CategoryTabs } from "./parts/CategoryTabs";
import { SearchFooter } from "./parts/SearchFooter";
import { SearchInputBar } from "./parts/SearchInputBar";
import { SearchResults } from "./parts/SearchResults";
import { useGlobalSearch } from "./useGlobalSearch";

export type { SearchCategory } from "./searchCategories";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  batches: BatchItem[];
  seeds: SeedItem[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  batches,
  seeds,
}) => {
  const {
    query,
    setQuery,
    searchCategory,
    setSearchCategory,
    pageMatches,
    batchMatches,
    seedMatches,
    docMatches,
    modelMatches,
  } = useGlobalSearch({ isOpen, onClose, batches, seeds });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-[#071222]/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0a1628] border border-[#1e2f47] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <SearchInputBar query={query} onQueryChange={setQuery} onClose={onClose} />

        {/* Category Tabs */}
        <CategoryTabs searchCategory={searchCategory} onSelectCategory={setSearchCategory} />

        {/* Results Container */}
        <SearchResults
          searchCategory={searchCategory}
          pageMatches={pageMatches}
          batchMatches={batchMatches}
          seedMatches={seedMatches}
          docMatches={docMatches}
          modelMatches={modelMatches}
          onNavigate={onNavigate}
          onClose={onClose}
        />

        {/* Footer info */}
        <SearchFooter />
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
