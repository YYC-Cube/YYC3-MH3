/**
 * file: src/views/WorkbenchView/parts/WorkspaceRightColumn.tsx
 * description: YYC³ 功能视图 — WorkbenchView 右栏（渲染产物 + 抽帧流 + 复核回写）编排 part
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 右栏列容器 —— 视频预览播放器 + 实时抽帧流 + 五维雷达图 +
 *        人工复核与优质 Seed 回写面板，逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, ../../../components/common, ../../../components/pipeline/RadarScoreChart, ../../../components/pipeline/VideoPreviewPlayer, ../../../types, ../useWorkbenchView, ./KeyframeStream, ./ReviewPanel
 * exports: WorkspaceRightColumnProps, WorkspaceRightColumn
 */
import React from "react";
import { Badge } from "../../../components/common";
import { RadarScoreChart } from "../../../components/pipeline/RadarScoreChart";
import { VideoPreviewPlayer } from "../../../components/pipeline/VideoPreviewPlayer";
import { BatchItem } from "../../../types";
import { WorkbenchViewModel } from "../useWorkbenchView";
import { KeyframeStream } from "./KeyframeStream";
import { ReviewPanel } from "./ReviewPanel";

export interface WorkspaceRightColumnProps {
  vm: WorkbenchViewModel;
  currentBatch: BatchItem;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const WorkspaceRightColumn: React.FC<WorkspaceRightColumnProps> = ({
  vm,
  currentBatch,
  onShowToast,
}) => {
  return (
    <div className="w-96 border-l border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
        <span className="text-xs font-semibold text-[#e8f0f8]">实时渲染产物与质量复核</span>
        <Badge variant="brand" size="xs">
          Score: {currentBatch.score} 分
        </Badge>
      </div>

      {/* Video Player */}
      <VideoPreviewPlayer
        posterUrl={currentBatch.previewThumbnail}
        batchId={currentBatch.id}
        seedNumber={vm.seedNumber}
        score={currentBatch.score}
        onSnapshot={() => onShowToast("success", "截图已保存", "已添加至当前批次关键帧库")}
      />

      {/* Real-time Keyframe Streamer Strip (Requirement 2.1) */}
      <KeyframeStream keyframes={vm.keyframes} />

      {/* 5-Dimension Radar Chart */}
      <RadarScoreChart />

      {/* Human Review & Defect Checklist */}
      <ReviewPanel
        defectChecks={vm.defectChecks}
        onDefectCheckChange={vm.setDefectChecks}
        onReviewScoreChange={vm.setReviewScore}
        isAdopted={vm.isAdopted}
        onAdoptSeed={vm.handleAdoptSeed}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
