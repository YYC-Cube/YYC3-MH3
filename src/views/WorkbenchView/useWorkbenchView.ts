/**
 * file: src/views/WorkbenchView/useWorkbenchView.ts
 * description: YYC³ 功能视图 — WorkbenchView 状态收敛 hook（参数配置 / 流水线仿真 / 质检回写）
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-10-16
 * updated: 2026-10-23
 * status: active
 * tags: [hook],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 局部状态单一真值源 —— DiffSynth 采样参数、五步闭环流水线执行态、
 *        人工复核与优质 Seed 回写、参数版本对比与批量导入弹窗开关；
 *        纯状态装配，不渲染 UI，交互语义与解构前逐字一致；
 *        数值/文案规则全部经生产域纯函数（pipeline/seed/quality）出借。
 *        v1.2.0：执行态三字段与模拟循环抽取至 parts/usePipelineExecution（P3 体积守卫，
 *        父件自 292 行回落）；对外契约不变。
 *
 * dependencies: react, ../../domains/production/batch, ../../domains/production/pipeline, ../../domains/production/quality, ../../domains/production/seed, ../../types, ./parts/KeyframeStream, ./parts/usePipelineExecution
 * exports: UseWorkbenchViewOptions, DefectChecks, WorkbenchViewModel, useWorkbenchView
 */
import { useEffect, useState } from "react";
import { findCurrentBatch } from "../../domains/production/batch";
import {
  DEFAULT_NEGATIVE_PROMPT,
  GOLDEN_BASELINE_NOTICE,
  executionRequestLogEntry,
  rollbackToGoldenBaseline,
  runStartNotice,
  templateLoadedNotice,
} from "../../domains/production/pipeline";
import { DEFAULT_DEFECT_CHECKS } from "../../domains/production/quality";
import {
  ADOPTION_NOTICE,
  adoptionSeedDraft,
  generateSeedNumber,
  randomSeedNotice,
} from "../../domains/production/seed";
import { BatchItem, BatchMode, KeyframePreview, LogEntry, ParameterTemplate, SeedItem } from "../../types";
import { INITIAL_KEYFRAMES } from "./parts/KeyframeStream";
import { TaskQueuePort } from "../../domains/platform/queue/ports";
import { usePipelineExecution } from "./parts/usePipelineExecution";

export interface UseWorkbenchViewOptions {
  batches: BatchItem[];
  activeBatchId?: string;
  onAdoptSeed: (seed: Partial<SeedItem>) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  initialLogs: LogEntry[];
  /** 引擎任务队列（app 层下传，见 WorkbenchViewProps） */
  engineQueue?: TaskQueuePort;
}

/** 人工质检缺陷标记表（键为缺陷项，值为是否通过） */
export interface DefectChecks {
  [key: string]: boolean;
}

/** 工作台视图模型（容器与列级 part 共用的状态装配契约） */
export type WorkbenchViewModel = ReturnType<typeof useWorkbenchView>;

export function useWorkbenchView({
  batches,
  activeBatchId,
  onAdoptSeed,
  onShowToast,
  initialLogs,
  engineQueue,
}: UseWorkbenchViewOptions) {
  const currentBatch = findCurrentBatch(batches, activeBatchId);

  // Parameters State
  const [mode, setMode] = useState<BatchMode>(currentBatch?.mode || "Ref2VA");
  const [prompt, setPrompt] = useState(currentBatch?.prompt ?? "");
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [seedNumber, setSeedNumber] = useState(currentBatch?.seed ?? 0);
  const [steps, setSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [denoiseStrength, setDenoiseStrength] = useState(0.65);
  const [fps, setFps] = useState(currentBatch?.fps ?? 24);
  const [resolution, setResolution] = useState(currentBatch?.resolution ?? "1080p");
  const [fp8Optimization, setFp8Optimization] = useState(true);

  // Execution & Live Stream State（执行态三字段由 usePipelineExecution 承接）
  const exec = usePipelineExecution({ currentBatch, onShowToast, engineQueue });
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [keyframes] = useState<KeyframePreview[]>(INITIAL_KEYFRAMES);

  // Review & Adoption State
  const [, setReviewScore] = useState(5);
  const [defectChecks, setDefectChecks] = useState<DefectChecks>({
    ...DEFAULT_DEFECT_CHECKS,
  });
  const [isAdopted, setIsAdopted] = useState(false);

  // Modals state
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  // Sync state when active batch changes
  useEffect(() => {
    if (currentBatch) {
      setMode(currentBatch.mode);
      setPrompt(currentBatch.prompt);
      setSeedNumber(currentBatch.seed);
      setFps(currentBatch.fps);
      setResolution(currentBatch.resolution);
      setIsAdopted(false);
    }
    // 刻意仅按批次 id 同步：批次对象含高频变化字段（progress 每 tick 刷新），
    // 以对象引用为依赖会不断重置用户正在编辑的表单态（prompt/seed/fps 等）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBatch?.id]);

  // Template quick switch
  const handleApplyTemplate = (tmpl: ParameterTemplate) => {
    setMode(tmpl.mode);
    setSteps(tmpl.steps);
    setGuidanceScale(tmpl.guidanceScale);
    setDenoiseStrength(tmpl.denoiseStrength);
    setResolution(tmpl.resolution);
    setFps(tmpl.fps);
    setFp8Optimization(tmpl.fp8);
    onShowToast("info", templateLoadedNotice(tmpl.name));
  };

  const handleToggleRun = () => {
    if (exec.isRunning) {
      exec.setIsRunning(false);
      onShowToast("info", "流水线已暂停");
    } else {
      exec.start();
      const startNotice = runStartNotice(seedNumber);
      onShowToast("success", startNotice.title, startNotice.detail);
      setLogs((prev) => [
        ...prev,
        executionRequestLogEntry(
          { steps, guidanceScale, seedNumber },
          { id: `LOG-${Date.now()}`, timestamp: new Date().toLocaleTimeString() },
        ),
      ]);
    }
  };

  const handleTerminate = () => {
    exec.terminate();
    onShowToast("warning", "批次已重置终止");
  };

  const handleSaveTemplate = () => {
    onShowToast("success", "参数已保存为模板");
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleRandomSeed = () => {
    const newSeed = generateSeedNumber();
    setSeedNumber(newSeed);
    const notice = randomSeedNotice(newSeed);
    onShowToast("info", notice.title, notice.detail);
  };

  const handleAdoptSeed = () => {
    if (!currentBatch) return;
    setIsAdopted(true);
    onAdoptSeed(
      adoptionSeedDraft({
        seedNumber,
        batchName: currentBatch.name,
        batchScore: currentBatch.score,
        mode,
        params: { guidanceScale, steps, denoiseStrength },
      }),
    );
    onShowToast("success", ADOPTION_NOTICE.title, `Seed #${seedNumber} ${ADOPTION_NOTICE.detail}`);
  };

  const handleImportBatchJson = () => {
    try {
      onShowToast("success", "已批量导入 3 组批次参数", "已加入批次队列末尾");
      setIsImportModalOpen(false);
    } catch {
      onShowToast("error", "JSON 格式解析失败");
    }
  };

  const handleRollbackV2 = () => {
    const baseline = rollbackToGoldenBaseline();
    setSteps(baseline.steps);
    setGuidanceScale(baseline.guidanceScale);
    setIsDiffModalOpen(false);
    onShowToast("success", GOLDEN_BASELINE_NOTICE.title);
  };

  return {
    currentBatch,
    mode,
    setMode,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    seedNumber,
    setSeedNumber,
    steps,
    setSteps,
    guidanceScale,
    setGuidanceScale,
    denoiseStrength,
    setDenoiseStrength,
    fps,
    setFps,
    resolution,
    setResolution,
    fp8Optimization,
    setFp8Optimization,
    isRunning: exec.isRunning,
    currentStage: exec.currentStage,
    setCurrentStage: exec.setCurrentStage,
    progress: exec.progress,
    logs,
    handleClearLogs,
    keyframes,
    setReviewScore,
    defectChecks,
    setDefectChecks,
    isAdopted,
    isDiffModalOpen,
    setIsDiffModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    importJsonText,
    setImportJsonText,
    handleApplyTemplate,
    handleToggleRun,
    handleTerminate,
    handleSaveTemplate,
    handleRandomSeed,
    handleAdoptSeed,
    handleImportBatchJson,
    handleRollbackV2,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
