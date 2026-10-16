/**
 * file: src/views/DashboardView/index.tsx
 * description: YYC³ 功能视图 — DashboardView（总览驾驶舱容器 · 状态装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[container],[dashboard],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 入口容器 —— 仅做 props/状态装配与布局编排，
 *        大块 JSX 下沉至 ./parts（顶部栏 / 告警横幅 / KPI 卡 / 闭环流转 / 硬件仪表 / 批次表 / 时序弹窗），
 *        状态由 ./useDashboardView 收敛（大屏模式 / 检索筛选 / 弹窗开关）。
 *
 * dependencies: react, ../../types, ./useDashboardView, ./parts/*
 * exports: DashboardViewProps, DashboardView
 */
import React from "react";
import { BatchItem, NavigateExtra, NavTabId } from "../../types";
import { useDashboardView } from "./useDashboardView";
import { AlarmBanner } from "./parts/AlarmBanner";
import { DashboardHeader } from "./parts/DashboardHeader";
import { HardwareGauges } from "./parts/HardwareGauges";
import { HardwareTimelineModal } from "./parts/HardwareTimelineModal";
import { KpiCards } from "./parts/KpiCards";
import { PipelineFlow } from "./parts/PipelineFlow";
import { RecentBatchesTable } from "./parts/RecentBatchesTable";

export interface DashboardViewProps {
  batches: BatchItem[];
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onNewBatchClick: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  onNavigate,
  onNewBatchClick,
  onShowToast,
}) => {
  const {
    isBigScreenMode,
    toggleBigScreenMode,
    trendPeriod,
    filterQuery,
    setFilterQuery,
    filteredBatches,
    isHwModalOpen,
    setIsHwModalOpen,
  } = useDashboardView({ batches, onShowToast });

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628] transition-all duration-300 ${
        isBigScreenMode ? "max-w-none p-8" : ""
      }`}
    >
      {/* Top Welcome & Big Screen Mode Toggle (Requirement 2.1) */}
      <DashboardHeader
        isBigScreenMode={isBigScreenMode}
        onToggleBigScreenMode={toggleBigScreenMode}
        onShowToast={onShowToast}
        onNavigate={onNavigate}
      />

      {/* Global Alarm Aggregation Banner with Pulsing Border */}
      <AlarmBanner onNavigate={onNavigate} />

      {/* Row 1: 4 KPI Cards with Glowing Micro-Numbers & Gradient Area Charts */}
      <KpiCards trendPeriod={trendPeriod} />

      {/* Row 2: 5-Node Closed-Loop Flow & Hardware Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <PipelineFlow onNavigate={onNavigate} />
        <HardwareGauges onNavigate={onNavigate} onOpenModal={() => setIsHwModalOpen(true)} />
      </div>

      {/* Row 3: Recent Batches Table with Search & Status Filters */}
      <RecentBatchesTable
        batches={filteredBatches}
        filterQuery={filterQuery}
        onFilterQueryChange={setFilterQuery}
        onNavigate={onNavigate}
        onNewBatchClick={onNewBatchClick}
        onShowToast={onShowToast}
      />

      {/* 24-Hour Detailed Curve Modal */}
      <HardwareTimelineModal isOpen={isHwModalOpen} onClose={() => setIsHwModalOpen(false)} />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
