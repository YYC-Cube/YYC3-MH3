/**
 * file: src/components/navigation/Sidebar/parts/navItems.tsx
 * description: YYC³ 导航数据 — Sidebar 导航项元数据（四分类分组：system/core/advanced/ops）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[data],[sidebar],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Sidebar 逐字提取的导航项常量与契约（零重设计）。
 *
 * dependencies: react, ../../../../types, lucide-react
 * exports: NavItemDef, NAV_ITEMS
 */
import {
  Activity,
  BookOpen,
  Cpu,
  Dna,
  FileCode,
  HardDrive,
  Layers,
  LayoutDashboard,
  Moon,
  Network,
  Palette,
  Settings,
  Share2,
} from "lucide-react";
import React from "react";
import type { NavTabId } from "../../../../types";

export interface NavItemDef {
  id: NavTabId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  category: "system" | "core" | "advanced" | "ops";
}

export const NAV_ITEMS: NavItemDef[] = [
  // Design System
  {
    id: "design-system",
    label: "设计规范与组件库",
    icon: <Palette className="w-4 h-4" />,
    badge: "DS 2.0",
    category: "system",
  },
  // Core Production
  {
    id: "dashboard",
    label: "总览驾驶舱",
    icon: <LayoutDashboard className="w-4 h-4" />,
    category: "core",
  },
  {
    id: "workbench",
    label: "流水线工作台",
    icon: <Cpu className="w-4 h-4" />,
    badge: "5步闭环",
    category: "core",
  },
  {
    id: "batch-detail",
    label: "批次详情与复盘",
    icon: <Layers className="w-4 h-4" />,
    category: "core",
  },
  {
    id: "seed",
    label: "Seed 种子库",
    icon: <Dna className="w-4 h-4" />,
    badge: "S级",
    category: "core",
  },
  {
    id: "prompt",
    label: "提示词工程中心",
    icon: <FileCode className="w-4 h-4" />,
    category: "core",
  },
  {
    id: "platform",
    label: "平台管理中心",
    icon: <Share2 className="w-4 h-4" />,
    badge: "调度/媒体",
    category: "core",
  },
  // Advanced Production
  {
    id: "models",
    label: "模型与资源管理",
    icon: <HardDrive className="w-4 h-4" />,
    category: "advanced",
  },
  {
    id: "agent",
    label: "Agent 编排与漫剧",
    icon: <Network className="w-4 h-4" />,
    badge: "Node",
    category: "advanced",
  },
  // Ops & Utils
  {
    id: "ops",
    label: "系统运维监控",
    icon: <Activity className="w-4 h-4" />,
    badge: "Watchdog",
    category: "ops",
  },
  {
    id: "nightly",
    label: "夜间批量控制台",
    icon: <Moon className="w-4 h-4" />,
    badge: "低蓝光",
    category: "ops",
  },
  {
    id: "docs",
    label: "内置文档中心",
    icon: <BookOpen className="w-4 h-4" />,
    badge: "22篇",
    category: "ops",
  },
  {
    id: "settings",
    label: "系统与硬件设置",
    icon: <Settings className="w-4 h-4" />,
    category: "ops",
  },
];

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
