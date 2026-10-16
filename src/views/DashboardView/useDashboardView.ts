/**
 * file: src/views/DashboardView/useDashboardView.ts
 * description: YYC³ 功能视图 — DashboardView 状态收敛 hook（大屏模式 / 检索筛选 / 硬件时序弹窗）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [hook],[view],[dashboard],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 局部状态单一真值源 ——
 *   - 大屏投屏模式开关（含 toast 反馈，交互语义与解构前逐字一致）
 *   - 批次检索关键字 + 状态过滤派生的 filteredBatches
 *   - 硬件 24H 时序监控弹窗开关
 *   纯状态装配，不渲染 UI。
 *
 * dependencies: react, ../../types
 * exports: UseDashboardViewOptions, UseDashboardViewResult, useDashboardView
 */
import { useState } from "react";
import { BatchItem } from "../../types";

export interface UseDashboardViewOptions {
  batches: BatchItem[];
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export interface UseDashboardViewResult {
  isBigScreenMode: boolean;
  toggleBigScreenMode: () => void;
  trendPeriod: "weekly" | "monthly";
  filterQuery: string;
  setFilterQuery: (query: string) => void;
  filteredBatches: BatchItem[];
  isHwModalOpen: boolean;
  setIsHwModalOpen: (open: boolean) => void;
}

export function useDashboardView({
  batches,
  onShowToast,
}: UseDashboardViewOptions): UseDashboardViewResult {
  const [isBigScreenMode, setIsBigScreenMode] = useState(false);
  const [trendPeriod] = useState<"weekly" | "monthly">("weekly");
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter] = useState<string>("all");
  const [isHwModalOpen, setIsHwModalOpen] = useState(false);

  const filteredBatches = batches.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return b.id.toLowerCase().includes(q) || b.name.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleBigScreenMode = () => {
    const next = !isBigScreenMode;
    setIsBigScreenMode(next);
    onShowToast("info", next ? "已切换至 2K/4K 生产大屏模式" : "已退出大屏投屏模式");
  };

  return {
    isBigScreenMode,
    toggleBigScreenMode,
    trendPeriod,
    filterQuery,
    setFilterQuery,
    filteredBatches,
    isHwModalOpen,
    setIsHwModalOpen,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
