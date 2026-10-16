/**
 * file: src/views/SeedVaultView/index.tsx
 * description: YYC³ 功能视图 — SeedVaultView 入口容器（状态装配 + 布局编排，分区下沉 parts）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[seed],[container],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: SeedVaultView 容器 —— 装配 useSeedVaultView 状态并编排标签面板 / 标题区 / 筛选栏 / 网格·列表 / 三个弹层。
 *
 * dependencies: react, ../../types, ./useSeedVaultView, ./parts/*
 * exports: SeedVaultViewProps, SeedVaultView
 */
import React from "react";
import { NavigateExtra, NavTabId, SeedItem } from "../../types";
import { SeedBreedingModal } from "./parts/SeedBreedingModal";
import { SeedCompareModal } from "./parts/SeedCompareModal";
import { SeedDetailDrawer } from "./parts/SeedDetailDrawer";
import { SeedFilterBar } from "./parts/SeedFilterBar";
import { SeedGrid } from "./parts/SeedGrid";
import { SeedList } from "./parts/SeedList";
import { SeedTagPanel } from "./parts/SeedTagPanel";
import { SeedVaultHeader } from "./parts/SeedVaultHeader";
import { useSeedVaultView } from "./useSeedVaultView";
import type { ShowToastFn } from "./useSeedVaultView";

export interface SeedVaultViewProps {
  seeds: SeedItem[];
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onApplySeedToWorkbench: (seed: SeedItem) => void;
  onShowToast: ShowToastFn;
}

export const SeedVaultView: React.FC<SeedVaultViewProps> = ({
  seeds,
  onNavigate,
  onApplySeedToWorkbench,
  onShowToast,
}) => {
  const state = useSeedVaultView({ seeds, onNavigate, onApplySeedToWorkbench, onShowToast });

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a1628]">
      {/* Left Tag Management Panel (Requirement 2.1) */}
      <SeedTagPanel
        seeds={seeds}
        allTags={state.allTags}
        selectedTag={state.selectedTag}
        setSelectedTag={state.setSelectedTag}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Header */}
        <SeedVaultHeader
          compareCount={state.compareSeedIds.length}
          onOpenCompare={() => state.setIsCompareModalOpen(true)}
          onGenerateSeed={state.handleGenerateSeed}
        />

        {/* Filter and View Mode Bar */}
        <SeedFilterBar
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
          selectedTier={state.selectedTier}
          setSelectedTier={state.setSelectedTier}
          viewMode={state.viewMode}
          setViewMode={state.setViewMode}
        />

        {/* Grid View / List View */}
        {state.viewMode === "grid" ? <SeedGrid state={state} /> : <SeedList state={state} />}
      </div>

      {/* Multi-Seed Batch Compare Modal (Requirement 2.1) */}
      <SeedCompareModal
        seeds={seeds}
        compareSeedIds={state.compareSeedIds}
        isCompareModalOpen={state.isCompareModalOpen}
        setIsCompareModalOpen={state.setIsCompareModalOpen}
      />

      {/* Breeding Optimization Configurator Modal */}
      {state.breedingSeed && (
        <SeedBreedingModal
          breedingSeed={state.breedingSeed}
          isBreedingModalOpen={state.isBreedingModalOpen}
          setIsBreedingModalOpen={state.setIsBreedingModalOpen}
          handleLaunchBreeding={state.handleLaunchBreeding}
        />
      )}

      {/* Detail Drawer with Version History & Rollback */}
      {state.selectedSeed && (
        <SeedDetailDrawer
          selectedSeed={state.selectedSeed}
          isDrawerOpen={state.isDrawerOpen}
          setIsDrawerOpen={state.setIsDrawerOpen}
          handleApply={state.handleApply}
        />
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
