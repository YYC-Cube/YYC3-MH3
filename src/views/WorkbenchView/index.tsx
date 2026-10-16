/**
 * file: src/views/WorkbenchView/index.tsx
 * description: YYC³ 功能视图 — WorkbenchView（流水线工作台容器）
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
 * brief: 流水线工作台编排容器 —— 三栏布局（批次队列 / 参数与控制台 / 渲染产物与复核），
 *        状态与事件处理器由 useWorkbenchView 单点收敛，大块 JSX 下沉至 parts/*，
 *        逐字搬移自原 WorkbenchView.tsx（纯提取，零重设计）。
 *
 * dependencies: react, ../../types, ./useWorkbenchView, ./parts/*
 * exports: WorkbenchViewProps, WorkbenchView
 */
import React from "react";
import { BatchItem, LogEntry, SeedItem } from "../../types";
import { BatchQueuePanel } from "./parts/BatchQueuePanel";
import { DiffModal } from "./parts/DiffModal";
import { ImportModal } from "./parts/ImportModal";
import { ShortcutHintBar } from "./parts/ShortcutHintBar";
import { TemplateBar } from "./parts/TemplateBar";
import { WorkspaceCenterColumn } from "./parts/WorkspaceCenterColumn";
import { WorkspaceRightColumn } from "./parts/WorkspaceRightColumn";
import { useWorkbenchView } from "./useWorkbenchView";

export interface WorkbenchViewProps {
  batches: BatchItem[];
  activeBatchId?: string;
  onSelectBatch: (id: string) => void;
  onAdoptSeed: (seed: Partial<SeedItem>) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  initialLogs: LogEntry[];
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  batches,
  activeBatchId,
  onSelectBatch,
  onAdoptSeed,
  onShowToast,
  initialLogs,
}) => {
  const vm = useWorkbenchView({ batches, activeBatchId, onAdoptSeed, onShowToast, initialLogs });
  const { currentBatch } = vm;

  // 数据守卫：无匹配批次时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!currentBatch) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#8a97a8] bg-[#0a1628]">
        暂无批次数据
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a1628] relative">
      {/* Top Parameter Template Quick Switcher Bar */}
      <TemplateBar
        onApplyTemplate={vm.handleApplyTemplate}
        onOpenDiff={() => vm.setIsDiffModalOpen(true)}
        onOpenImport={() => vm.setIsImportModalOpen(true)}
      />

      {/* 3-Column Workspace Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Batch Queue (Width: 260px) */}
        <BatchQueuePanel
          batches={batches}
          currentBatchId={currentBatch.id}
          onSelectBatch={onSelectBatch}
        />

        {/* MIDDLE COLUMN: Parameters + Controls + Terminal (Flex 1) */}
        <WorkspaceCenterColumn vm={vm} onShowToast={onShowToast} />

        {/* RIGHT COLUMN: Video Preview + Keyframe Stream + Quality Review + Seed Adoption */}
        <WorkspaceRightColumn vm={vm} currentBatch={currentBatch} onShowToast={onShowToast} />
      </div>

      {/* Bottom Floating Shortcut Hint Bar (Requirement 2.1) */}
      <ShortcutHintBar />

      {/* Parameter Version Diff Modal */}
      <DiffModal
        isOpen={vm.isDiffModalOpen}
        onClose={() => vm.setIsDiffModalOpen(false)}
        guidanceScale={vm.guidanceScale}
        steps={vm.steps}
        denoiseStrength={vm.denoiseStrength}
        onRollback={vm.handleRollbackV2}
      />

      {/* Batch Parameter Import Modal */}
      <ImportModal
        isOpen={vm.isImportModalOpen}
        onClose={() => vm.setIsImportModalOpen(false)}
        value={vm.importJsonText}
        onChange={vm.setImportJsonText}
        onConfirm={vm.handleImportBatchJson}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
