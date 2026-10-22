/**
 * file: src/views/WorkbenchView/parts/usePipelineExecution.ts
 * description: YYC³ 功能视图 — WorkbenchView 流水线执行态 hook（自 useWorkbenchView 抽取，行为逐字等价）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-23
 * updated: 2026-10-23
 * status: active
 * tags: [hook],[view],[workbench],[pipeline]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 五步闭环执行态单一真值源 —— isRunning / currentStage / progress 三态、批次切换同步、
 *        模拟推进循环（1s/tick + advancePipeline 纯函数）、start/terminate 动作。
 *        抽取动机：父 hook 触及 300 行体积守卫（P3 上帝模块防回归）；本件承接执行态后父件回落。
 *        引擎直连预留：F-1 待接线——由 ProductionDataContext 下发 TaskQueuePort 后，start()
 *        分支为 enqueue(pipeline.run) 并由队列事件驱动三态（见 adapters/engine/pipelineQueue）。
 *
 * dependencies: react, ../../../domains/production/pipeline, ../../../types
 * exports: UsePipelineExecutionOptions, PipelineExecutionState, usePipelineExecution
 */
import { useEffect, useRef, useState } from "react";
import {
  PIPELINE_COMPLETION_NOTICE,
  advancePipeline,
  resetProgressIfComplete,
} from "../../../domains/production/pipeline";
import { PIPELINE_RUN_TASK_TYPE, TaskQueuePort } from "../../../domains/platform/queue/ports";
import { BatchItem, PipelineStageKey } from "../../../types";

export interface UsePipelineExecutionOptions {
  currentBatch?: BatchItem;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  /** 引擎任务队列（app 层经 getPorts() 下传；env 未设 NEXT_PUBLIC_ENGINE_BASE_URL 时为内存队列 → 走模拟循环） */
  engineQueue?: TaskQueuePort;
}

/** 执行态对外契约（父 hook 透传给容器，字段语义与抽取前一致） */
export interface PipelineExecutionState {
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  currentStage: PipelineStageKey;
  setCurrentStage: React.Dispatch<React.SetStateAction<PipelineStageKey>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  /** 开始/续跑：满进度重启归零，未满原地续跑（抽取前 handleToggleRun 的启动半支） */
  start: () => void;
  /** 终止并归零（抽取前 handleTerminate 主体） */
  terminate: () => void;
}

export function usePipelineExecution({
  currentBatch,
  onShowToast,
  engineQueue,
}: UsePipelineExecutionOptions): PipelineExecutionState {
  const [isRunning, setIsRunning] = useState(currentBatch?.status === "running");
  const [currentStage, setCurrentStage] = useState<PipelineStageKey>(
    currentBatch?.currentStage ?? "generation",
  );
  const [progress, setProgress] = useState(currentBatch?.progress ?? 0);
  /** 引擎在途标记：仅受理本 hook 发起任务期间的队列事件（单飞语义，与后端 pipelineManager 对齐） */
  const engineActiveRef = useRef(false);
  /** 引擎模式开关：env 未设 NEXT_PUBLIC_ENGINE_BASE_URL 时恒走模拟循环（组合根装配的是内存队列） */
  const engineMode = Boolean(engineQueue && process.env.NEXT_PUBLIC_ENGINE_BASE_URL);

  // Sync state when active batch changes（刻意仅按批次 id 同步，防高频字段重置表单态）
  useEffect(() => {
    if (currentBatch) {
      setCurrentStage(currentBatch.currentStage);
      setProgress(currentBatch.progress);
      setIsRunning(currentBatch.status === "running");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBatch?.id]);

  // Simulated live execution loop（演示语义：1s/tick +5%；引擎模式下禁用，改由队列事件驱动）
  useEffect(() => {
    let timer: number | null = null;
    if (!engineMode && isRunning && progress < 100) {
      timer = window.setInterval(() => {
        setProgress((prev) => {
          const { progress, stage, completed } = advancePipeline(prev);
          setCurrentStage(stage);
          if (completed) {
            setIsRunning(false);
            onShowToast(
              "success",
              PIPELINE_COMPLETION_NOTICE.title,
              PIPELINE_COMPLETION_NOTICE.detail,
            );
          }
          return progress;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [engineMode, isRunning, progress, onShowToast]);

  // Engine execution branch（F-1 末跳：env 设 NEXT_PUBLIC_ENGINE_BASE_URL 时，队列事件驱动三态）
  // 进度为粗粒度锚点（入队 5 / 引擎受理 20 / 完成 100）：后端 RunStatus 无步级指标，
  // 细粒度进度待 manifest gen_seconds 心跳回传后升级；日志/文件契约变更走遥测日志台（stage=engine）。
  useEffect(() => {
    if (!engineMode || !engineQueue) return;
    return engineQueue.onEvent((event) => {
      if (!engineActiveRef.current) return;
      if (event.type === "enqueued") {
        setProgress(5);
        setCurrentStage("generation");
      } else if (event.type === "dequeued") {
        setProgress(20);
      } else if (event.type === "completed") {
        engineActiveRef.current = false;
        setProgress(100);
        setIsRunning(false);
        onShowToast("success", "引擎流水线完成", `任务 ${event.task.id} 已收工，产物见批次详情`);
      } else if (event.type === "failed") {
        engineActiveRef.current = false;
        setIsRunning(false);
        onShowToast(
          "error",
          "引擎流水线失败",
          `任务 ${event.task.id} 终态 failed，原因见日志面板（stage=engine）`,
        );
      }
    });
  }, [engineMode, engineQueue, onShowToast]);

  const start = () => {
    if (engineMode && engineQueue) {
      // dryRun 默认 true：生产落地首阶段只放行试跑；真实批量仍由夜间窗口/后端控制台发起
      const batchNo = currentBatch?.id.match(/\d{2,}/)?.[0] ?? null;
      const task = {
        id: `run-${Date.now()}`,
        type: PIPELINE_RUN_TASK_TYPE,
        payload: { batch: batchNo, dryRun: true },
      };
      engineActiveRef.current = true;
      setProgress(resetProgressIfComplete(progress));
      setIsRunning(true);
      engineQueue.enqueue(task).catch((err: unknown) => {
        engineActiveRef.current = false;
        setIsRunning(false);
        onShowToast(
          "error",
          "引擎启动失败",
          err instanceof Error ? err.message : "后端 BFF 不可达或拒绝启动（回环 :3030）",
        );
      });
      return;
    }
    setProgress(resetProgressIfComplete(progress));
    setIsRunning(true);
  };

  const terminate = () => {
    setIsRunning(false);
    setProgress(0);
  };

  return {
    isRunning,
    setIsRunning,
    currentStage,
    setCurrentStage,
    progress,
    setProgress,
    start,
    terminate,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
