/**
 * file: src/views/ModelsView/parts/ModelTabs.tsx
 * description: YYC³ 视图分区 — ModelsView 模型仓库分区页签
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[models],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 ModelsView 逐字提取的分区页签 JSX（零重设计）。
 *
 * dependencies: react, ../index
 * exports: ModelTabsProps, ModelTabs
 */
import React from "react";
import type { ModelTab } from "../index";

/** 模型仓库分区页签元数据 */
const MODEL_TABS: { id: ModelTab; label: string }[] = [
  { id: "models", label: "模型权重清单 (4项)" },
  { id: "env", label: "计算依赖环境检测" },
  { id: "disk", label: "本地 NVMe 磁盘分配" },
  { id: "benchmarks", label: "性能基准多维对比" },
];

export interface ModelTabsProps {
  activeTab: ModelTab;
  onSelectTab: (tab: ModelTab) => void;
}

export const ModelTabs: React.FC<ModelTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="border-b border-[#1e2f47] flex gap-6 text-xs">
      {MODEL_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
            activeTab === tab.id
              ? "text-[#00e0b8] font-semibold"
              : "text-[#8a97a8] hover:text-[#e8f0f8]"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00e0b8]" />
          )}
        </button>
      ))}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
