/**
 * file: src/components/navigation/Sidebar.tsx
 * description: YYC³ 导航组件 — Sidebar
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[navigation],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 导航组件 — Sidebar
 *
 * dependencies: react, ../../types, lucide-react
 * exports: SidebarProps, Sidebar
 */
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
  ShieldCheck
} from "lucide-react"
import React from "react"
import { APP_PORT } from "../../config"
import { NavTabId } from "../../types"
export interface SidebarProps {
  activeTab: NavTabId
  onSelectTab: (tab: NavTabId) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItemDef {
  id: NavTabId
  label: string
  icon: React.ReactNode
  badge?: string
  category: "system" | "core" | "advanced" | "ops"
}

const NAV_ITEMS: NavItemDef[] = [
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
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`h-screen bg-[#0c1a30] border-r border-[#30363d] flex flex-col transition-all duration-200 select-none z-30 relative ${collapsed ? "w-16" : "w-60"
        }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3.5 border-b border-[#1e2f47] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-[#15294a] border border-[#00e0b8]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,224,184,0.3)] overflow-hidden">
            <img
              src="/yyc3-icons/logo.png"
              alt="YYC3 Logo"
              className="w-5 h-5 object-contain"
              onError={(e) => {
                ; (e.target as HTMLElement).style.display = "none"
              }}
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-[#e8f0f8] tracking-wide truncate">
                MiniMax-H3 DiffSynth
              </span>
              <span className="text-[10px] text-[#00e0b8] font-mono tracking-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8] animate-pulse" />
                本地版 v2.1 PRO
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-[#122340] text-[#8b949e] hover:text-[#e6edf3] transition-colors cursor-pointer"
          title={collapsed ? "展开侧边栏 (Ctrl+B)" : "收起侧边栏 (Ctrl+B)"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List with scroll */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* System Category */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 text-[10px] uppercase font-semibold text-[#5a6268] tracking-wider mb-1">
              设计体系
            </div>
          )}
          {NAV_ITEMS.filter((i) => i.category === "system").map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group relative ${isActive
                  ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/40 shadow-[0_0_12px_rgba(0,212,170,0.15)] font-semibold"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#122340]"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00d4aa] rounded-r" />
                )}
                <span
                  className={`${isActive ? "text-[#00d4aa]" : "group-hover:text-[#e6edf3]"
                    }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`ml-auto text-[9px] px-1.5 py-0.2 rounded font-mono ${isActive
                      ? "bg-[#00d4aa] text-[#071425] font-bold"
                      : "bg-[#122340] text-[#8b949e] border border-[#30363d]"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Core Category */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 text-[10px] uppercase font-semibold text-[#5a6268] tracking-wider mb-1">
              核心生产流水线
            </div>
          )}
          {NAV_ITEMS.filter((i) => i.category === "core").map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group relative ${isActive
                  ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/40 shadow-[0_0_12px_rgba(0,212,170,0.15)] font-semibold"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#122340]"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00d4aa] rounded-r" />
                )}
                <span
                  className={`${isActive ? "text-[#00d4aa]" : "group-hover:text-[#e6edf3]"
                    }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`ml-auto text-[9px] px-1.5 py-0.2 rounded font-mono ${isActive
                      ? "bg-[#00d4aa] text-[#071425] font-bold"
                      : "bg-[#122340] text-[#8b949e] border border-[#30363d]"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Advanced Category */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 text-[10px] uppercase font-semibold text-[#5a6268] tracking-wider mb-1">
              模型与工作流
            </div>
          )}
          {NAV_ITEMS.filter((i) => i.category === "advanced").map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group relative ${isActive
                  ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/40 shadow-[0_0_12px_rgba(0,212,170,0.15)] font-semibold"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#122340]"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00d4aa] rounded-r" />
                )}
                <span
                  className={`${isActive ? "text-[#00d4aa]" : "group-hover:text-[#e6edf3]"
                    }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`ml-auto text-[9px] px-1.5 py-0.2 rounded font-mono ${isActive
                      ? "bg-[#00d4aa] text-[#071425] font-bold"
                      : "bg-[#122340] text-[#8b949e] border border-[#30363d]"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Ops & Settings Category */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 text-[10px] uppercase font-semibold text-[#5a6268] tracking-wider mb-1">
              系统与运维
            </div>
          )}
          {NAV_ITEMS.filter((i) => i.category === "ops").map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group relative ${isActive
                  ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/40 shadow-[0_0_12px_rgba(0,212,170,0.15)] font-semibold"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#122340]"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00d4aa] rounded-r" />
                )}
                <span
                  className={`${isActive ? "text-[#00d4aa]" : "group-hover:text-[#e6edf3]"
                    }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`ml-auto text-[9px] px-1.5 py-0.2 rounded font-mono ${isActive
                      ? "bg-[#00d4aa] text-[#071425] font-bold"
                      : "bg-[#122340] text-[#8b949e] border border-[#30363d]"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Local Status */}
      <div className="p-3 border-t border-[#30363d] bg-[#071425]/70">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#8b949e]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00d4aa]" />
                本地优先数据主权
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30">
                100% 离线可用
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5a6268] font-mono">
              <span>本地预览 :{APP_PORT}</span>
              <span>VRAM 19.4/24G</span>
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center"
            title="本地数据安全保障 · 100%离线可用"
          >
            <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
          </div>
        )}
      </div>
    </aside>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
