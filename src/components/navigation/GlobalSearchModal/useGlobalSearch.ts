/**
 * file: src/components/navigation/GlobalSearchModal/useGlobalSearch.ts
 * description: YYC³ 导航组件 — GlobalSearchModal 搜索状态与匹配派生 hook
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [hook],[navigation],[search],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: GlobalSearchModal 状态单一真值源 ——
 *   - 检索关键字与分类筛选状态
 *   - Ctrl/Cmd+K 与 Esc 全局快捷键监听（依赖 isOpen/onClose）
 *   - 由关键字派生的五类匹配集合（页面/批次/Seed/文档/模型）
 *
 * dependencies: react, ../../../data/content, ../../../types, ./searchCategories
 * exports: SearchPageMatch, SearchModelMatch, DocGuide, UseGlobalSearchOptions, UseGlobalSearchResult, useGlobalSearch
 */
import { useEffect, useState } from "react";
import { DOC_GUIDES } from "../../../data/content";
import { BatchItem, NavTabId, SeedItem } from "../../../types";
import { SearchCategory } from "./searchCategories";

/** 功能页面匹配项 */
export interface SearchPageMatch {
  tab: NavTabId;
  title: string;
  category: string;
}

/** 模型权重匹配项 */
export interface SearchModelMatch {
  name: string;
  size: string;
  vram: string;
}

/** 文档指南条目（沿用 DOC_GUIDES 快照元素类型） */
export type DocGuide = (typeof DOC_GUIDES)[number];

export interface UseGlobalSearchOptions {
  isOpen: boolean;
  onClose: () => void;
  batches: BatchItem[];
  seeds: SeedItem[];
}

export interface UseGlobalSearchResult {
  query: string;
  setQuery: (query: string) => void;
  searchCategory: SearchCategory;
  setSearchCategory: (category: SearchCategory) => void;
  pageMatches: SearchPageMatch[];
  batchMatches: BatchItem[];
  seedMatches: SeedItem[];
  docMatches: DocGuide[];
  modelMatches: SearchModelMatch[];
}

export function useGlobalSearch({
  isOpen,
  onClose,
  batches,
  seeds,
}: UseGlobalSearchOptions): UseGlobalSearchResult {
  const [query, setQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<SearchCategory>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  // Search results
  const pageMatches = [
    {
      tab: "design-system" as NavTabId,
      title: "设计规范与组件库 (DS Tokens)",
      category: "规范体系",
    },
    {
      tab: "dashboard" as NavTabId,
      title: "总览驾驶舱 Dashboard",
      category: "核心功能",
    },
    {
      tab: "workbench" as NavTabId,
      title: "五步闭环流水线工作台",
      category: "核心功能",
    },
    {
      tab: "batch-detail" as NavTabId,
      title: "批次详情与复盘分析",
      category: "核心功能",
    },
    {
      tab: "seed" as NavTabId,
      title: "Seed 种子库全生命周期",
      category: "核心功能",
    },
    {
      tab: "prompt" as NavTabId,
      title: "提示词工程中心",
      category: "核心功能",
    },
    {
      tab: "models" as NavTabId,
      title: "模型与计算资源管理",
      category: "扩展",
    },
    {
      tab: "agent" as NavTabId,
      title: "多 Agent 漫剧工作流编排",
      category: "扩展",
    },
    {
      tab: "platform" as NavTabId,
      title: "平台管理中心 (调度/媒体/分析/配置)",
      category: "平台核心",
    },
    { tab: "ops" as NavTabId, title: "系统运维监控与告警", category: "系统" },
    {
      tab: "nightly" as NavTabId,
      title: "夜间批处理控制台",
      category: "系统",
    },
    {
      tab: "docs" as NavTabId,
      title: "内置文档中心 (22篇指南)",
      category: "帮助",
    },
    {
      tab: "settings" as NavTabId,
      title: "系统设置与硬件限制",
      category: "系统",
    },
  ].filter((p) => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

  const batchMatches = batches.filter(
    (b) =>
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)),
  );

  const seedMatches = seeds.filter(
    (s) =>
      !q ||
      String(s.seedNumber).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)),
  );

  const docMatches = DOC_GUIDES.filter((d) => !q || d.title.toLowerCase().includes(q));

  const modelMatches = [
    { name: "DiffSynth-MiniMax-H3-v2.1-HQ", size: "14.8 GB", vram: "8.2 GB" },
    { name: "DiffSynth-MiniMax-H3-v2.0-Fast", size: "9.2 GB", vram: "5.4 GB" },
    { name: "SyncNet-v3-MultiLingual", size: "1.8 GB", vram: "1.2 GB" },
  ].filter((m) => !q || m.name.toLowerCase().includes(q));

  return {
    query,
    setQuery,
    searchCategory,
    setSearchCategory,
    pageMatches,
    batchMatches,
    seedMatches,
    docMatches,
    modelMatches,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
