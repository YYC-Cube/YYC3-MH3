/**
 * file: src/components/platform/DispatchModule/index.tsx
 * description: YYC³ 平台组件 — 生产调度台模块入口容器（四分区装配）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[platform],[dispatch],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 生产调度台 —— 纯展示组件，推送任务列表经 props 注入（状态存视图层跨页签持久）；
 *        四大分区 JSX 分别下沉至 parts（PushMatrixSection / GpuSlotsSection /
 *        PhonemeDictSection / ResourceSchedulingSection）。
 *
 * dependencies: ../../../types, ./parts/PushMatrixSection, ./parts/GpuSlotsSection, ./parts/PhonemeDictSection, ./parts/ResourceSchedulingSection
 * exports: DispatchModuleProps, DispatchModule
 */
import type { PushTaskItem, ShowToast } from "../../../types";
import { GpuSlotsSection } from "./parts/GpuSlotsSection";
import { PhonemeDictSection } from "./parts/PhonemeDictSection";
import { PushMatrixSection } from "./parts/PushMatrixSection";
import { ResourceSchedulingSection } from "./parts/ResourceSchedulingSection";

export interface DispatchModuleProps {
  pushTasks: PushTaskItem[];
  /** 打开新建推送作业弹窗（弹窗状态存视图层） */
  onNewPushClick: () => void;
  onShowToast: ShowToast;
}

export function DispatchModule({ pushTasks, onNewPushClick, onShowToast }: DispatchModuleProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section: One-Click Push & Distribution Matrix */}
      <PushMatrixSection
        pushTasks={pushTasks}
        onNewPushClick={onNewPushClick}
        onShowToast={onShowToast}
      />

      {/* Section: Multi-GPU Distributed Parallel Scheduling Slots (Requirement 1) */}
      <GpuSlotsSection onShowToast={onShowToast} />

      {/* Section: Multi-Language Phoneme Dictionary Center (Requirement 2) */}
      <PhonemeDictSection onShowToast={onShowToast} />

      {/* Section: Dynamic Resource Scheduling */}
      <ResourceSchedulingSection onShowToast={onShowToast} />
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
