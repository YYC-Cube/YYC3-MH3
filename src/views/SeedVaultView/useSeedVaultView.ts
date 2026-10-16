/**
 * file: src/views/SeedVaultView/useSeedVaultView.ts
 * description: YYC³ 视图状态 — SeedVaultView 种子库状态机（筛选/视图模式/多选对比/培育/详情抽屉）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[hook],[state],[seed],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: SeedVaultView 唯一状态真值源 —— 从原视图逐字提取的状态与事件编排，零重设计。
 *
 * dependencies: react, ../../types, ../../domains/production/seed
 * exports: ShowToastFn, SeedVaultState, UseSeedVaultViewOptions, useSeedVaultView
 */
import React, { useState } from "react";
import { generateSeedNumber } from "../../domains/production/seed";
import { NavigateExtra, NavTabId, SeedItem } from "../../types";

/** Toast 上报回调签名（容器与各分区共用） */
export type ShowToastFn = (
  type: "success" | "error" | "warning" | "info",
  msg: string,
  sub?: string,
) => void;

export interface UseSeedVaultViewOptions {
  seeds: SeedItem[];
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onApplySeedToWorkbench: (seed: SeedItem) => void;
  onShowToast: ShowToastFn;
}

/** SeedVaultView 状态与事件编排的完整装配面 */
export interface SeedVaultState {
  viewMode: "grid" | "list";
  setViewMode: React.Dispatch<React.SetStateAction<"grid" | "list">>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedTier: string;
  setSelectedTier: React.Dispatch<React.SetStateAction<string>>;
  selectedTag: string;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
  selectedSeed: SeedItem | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  compareSeedIds: string[];
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBreedingModalOpen: boolean;
  setIsBreedingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  breedingSeed: SeedItem | null;
  allTags: string[];
  filteredSeeds: SeedItem[];
  toggleCompareSeed: (id: string) => void;
  handleOpenDetail: (seed: SeedItem) => void;
  handleOpenBreeding: (seed: SeedItem) => void;
  handleApply: (seed: SeedItem) => void;
  handleGenerateSeed: () => void;
  handleLaunchBreeding: () => void;
}

export function useSeedVaultView({
  seeds,
  onNavigate,
  onApplySeedToWorkbench,
  onShowToast,
}: UseSeedVaultViewOptions): SeedVaultState {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedSeed, setSelectedSeed] = useState<SeedItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Multi-Seed Compare selection
  const [compareSeedIds, setCompareSeedIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Breeding modal
  const [isBreedingModalOpen, setIsBreedingModalOpen] = useState(false);
  const [breedingSeed, setBreedingSeed] = useState<SeedItem | null>(null);

  const allTags = [
    "高稳定性",
    "商务正装",
    "低抖动",
    "SyncNet 98%",
    "播音级口型",
    "自然微表情",
    "高饱和面容",
    "古风发簪物理",
  ];

  const filteredSeeds = seeds.filter((s) => {
    if (selectedTier !== "all" && s.tier !== selectedTier) return false;
    if (selectedTag !== "all" && !s.tags.includes(selectedTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        String(s.seedNumber).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleCompareSeed = (id: string) => {
    setCompareSeedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const handleOpenDetail = (seed: SeedItem) => {
    setSelectedSeed(seed);
    setIsDrawerOpen(true);
  };

  const handleOpenBreeding = (seed: SeedItem) => {
    setBreedingSeed(seed);
    setIsBreedingModalOpen(true);
  };

  const handleApply = (seed: SeedItem) => {
    onApplySeedToWorkbench(seed);
    onShowToast("success", `已应用种子 #${seed.seedNumber}`, "参数已无缝载入流水线工作台");
    onNavigate("workbench");
  };

  const handleGenerateSeed = () => {
    const newSeedNum = generateSeedNumber();
    onShowToast("success", "已生成探索型培育种子", `Seed #${newSeedNum} 已登记入库`);
  };

  const handleLaunchBreeding = () => {
    onShowToast(
      "success",
      `已基于 Seed #${breedingSeed?.seedNumber} 启动定向培育`,
      "已生成 6 组探索衍生变异批次",
    );
    setIsBreedingModalOpen(false);
  };

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedTier,
    setSelectedTier,
    selectedTag,
    setSelectedTag,
    selectedSeed,
    isDrawerOpen,
    setIsDrawerOpen,
    compareSeedIds,
    isCompareModalOpen,
    setIsCompareModalOpen,
    isBreedingModalOpen,
    setIsBreedingModalOpen,
    breedingSeed,
    allTags,
    filteredSeeds,
    toggleCompareSeed,
    handleOpenDetail,
    handleOpenBreeding,
    handleApply,
    handleGenerateSeed,
    handleLaunchBreeding,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
