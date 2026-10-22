/**
 * file: src/views/WorkbenchView/parts/WorkspaceCenterColumn.tsx
 * description: YYC³ 功能视图 — WorkbenchView 中栏（流水线可视化 + 参数与控制台）编排 part
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
 * brief: WorkbenchView 中栏列容器 —— 五步闭环流水线可视化 + 驱动模式/执行控制条 +
 *        DiffSynth 参数表单 + 终端日志控制台，逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, ../../../components/pipeline/PipelineBar, ../../../components/pipeline/TerminalLogPanel, ../useWorkbenchView, ./ModeActionBar, ./ParameterForm
 * exports: WorkspaceCenterColumnProps, WorkspaceCenterColumn
 */
import React from "react";
import { PipelineBar } from "../../../components/pipeline/PipelineBar";
import { TerminalLogPanel } from "../../../components/pipeline/TerminalLogPanel";
import { WorkbenchViewModel } from "../useWorkbenchView";
import { ModeActionBar } from "./ModeActionBar";
import { ParameterForm } from "./ParameterForm";

export interface WorkspaceCenterColumnProps {
  vm: WorkbenchViewModel;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const WorkspaceCenterColumn: React.FC<WorkspaceCenterColumnProps> = ({ vm, onShowToast }) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 border-r border-[#1e2f47]">
      {/* Five-Stage Closed-Loop Pipeline Visualizer */}
      <PipelineBar
        currentStage={vm.currentStage}
        progress={vm.progress}
        isRunning={vm.isRunning}
        onStageClick={(stage) => vm.setCurrentStage(stage)}
      />

      {/* Mode Switch & Action Controller Bar */}
      <ModeActionBar
        mode={vm.mode}
        onModeChange={vm.setMode}
        isRunning={vm.isRunning}
        progress={vm.progress}
        onToggleRun={vm.handleToggleRun}
        onTerminate={vm.handleTerminate}
        onSaveTemplate={vm.handleSaveTemplate}
      />

      {/* Form Parameters Section */}
      <ParameterForm
        prompt={vm.prompt}
        onPromptChange={vm.setPrompt}
        negativePrompt={vm.negativePrompt}
        onNegativePromptChange={vm.setNegativePrompt}
        seedNumber={vm.seedNumber}
        onSeedNumberChange={vm.setSeedNumber}
        steps={vm.steps}
        onStepsChange={vm.setSteps}
        guidanceScale={vm.guidanceScale}
        onGuidanceScaleChange={vm.setGuidanceScale}
        denoiseStrength={vm.denoiseStrength}
        onDenoiseStrengthChange={vm.setDenoiseStrength}
        fps={vm.fps}
        onFpsChange={vm.setFps}
        resolution={vm.resolution}
        onResolutionChange={vm.setResolution}
        fp8Optimization={vm.fp8Optimization}
        onFp8OptimizationChange={vm.setFp8Optimization}
        onRandomSeed={vm.handleRandomSeed}
      />

      {/* Terminal Log Console */}
      <TerminalLogPanel
        logs={vm.logs}
        onClear={vm.handleClearLogs}
        onTroubleshootFix={(action) => {
          onShowToast("success", "已触发排障修复", `已自动执行自愈动作: ${action}`);
        }}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
