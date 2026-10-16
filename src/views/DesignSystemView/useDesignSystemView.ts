/**
 * file: src/views/DesignSystemView/useDesignSystemView.ts
 * description: YYC³ 功能视图 — DesignSystemView 状态收敛 hook（页签 / 演示控件 / 复制反馈）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [hook],[view],[designsystem],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DesignSystemView 局部状态单一真值源 ——
 *   - 设计规范分区页签（Tokens / Atoms / Business / Prompts）
 *   - 色值复制反馈（copiedHex + 剪贴板写入 + 2s 复原）
 *   - 原子组件演示态（输入框 / 下拉 / 滑块 / 双开关 / Loading 按钮 / 模态框 / 抽屉）
 *   - 业务组件演示态（流水线阶段与进度）
 *   纯状态装配，不渲染 UI；交互语义与解构前逐字一致。
 *
 * dependencies: react, ../../types
 * exports: DesignTab, UseDesignSystemViewOptions, UseDesignSystemViewResult, useDesignSystemView
 */
import { useState } from "react";
import { PipelineStageKey } from "../../types";

/** 设计系统分区页签 ID */
export type DesignTab = "tokens" | "atoms" | "business" | "prompts";

export interface UseDesignSystemViewOptions {
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export interface UseDesignSystemViewResult {
  activeTab: DesignTab;
  setActiveTab: (tab: DesignTab) => void;
  copiedHex: string | null;
  demoInput: string;
  setDemoInput: (value: string) => void;
  demoInputErr: string;
  setDemoInputErr: (value: string) => void;
  demoSelect: string;
  setDemoSelect: (value: string) => void;
  demoSlider: number;
  setDemoSlider: (value: number) => void;
  demoSwitch1: boolean;
  setDemoSwitch1: (value: boolean) => void;
  demoSwitch2: boolean;
  setDemoSwitch2: (value: boolean) => void;
  demoBtnLoading: boolean;
  setDemoBtnLoading: (value: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  demoPipelineStage: PipelineStageKey;
  setDemoPipelineStage: (stage: PipelineStageKey) => void;
  demoPipelineProgress: number;
  setDemoPipelineProgress: (progress: number) => void;
  handleCopyColor: (hex: string) => void;
  copyPromptText: (title: string, text: string) => void;
}

export function useDesignSystemView({
  onShowToast,
}: UseDesignSystemViewOptions): UseDesignSystemViewResult {
  const [activeTab, setActiveTab] = useState<DesignTab>("tokens");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Form states in demo
  const [demoInput, setDemoInput] = useState("DiffSynth-MiniMax-H3-v2.1-HQ");
  const [demoInputErr, setDemoInputErr] = useState("");
  const [demoSelect, setDemoSelect] = useState("Ref2VA");
  const [demoSlider, setDemoSlider] = useState(7.5);
  const [demoSwitch1, setDemoSwitch1] = useState(true);
  const [demoSwitch2, setDemoSwitch2] = useState(false);
  const [demoBtnLoading, setDemoBtnLoading] = useState(false);

  // Modal / Drawer demo states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pipeline demo state
  const [demoPipelineStage, setDemoPipelineStage] = useState<PipelineStageKey>("fine_eval");
  const [demoPipelineProgress, setDemoPipelineProgress] = useState(68);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onShowToast("success", `已复制色值 ${hex}`, "可直接粘贴到 CSS 或 Figma 中");
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyPromptText = (title: string, text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(
      "success",
      `已复制 ${title} 提示词`,
      "已放入剪贴板，可直接发送给 AI 绘图/代码生成器",
    );
  };

  return {
    activeTab,
    setActiveTab,
    copiedHex,
    demoInput,
    setDemoInput,
    demoInputErr,
    setDemoInputErr,
    demoSelect,
    setDemoSelect,
    demoSlider,
    setDemoSlider,
    demoSwitch1,
    setDemoSwitch1,
    demoSwitch2,
    setDemoSwitch2,
    demoBtnLoading,
    setDemoBtnLoading,
    isModalOpen,
    setIsModalOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    demoPipelineStage,
    setDemoPipelineStage,
    demoPipelineProgress,
    setDemoPipelineProgress,
    handleCopyColor,
    copyPromptText,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
