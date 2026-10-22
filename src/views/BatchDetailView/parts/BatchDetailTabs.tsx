/**
 * file: src/views/BatchDetailView/parts/BatchDetailTabs.tsx
 * description: YYC³ 功能视图 — BatchDetailView 五页签菜单（产物/对比/变异/异常/时间轴）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[tabs],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 内容页签菜单（激活态下划线高亮），
 *        逐字搬移自原 BatchDetailView.tsx（Requirement 2.1）。
 *
 * dependencies: react, ../useBatchDetailView
 * exports: BatchDetailTabsProps, BatchDetailTabs
 */
import React from "react";
import { BATCH_DETAIL_TABS, BatchDetailTab } from "../useBatchDetailView";

export interface BatchDetailTabsProps {
  activeTab: BatchDetailTab;
  onSelectTab: (tab: BatchDetailTab) => void;
}

export const BatchDetailTabs: React.FC<BatchDetailTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="border-b border-[#1e2f47]">
      <div className="flex gap-6 text-xs">
        {BATCH_DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
              activeTab === tab.id ? "text-[#00e0b8] font-semibold" : "text-[#8a97a8] hover:text-[#e8f0f8]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00e0b8]" />}
          </button>
        ))}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
