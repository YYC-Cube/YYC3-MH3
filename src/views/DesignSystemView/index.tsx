/**
 * file: src/views/DesignSystemView/index.tsx
 * description: YYC³ 功能视图 — DesignSystemView（UI 设计系统与组件规范容器）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[designsystem],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 设计系统视图编排容器 —— 顶部规范横幅 + 四大分区页签（Tokens / Atoms / Business / Prompts）
 *        + 交互演示容器，状态与事件处理器由 useDesignSystemView 单点收敛，
 *        大块 JSX 下沉至 parts/*，逐字搬移自原 DesignSystemView.tsx（纯提取，零重设计）。
 *
 * dependencies: react, ../../types, ./useDesignSystemView, ./parts/*
 * exports: DesignTab, DesignSystemViewProps, DesignSystemView
 */
import dynamic from "next/dynamic";
import React from "react";
import { LogEntry } from "../../types";
import { DemoModals } from "./parts/DemoModals";
import { DesignBanner } from "./parts/DesignBanner";
import { TokensTab } from "./parts/TokensTab";
import { useDesignSystemView } from "./useDesignSystemView";

/* 第七批 ③：非默认页签动态分块（默认 tokens 常载；切换时才拉取，行为零漂移） */
const AtomsTab = dynamic(() => import("./parts/AtomsTab").then((m) => ({ default: m.AtomsTab })), { ssr: false });
const BusinessTab = dynamic(() => import("./parts/BusinessTab").then((m) => ({ default: m.BusinessTab })), { ssr: false });
const PromptsTab = dynamic(() => import("./parts/PromptsTab").then((m) => ({ default: m.PromptsTab })), { ssr: false });

/** 设计系统分区页签 ID（对外保持原视图同名具名导出） */
export type { DesignTab } from "./useDesignSystemView";

export interface DesignSystemViewProps {
  onOpenYYC3?: () => void;
  onOpenLogin?: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  logs: LogEntry[];
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({
  onOpenYYC3,
  onOpenLogin,
  onShowToast,
  logs,
}) => {
  const {
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
  } = useDesignSystemView({ onShowToast });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#071425]">
      {/* Top Banner */}
      <DesignBanner activeTab={activeTab} onTabChange={setActiveTab} onShowToast={onShowToast} />

      {/* TAB 1: DESIGN TOKENS */}
      {activeTab === "tokens" && (
        <TokensTab
          copiedHex={copiedHex}
          onCopyColor={handleCopyColor}
          onOpenModal={() => setIsModalOpen(true)}
        />
      )}

      {/* TAB 2: ATOMS & MOLECULES */}
      {activeTab === "atoms" && (
        <AtomsTab
          input={demoInput}
          onInputChange={setDemoInput}
          inputError={demoInputErr}
          onInputErrorChange={setDemoInputErr}
          select={demoSelect}
          onSelectChange={setDemoSelect}
          slider={demoSlider}
          onSliderChange={setDemoSlider}
          switch1={demoSwitch1}
          onSwitch1Change={setDemoSwitch1}
          switch2={demoSwitch2}
          onSwitch2Change={setDemoSwitch2}
          btnLoading={demoBtnLoading}
          onBtnLoadingChange={setDemoBtnLoading}
          onOpenModal={() => setIsModalOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenLogin={onOpenLogin}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 3: BUSINESS SPECIFIC COMPONENTS */}
      {activeTab === "business" && (
        <BusinessTab
          stage={demoPipelineStage}
          onStageChange={setDemoPipelineStage}
          progress={demoPipelineProgress}
          onProgressChange={setDemoPipelineProgress}
          logs={logs}
          onShowToast={onShowToast}
          onOpenYYC3={onOpenYYC3}
        />
      )}

      {/* TAB 4: AI PROMPTS */}
      {activeTab === "prompts" && <PromptsTab onCopyPrompt={copyPromptText} />}

      <DemoModals
        isModalOpen={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={() => setIsDrawerOpen(false)}
        onShowToast={onShowToast}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
