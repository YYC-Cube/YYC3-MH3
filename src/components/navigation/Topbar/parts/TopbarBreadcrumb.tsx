/**
 * file: src/components/navigation/Topbar/parts/TopbarBreadcrumb.tsx
 * description: YYC³ 导航分区 — Topbar 左侧面包屑 + 同层级功能快捷直达下拉
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[breadcrumb],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Topbar 逐字提取的面包屑导航 JSX 与导航元数据表（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../types
 * exports: TopbarBreadcrumbProps, TopbarBreadcrumb
 */
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import { NavigateExtra, NavTabId } from "../../../../types";

/** 面包屑父级/当前/同层快捷直达元数据 */
interface TabMeta {
  parent: string;
  current: string;
  siblings: { id: NavTabId; label: string }[];
}

const TAB_TITLES: Record<NavTabId, TabMeta> = {
  "design-system": {
    parent: "MiniMax-H3 设计体系",
    current: "设计规范与全量组件库",
    siblings: [
      { id: "design-system", label: "设计规范与全量组件库" },
      { id: "docs", label: "内置文档中心 (22篇指南)" },
    ],
  },
  dashboard: {
    parent: "生产驾驶舱",
    current: "总览驾驶舱 Dashboard",
    siblings: [
      { id: "dashboard", label: "总览驾驶舱 Dashboard" },
      { id: "workbench", label: "五步闭环流水线工作台" },
      { id: "ops", label: "系统运维与算力监控" },
    ],
  },
  workbench: {
    parent: "核心生产",
    current: "五步闭环流水线工作台",
    siblings: [
      { id: "workbench", label: "五步闭环流水线工作台" },
      { id: "batch-detail", label: "批次复盘与产物分析" },
      { id: "seed", label: "Seed 种子库全生命周期" },
      { id: "prompt", label: "提示词工程中心" },
    ],
  },
  "batch-detail": {
    parent: "核心生产",
    current: "批次详情与复盘分析",
    siblings: [
      { id: "workbench", label: "返回流水线工作台" },
      { id: "batch-detail", label: "批次详情与复盘分析" },
      { id: "seed", label: "Seed 种子库" },
    ],
  },
  seed: {
    parent: "核心资产",
    current: "Seed 种子库全生命周期",
    siblings: [
      { id: "seed", label: "Seed 种子库全生命周期" },
      { id: "workbench", label: "流水线工作台" },
      { id: "prompt", label: "提示词工程中心" },
    ],
  },
  prompt: {
    parent: "工程中心",
    current: "提示词工程中心与测试台",
    siblings: [
      { id: "prompt", label: "提示词工程中心" },
      { id: "workbench", label: "流水线工作台" },
      { id: "seed", label: "Seed 种子库" },
    ],
  },
  models: {
    parent: "计算资源",
    current: "本地模型权重与环境诊断",
    siblings: [
      { id: "models", label: "本地模型权重与环境" },
      { id: "ops", label: "系统运维监控" },
    ],
  },
  agent: {
    parent: "漫剧编排",
    current: "多 Agent 工作流编排画布",
    siblings: [
      { id: "agent", label: "多 Agent 工作流编排" },
      { id: "platform", label: "平台管理中心" },
      { id: "workbench", label: "流水线工作台" },
    ],
  },
  platform: {
    parent: "调度与后期",
    current: "平台管理中心 (调度/媒体/分析/配置)",
    siblings: [
      { id: "platform", label: "平台管理中心" },
      { id: "workbench", label: "流水线工作台" },
      { id: "dashboard", label: "总览驾驶舱" },
      { id: "ops", label: "系统运维监控" },
    ],
  },
  ops: {
    parent: "运维中心",
    current: "硬件指标监控与看门狗告警",
    siblings: [
      { id: "ops", label: "系统运维监控" },
      { id: "models", label: "模型与资源管理" },
      { id: "nightly", label: "夜间批量控制台" },
    ],
  },
  nightly: {
    parent: "无人值守",
    current: "夜间低蓝光批量控制台",
    siblings: [
      { id: "nightly", label: "夜间批量控制台" },
      { id: "ops", label: "系统运维监控" },
    ],
  },
  docs: {
    parent: "知识中心",
    current: "内置工程文档中心 (22篇)",
    siblings: [
      { id: "docs", label: "内置文档中心" },
      { id: "design-system", label: "设计规范与组件库" },
    ],
  },
  settings: {
    parent: "全局配置",
    current: "系统设置与硬件限制",
    siblings: [
      { id: "settings", label: "系统设置与快捷键" },
      { id: "models", label: "本地模型管理" },
    ],
  },
};

export interface TopbarBreadcrumbProps {
  activeTab: NavTabId;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  isBreadcrumbOpen: boolean;
  setIsBreadcrumbOpen: React.Dispatch<React.SetStateAction<boolean>>;
  breadcrumbRef: React.RefObject<HTMLDivElement | null>;
}

export const TopbarBreadcrumb: React.FC<TopbarBreadcrumbProps> = ({
  activeTab,
  onNavigate,
  isBreadcrumbOpen,
  setIsBreadcrumbOpen,
  breadcrumbRef,
}) => {
  const meta = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <div className="flex items-center gap-2 text-xs relative" ref={breadcrumbRef}>
      <span className="text-[#8a97a8] font-medium">{meta.parent}</span>
      <ChevronRight className="w-3.5 h-3.5 text-[#8b949e]" />

      {/* Current Path with Dropdown */}
      <button
        onClick={() => setIsBreadcrumbOpen((p) => !p)}
        className="flex items-center gap-1 font-semibold text-[#00e0b8] hover:text-[#33e7c6] transition-colors p-1 rounded hover:bg-[#15294a] cursor-pointer"
      >
        <span>{meta.current}</span>
        <ChevronDown className="w-3 h-3 ml-0.5 text-[#8a97a8]" />
      </button>

      {/* Secondary jump menu dropdown */}
      {isBreadcrumbOpen && (
        <div className="absolute top-8 left-16 w-56 rounded-xl bg-[#0c1a30] border border-[#1e2f47] shadow-2xl p-1.5 space-y-1 z-40 animate-in fade-in zoom-in-95 backdrop-blur-md">
          <div className="text-[10px] uppercase font-semibold text-[#8b949e] px-2 py-1">
            同层级功能快捷直达
          </div>
          {meta.siblings.map((sib) => (
            <button
              key={sib.id}
              onClick={() => {
                onNavigate(sib.id);
                setIsBreadcrumbOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                sib.id === activeTab
                  ? "bg-[#00e0b8]/15 text-[#00e0b8] font-semibold"
                  : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
              }`}
            >
              <span>{sib.label}</span>
              {sib.id === activeTab && <Check className="w-3.5 h-3.5 text-[#00e0b8]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
