/**
 * file: src/views/ModelsView/index.tsx
 * description: YYC³ 功能视图 — ModelsView 入口容器（分区状态装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[models],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 模型仓库视图入口 —— 收敛分区页签与预热进度单一真值，编排标头/横幅/页签/四分区；
 *        大块分区 JSX 分别下沉至 parts（ModelsHeader / WarmupBanner / ModelTabs /
 *        ModelsGrid / EnvChecklist / DiskUsage / BenchmarksTable）。
 *
 * dependencies: react, ../../types, ./parts/ModelsHeader, ./parts/WarmupBanner, ./parts/ModelTabs, ./parts/ModelsGrid, ./parts/EnvChecklist, ./parts/DiskUsage, ./parts/BenchmarksTable
 * exports: ModelTab, ModelsViewProps, ModelsView
 */
import React, { useState } from "react";
import type { NavTabId, NavigateExtra } from "../../types";
import { BenchmarksTable } from "./parts/BenchmarksTable";
import { DiskUsage } from "./parts/DiskUsage";
import { EnvChecklist } from "./parts/EnvChecklist";
import { ModelTabs } from "./parts/ModelTabs";
import { ModelsGrid } from "./parts/ModelsGrid";
import { ModelsHeader } from "./parts/ModelsHeader";
import { WarmupBanner } from "./parts/WarmupBanner";

/** 模型仓库分区页签 ID */
export type ModelTab = "models" | "env" | "disk" | "benchmarks";

export interface ModelsViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<ModelTab>("models");
  const [warmupProgress, setWarmupProgress] = useState<number | null>(null);

  const handleWarmup = (modelName: string) => {
    setWarmupProgress(10);
    const interval = setInterval(() => {
      setWarmupProgress((prev) => {
        if (!prev || prev >= 100) {
          clearInterval(interval);
          onShowToast("success", `${modelName} 预热完成`, "CUDA TensorRT 缓存与显存常驻就绪");
          return null;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628]">
      <ModelsHeader onShowToast={onShowToast} />
      {warmupProgress !== null && <WarmupBanner warmupProgress={warmupProgress} />}
      <ModelTabs activeTab={activeTab} onSelectTab={setActiveTab} />
      {activeTab === "models" && <ModelsGrid onWarmup={handleWarmup} onShowToast={onShowToast} />}
      {activeTab === "env" && <EnvChecklist />}
      {activeTab === "disk" && <DiskUsage onShowToast={onShowToast} />}
      {activeTab === "benchmarks" && <BenchmarksTable />}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
