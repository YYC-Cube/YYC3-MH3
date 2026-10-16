/**
 * file: src/views/BatchDetailView/index.tsx
 * description: YYC³ 功能视图 — BatchDetailView（批次详情与复盘容器 · 状态装配 + 页签编排）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[container],[batch-detail],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 入口容器 —— props/状态装配与页签编排，
 *        大块 JSX 下沉至 ./parts（头栏 / 规格卡 / 页签 / 产物矩阵 / 基准对比 / 变异发射 / 异常标注 / 时间轴 / 放大弹窗），
 *        状态由 ./useBatchDetailView 收敛（页签 / 导出 / 放大 / 变异 / 异常）。
 *
 * dependencies: react, ../../types, ./useBatchDetailView, ./parts/*
 * exports: BatchDetailViewProps, BatchDetailView, BatchDetailTab
 */
import React from "react";
import { BatchItem, NavigateExtra, NavTabId } from "../../types";
import { useBatchDetailView } from "./useBatchDetailView";
import { AnomaliesPanel } from "./parts/AnomaliesPanel";
import { ArtifactsPanel } from "./parts/ArtifactsPanel";
import { BatchDetailHeader } from "./parts/BatchDetailHeader";
import { BatchDetailTabs } from "./parts/BatchDetailTabs";
import { BatchMetaCards } from "./parts/BatchMetaCards";
import { ComparePanel } from "./parts/ComparePanel";
import { MutationPanel } from "./parts/MutationPanel";
import { TimelinePanel } from "./parts/TimelinePanel";
import { ZoomArtifactModal } from "./parts/ZoomArtifactModal";

export type { BatchDetailTab } from "./useBatchDetailView";

export interface BatchDetailViewProps {
  batchId?: string;
  batches: BatchItem[];
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const BatchDetailView: React.FC<BatchDetailViewProps> = ({
  batchId,
  batches,
  onNavigate,
  onShowToast,
}) => {
  const {
    currentBatch,
    activeTab,
    setActiveTab,
    isExportOpen,
    toggleExportOpen,
    closeExportOpen,
    zoomedArtifact,
    setZoomedArtifact,
    isGeneratingMutations,
    handleLaunchMutations,
    anomalies,
    handleFixAnomaly,
  } = useBatchDetailView({ batchId, batches, onShowToast });

  // 数据守卫：无匹配批次时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!currentBatch) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#8a97a8] bg-[#0a1628]">
        暂无批次数据
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628]">
      {/* Top Header Bar */}
      <BatchDetailHeader
        currentBatch={currentBatch}
        onNavigate={onNavigate}
        onShowToast={onShowToast}
        isExportOpen={isExportOpen}
        onToggleExport={toggleExportOpen}
        onCloseExport={closeExportOpen}
      />

      {/* Meta Specs Overview Cards */}
      <BatchMetaCards currentBatch={currentBatch} />

      {/* 4 Tabs Menu (Requirement 2.1) */}
      <BatchDetailTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* TAB A: 5 Artifacts Matrix */}
      {activeTab === "artifacts" && (
        <ArtifactsPanel
          currentBatch={currentBatch}
          onShowToast={onShowToast}
          onZoomArtifact={setZoomedArtifact}
        />
      )}

      {/* TAB B: Radar Comparison with Baseline */}
      {activeTab === "compare" && <ComparePanel />}

      {/* TAB C: Mutation Launcher */}
      {activeTab === "mutation" && (
        <MutationPanel
          currentBatch={currentBatch}
          isGeneratingMutations={isGeneratingMutations}
          onLaunchMutations={handleLaunchMutations}
        />
      )}

      {/* TAB D: Anomaly Frame Locator & Annotator (Requirement 2.1) */}
      {activeTab === "anomalies" && (
        <AnomaliesPanel anomalies={anomalies} onFixAnomaly={handleFixAnomaly} />
      )}

      {/* TAB Timeline */}
      {activeTab === "timeline" && <TimelinePanel />}

      {/* Zoom Artifact Modal */}
      {zoomedArtifact && (
        <ZoomArtifactModal artifact={zoomedArtifact} onClose={() => setZoomedArtifact(null)} />
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
