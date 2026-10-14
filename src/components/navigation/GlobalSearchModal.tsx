/**
 * file: src/components/navigation/GlobalSearchModal.tsx
 * description: YYC³ 导航组件 — GlobalSearchModal
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
 * brief: YYC³ 导航组件 — GlobalSearchModal
 *
 * dependencies: react, ../../types, lucide-react, ../../data/content
 * exports: GlobalSearchModalProps, GlobalSearchModal
 */
import {
  BookOpen,
  Cpu,
  Dna,
  HardDrive,
  LayoutDashboard,
  Search,
  X
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { DOC_GUIDES } from "../../data/content"
import { BatchItem, NavigateExtra, NavTabId, SeedItem } from "../../types"

/** 全局搜索分类 */
export type SearchCategory =
  | "all"
  | "pages"
  | "batches"
  | "seeds"
  | "docs"
  | "models"

const SEARCH_CATEGORIES: { id: SearchCategory; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "pages", label: "功能页面" },
  { id: "batches", label: "生产批次" },
  { id: "seeds", label: "Seed 种子" },
  { id: "docs", label: "文档指南" },
  { id: "models", label: "模型权重" },
]

export interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void
  batches: BatchItem[]
  seeds: SeedItem[]
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  batches,
  seeds,
}) => {
  const [query, setQuery] = useState("")
  const [searchCategory, setSearchCategory] = useState<SearchCategory>("all")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const q = query.trim().toLowerCase()

  // Search results
  const pageMatches = [
    {
      tab: "design-system" as NavTabId,
      title: "设计规范与组件库 (DS Tokens)",
      category: "规范体系",
    },
    {
      tab: "dashboard" as NavTabId,
      title: "总览驾驶舱 Dashboard",
      category: "核心功能",
    },
    {
      tab: "workbench" as NavTabId,
      title: "五步闭环流水线工作台",
      category: "核心功能",
    },
    {
      tab: "batch-detail" as NavTabId,
      title: "批次详情与复盘分析",
      category: "核心功能",
    },
    {
      tab: "seed" as NavTabId,
      title: "Seed 种子库全生命周期",
      category: "核心功能",
    },
    {
      tab: "prompt" as NavTabId,
      title: "提示词工程中心",
      category: "核心功能",
    },
    {
      tab: "models" as NavTabId,
      title: "模型与计算资源管理",
      category: "扩展",
    },
    {
      tab: "agent" as NavTabId,
      title: "多 Agent 漫剧工作流编排",
      category: "扩展",
    },
    {
      tab: "platform" as NavTabId,
      title: "平台管理中心 (调度/媒体/分析/配置)",
      category: "平台核心",
    },
    { tab: "ops" as NavTabId, title: "系统运维监控与告警", category: "系统" },
    {
      tab: "nightly" as NavTabId,
      title: "夜间批处理控制台",
      category: "系统",
    },
    {
      tab: "docs" as NavTabId,
      title: "内置文档中心 (22篇指南)",
      category: "帮助",
    },
    {
      tab: "settings" as NavTabId,
      title: "系统设置与硬件限制",
      category: "系统",
    },
  ].filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  )

  const batchMatches = batches.filter(
    (b) =>
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)),
  )

  const seedMatches = seeds.filter(
    (s) =>
      !q ||
      String(s.seedNumber).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)),
  )

  const docMatches = DOC_GUIDES.filter(
    (d) => !q || d.title.toLowerCase().includes(q),
  )

  const modelMatches = [
    { name: "DiffSynth-MiniMax-H3-v2.1-HQ", size: "14.8 GB", vram: "8.2 GB" },
    { name: "DiffSynth-MiniMax-H3-v2.0-Fast", size: "9.2 GB", vram: "5.4 GB" },
    { name: "SyncNet-v3-MultiLingual", size: "1.8 GB", vram: "1.2 GB" },
  ].filter((m) => !q || m.name.toLowerCase().includes(q))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-[#071222]/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0a1628] border border-[#1e2f47] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#1e2f47] flex items-center gap-3 bg-[#0c1a30]">
          <Search className="w-5 h-5 text-[#00e0b8] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="搜索功能页面、批次编号、Seed 种子、文档、模型..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#e8f0f8] placeholder-[#5c697a] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-[#1e2f47] bg-[#0c1a30]/60 flex gap-2 overflow-x-auto text-xs">
          {SEARCH_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer whitespace-nowrap ${searchCategory === cat.id
                ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Pages */}
          {(searchCategory === "all" || searchCategory === "pages") &&
            pageMatches.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-[#5c697a] tracking-wider px-2 mb-1">
                  功能页面 ({pageMatches.length})
                </div>
                <div className="space-y-1">
                  {pageMatches.slice(0, 5).map((p) => (
                    <div
                      key={p.tab}
                      onClick={() => {
                        onNavigate(p.tab)
                        onClose()
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-[#8a97a8] group-hover:text-[#00e0b8]" />
                        <span className="font-medium">{p.title}</span>
                      </div>
                      <span className="text-[10px] text-[#5c697a] group-hover:text-[#8a97a8] font-mono">
                        {p.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Batches */}
          {(searchCategory === "all" || searchCategory === "batches") &&
            batchMatches.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-[#5c697a] tracking-wider px-2 mb-1">
                  批次任务 ({batchMatches.length})
                </div>
                <div className="space-y-1">
                  {batchMatches.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        onNavigate("workbench", { batchId: b.id })
                        onClose()
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#00b4d8]" />
                        <span className="font-mono text-[#00e0b8] font-semibold">
                          {b.id}
                        </span>
                        <span className="truncate max-w-xs">{b.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#8a97a8]">
                        Score: {b.score || "--"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Seeds */}
          {(searchCategory === "all" || searchCategory === "seeds") &&
            seedMatches.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-[#5c697a] tracking-wider px-2 mb-1">
                  Seed 种子 ({seedMatches.length})
                </div>
                <div className="space-y-1">
                  {seedMatches.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onNavigate("seed", { seedId: s.id })
                        onClose()
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Dna className="w-4 h-4 text-[#9d7cd8]" />
                        <span className="font-mono text-[#9d7cd8] font-bold">
                          #{s.seedNumber}
                        </span>
                        <span className="truncate">{s.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00e0b8]/15 text-[#00e0b8] font-mono">
                        {s.tier} 级
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Models */}
          {(searchCategory === "all" || searchCategory === "models") &&
            modelMatches.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-[#5c697a] tracking-wider px-2 mb-1">
                  模型权重 ({modelMatches.length})
                </div>
                <div className="space-y-1">
                  {modelMatches.map((m) => (
                    <div
                      key={m.name}
                      onClick={() => {
                        onNavigate("models")
                        onClose()
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#00b4d8]" />
                        <span className="font-medium">{m.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#8a97a8]">
                        {m.size} · {m.vram}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Docs */}
          {(searchCategory === "all" || searchCategory === "docs") &&
            docMatches.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-[#5c697a] tracking-wider px-2 mb-1">
                  文档与指南 ({docMatches.length})
                </div>
                <div className="space-y-1">
                  {docMatches.slice(0, 3).map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        onNavigate("docs", { docId: d.id })
                        onClose()
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#8a97a8]" />
                        <span className="truncate">{d.title}</span>
                      </div>
                      <span className="text-[10px] text-[#5c697a] font-mono">
                        {d.readTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#1e2f47] bg-[#0c1a30] flex items-center justify-between text-[11px] text-[#5c697a]">
          <div className="flex items-center gap-2">
            <span>支持全局模糊匹配</span>
            <span>·</span>
            <span>回车直达目标</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.2 rounded bg-[#15294a] border border-[#1e2f47]">
              Esc
            </kbd>
            <span>退出</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
