/**
 * file: src/views/BatchDetailView/useBatchDetailView.ts
 * description: YYC³ 功能视图 — BatchDetailView 状态收敛 hook（页签 / 导出 / 放大 / 变异 / 异常）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [hook],[view],[batch-detail],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 局部状态单一真值源 ——
 *   - 当前批次解析（findCurrentBatch）+ 内容页签激活项
 *   - 导出下拉与产物放大弹窗开关
 *   - Seed 微变异矩阵生成态与发射处理器
 *   - 异常帧清单与一键平滑修复处理器
 *
 * dependencies: react, ../../domains/production/batch, ../../types
 * exports: BatchDetailTab, BATCH_DETAIL_TABS, ZoomedArtifact, BatchAnomaly, UseBatchDetailViewOptions, UseBatchDetailViewResult, useBatchDetailView
 */
import { useState } from "react";
import { findCurrentBatch } from "../../domains/production/batch";
import { BatchItem } from "../../types";

/** 批次详情内容页签（timeline/artifacts/compare/mutation/anomalies） */
export type BatchDetailTab = "timeline" | "artifacts" | "compare" | "mutation" | "anomalies";

export const BATCH_DETAIL_TABS: { id: BatchDetailTab; label: string }[] = [
  { id: "artifacts", label: "a. 生产产物矩阵 (5项)" },
  { id: "compare", label: "b. 多维雷达与基准对比" },
  { id: "mutation", label: "c. Seed 变异测试发射器" },
  { id: "anomalies", label: "d. 异常帧定位与标注工具" },
  { id: "timeline", label: "五阶段全流程时间轴" },
];

/** 产物放大查看载荷 */
export interface ZoomedArtifact {
  title: string;
  image: string;
  meta: string;
}

/** 异常帧记录（severity 为原始字符串，保持解构前语义） */
export interface BatchAnomaly {
  frame: number;
  issue: string;
  severity: string;
  fixed: boolean;
}

export interface UseBatchDetailViewOptions {
  batchId?: string;
  batches: BatchItem[];
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export interface UseBatchDetailViewResult {
  currentBatch: BatchItem | null;
  activeTab: BatchDetailTab;
  setActiveTab: (tab: BatchDetailTab) => void;
  isExportOpen: boolean;
  toggleExportOpen: () => void;
  closeExportOpen: () => void;
  zoomedArtifact: ZoomedArtifact | null;
  setZoomedArtifact: (artifact: ZoomedArtifact | null) => void;
  mutationCount: number;
  isGeneratingMutations: boolean;
  handleLaunchMutations: () => void;
  anomalies: BatchAnomaly[];
  handleFixAnomaly: (frame: number) => void;
}

export function useBatchDetailView({
  batchId,
  batches,
  onShowToast,
}: UseBatchDetailViewOptions): UseBatchDetailViewResult {
  const currentBatch = findCurrentBatch(batches, batchId) ?? null;
  const [activeTab, setActiveTab] = useState<BatchDetailTab>("artifacts");

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Zoom artifact modal
  const [zoomedArtifact, setZoomedArtifact] = useState<ZoomedArtifact | null>(null);

  // Mutation launcher state
  const [mutationCount] = useState(4);
  const [isGeneratingMutations, setIsGeneratingMutations] = useState(false);

  // Anomalies list
  const [anomalies, setAnomalies] = useState<BatchAnomaly[]>([
    {
      frame: 142,
      issue: "第 142 帧微表情眨眼间隔偏长 (380ms vs 基线 250ms)",
      severity: "medium",
      fixed: false,
    },
    {
      frame: 218,
      issue: "第 218 帧唇齿音素轻微边界模糊 (SyncNet 时延 0.048s)",
      severity: "low",
      fixed: true,
    },
  ]);

  const handleLaunchMutations = () => {
    setIsGeneratingMutations(true);
    setTimeout(() => {
      setIsGeneratingMutations(false);
      onShowToast(
        "success",
        `成功生成 ${mutationCount} 组变异批次`,
        "已自动加入队列，包含 Seed±1 与 CFG±0.5 变异",
      );
    }, 1500);
  };

  const handleFixAnomaly = (frame: number) => {
    setAnomalies((prev) => prev.map((a) => (a.frame === frame ? { ...a, fixed: true } : a)));
    onShowToast("success", `第 ${frame} 帧异常已应用时序平滑补丁`, "微表情已重新对齐");
  };

  const toggleExportOpen = () => setIsExportOpen((p) => !p);
  const closeExportOpen = () => setIsExportOpen(false);

  return {
    currentBatch,
    activeTab,
    setActiveTab,
    isExportOpen,
    toggleExportOpen,
    closeExportOpen,
    zoomedArtifact,
    setZoomedArtifact,
    mutationCount,
    isGeneratingMutations,
    handleLaunchMutations,
    anomalies,
    handleFixAnomaly,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
