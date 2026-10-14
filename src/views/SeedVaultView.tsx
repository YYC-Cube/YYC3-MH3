/**
 * file: src/views/SeedVaultView.tsx
 * description: YYC³ 功能视图 — SeedVaultView
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — SeedVaultView
 *
 * dependencies: react, ../types, lucide-react, ../components/common
 * exports: SeedVaultViewProps, SeedVaultView
 */
import {
  History,
  LayoutGrid,
  List,
  Scale,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react"
import React, { useState } from "react"
import { Badge, Button, Drawer, Input, Modal } from "../components/common"
import { generateSeedNumber } from "../domains/seed"
import { NavigateExtra, NavTabId, SeedItem } from "../types"

export interface SeedVaultViewProps {
  seeds: SeedItem[]
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void
  onApplySeedToWorkbench: (seed: SeedItem) => void
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    msg: string,
    sub?: string,
  ) => void
}

export const SeedVaultView: React.FC<SeedVaultViewProps> = ({
  seeds,
  onNavigate,
  onApplySeedToWorkbench,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [selectedSeed, setSelectedSeed] = useState<SeedItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Multi-Seed Compare selection
  const [compareSeedIds, setCompareSeedIds] = useState<string[]>([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  // Breeding modal
  const [isBreedingModalOpen, setIsBreedingModalOpen] = useState(false)
  const [breedingSeed, setBreedingSeed] = useState<SeedItem | null>(null)

  const allTags = [
    "高稳定性",
    "商务正装",
    "低抖动",
    "SyncNet 98%",
    "播音级口型",
    "自然微表情",
    "高饱和面容",
    "古风发簪物理",
  ]

  const filteredSeeds = seeds.filter((s) => {
    if (selectedTier !== "all" && s.tier !== selectedTier) return false
    if (selectedTag !== "all" && !s.tags.includes(selectedTag)) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        String(s.seedNumber).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  const toggleCompareSeed = (id: string) => {
    setCompareSeedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    )
  }

  const handleOpenDetail = (seed: SeedItem) => {
    setSelectedSeed(seed)
    setIsDrawerOpen(true)
  }

  const handleApply = (seed: SeedItem) => {
    onApplySeedToWorkbench(seed)
    onShowToast(
      "success",
      `已应用种子 #${seed.seedNumber}`,
      "参数已无缝载入流水线工作台",
    )
    onNavigate("workbench")
  }

  const handleLaunchBreeding = () => {
    onShowToast(
      "success",
      `已基于 Seed #${breedingSeed?.seedNumber} 启动定向培育`,
      "已生成 6 组探索衍生变异批次",
    )
    setIsBreedingModalOpen(false)
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a1628]">
      {/* Left Tag Management Panel (Requirement 2.1) */}
      <div className="w-56 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0 p-3 space-y-3 select-none">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e2f47]">
          <Tag className="w-4 h-4 text-[#00e0b8]" />
          <span className="text-xs font-semibold text-[#e8f0f8]">
            标签体系分组
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <button
            onClick={() => setSelectedTag("all")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${selectedTag === "all"
              ? "bg-[#00e0b8]/15 text-[#00e0b8] font-semibold"
              : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
              }`}
          >
            <span>全部标签</span>
            <span className="font-mono text-[10px] text-[#5c697a]">
              {seeds.length}
            </span>
          </button>

          {allTags.map((tag) => {
            const count = seeds.filter((s) => s.tags.includes(tag)).length
            const isSelected = selectedTag === tag
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${isSelected
                  ? "bg-[#00e0b8]/15 text-[#00e0b8] font-semibold"
                  : "text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a]"
                  }`}
              >
                <span className="truncate">{tag}</span>
                <span className="font-mono text-[10px] text-[#5c697a]">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#e8f0f8]">
                Seed 种子库全生命周期资产
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#9d7cd8]/15 text-[#9d7cd8] border border-[#9d7cd8]/35 font-mono">
                沉淀优质基因 · 闭环进化
              </span>
            </div>
            <p className="text-xs text-[#8a97a8] mt-1">
              高评分批次自动回写，支持种子培育优化、参数遗传、多 Seed 批量对比与
              A/B 测试
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {compareSeedIds.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={<Scale className="w-3.5 h-3.5" />}
                onClick={() => setIsCompareModalOpen(true)}
              >
                对比已选种子 ({compareSeedIds.length}/3)
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-[#00e0b8]" />}
              onClick={() => {
                const newSeedNum = generateSeedNumber()
                onShowToast(
                  "success",
                  "已生成探索型培育种子",
                  `Seed #${newSeedNum} 已登记入库`,
                )
              }}
            >
              + 培育新种子
            </Button>
          </div>
        </div>

        {/* Filter and View Mode Bar */}
        <div className="p-3 rounded-xl bg-[#0c1a30] border border-[#1e2f47] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97a8]" />
              <input
                type="text"
                placeholder="搜索种子号、名称或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded bg-[#15294a] text-[#e8f0f8] placeholder-[#5c697a] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
              />
            </div>
          </div>

          {/* Tier filter tabs */}
          <div className="flex items-center gap-1 bg-[#15294a] p-0.5 rounded-lg border border-[#1e2f47]">
            {[
              { id: "all", label: "全部" },
              { id: "S", label: "S级 宗师基线" },
              { id: "A", label: "A级 优质" },
              { id: "Experimental", label: "实验变异" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${selectedTier === t.id
                  ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                  : "text-[#8a97a8] hover:text-[#e8f0f8]"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[#15294a] p-0.5 rounded-lg border border-[#1e2f47]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded cursor-pointer ${viewMode === "grid"
                ? "bg-[#0a1628] text-[#00e0b8]"
                : "text-[#8a97a8]"
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded cursor-pointer ${viewMode === "list"
                ? "bg-[#0a1628] text-[#00e0b8]"
                : "text-[#8a97a8]"
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSeeds.map((seed) => {
              const isComparing = compareSeedIds.includes(seed.id)
              return (
                <div
                  key={seed.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between group space-y-3 ${isComparing
                    ? "bg-[#15294a] border-[#00e0b8] shadow-[0_0_16px_rgba(0,224,184,0.2)]"
                    : "bg-[#0c1a30] border-[#1e2f47] hover:border-[#00e0b8]/40"
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isComparing}
                          onChange={() => toggleCompareSeed(seed.id)}
                          className="rounded accent-[#00e0b8] cursor-pointer"
                          title="勾选加入多种子对比"
                        />
                        <span className="font-mono text-sm font-bold text-[#00e0b8]">
                          #{seed.seedNumber}
                        </span>
                        <Badge
                          variant={
                            seed.tier === "S"
                              ? "brand"
                              : seed.tier === "A"
                                ? "info"
                                : "purple"
                          }
                          size="xs"
                        >
                          {seed.tier} 级种子
                        </Badge>
                      </div>
                      <div className="font-mono text-xs font-semibold text-[#e8f0f8] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#00e0b8]" />
                        均分 {seed.avgScore}
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-[#e8f0f8] mb-1">
                      {seed.name}
                    </h3>
                    <p className="text-xs text-[#8a97a8] leading-relaxed line-clamp-2">
                      {seed.notes}
                    </p>

                    {/* Parameters tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {seed.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#15294a] text-[#8a97a8] border border-[#1e2f47]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom stats and action */}
                  <div className="pt-3 border-t border-[#1e2f47]/60 flex items-center justify-between text-xs">
                    <span className="text-[#5c697a]">
                      衍生: {seed.generationCount} 批次
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setBreedingSeed(seed)
                          setIsBreedingModalOpen(true)
                        }}
                      >
                        培育优化
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenDetail(seed)}
                      >
                        基因谱系
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleApply(seed)}
                      >
                        载入工作台
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl bg-[#0c1a30] border border-[#1e2f47] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
                  <th className="py-2.5 px-4">对比</th>
                  <th className="py-2.5 px-4">种子号 / 名称</th>
                  <th className="py-2.5 px-4">评级</th>
                  <th className="py-2.5 px-4">历史均分</th>
                  <th className="py-2.5 px-4">衍生批次</th>
                  <th className="py-2.5 px-4">最近使用</th>
                  <th className="py-2.5 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2f47]/50">
                {filteredSeeds.map((seed) => (
                  <tr
                    key={seed.id}
                    className="hover:bg-[#15294a]/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={compareSeedIds.includes(seed.id)}
                        onChange={() => toggleCompareSeed(seed.id)}
                        className="rounded accent-[#00e0b8] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[#00e0b8] font-bold">
                        #{seed.seedNumber}
                      </span>
                      <span className="text-[#e8f0f8] font-medium ml-2">
                        {seed.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={seed.tier === "S" ? "brand" : "info"}
                        size="xs"
                      >
                        {seed.tier} 级
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#00e0b8]">
                      {seed.avgScore} 分
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8a97a8]">
                      {seed.generationCount} 批
                    </td>
                    <td className="py-3 px-4 text-[#8a97a8]">
                      {seed.lastUsed}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenDetail(seed)}
                        >
                          基因谱系
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleApply(seed)}
                        >
                          载入工作台
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-Seed Batch Compare Modal (Requirement 2.1) */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title={`多 Seed 批量多维横向对比 (${compareSeedIds.length} 组)`}
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-4 gap-3 font-mono">
            <div className="p-2.5 rounded-lg bg-[#0c1a30] text-[#8a97a8] font-bold">
              维度 / 参数项
            </div>
            {compareSeedIds.map((id) => {
              const s = seeds.find((x) => x.id === id)
              if (!s) return null
              return (
                <div
                  key={id}
                  className="p-2.5 rounded-lg bg-[#15294a] text-center border border-[#1e2f47]"
                >
                  <div className="text-[#00e0b8] font-bold">
                    #{s.seedNumber}
                  </div>
                  <div className="text-[11px] text-[#e8f0f8] truncate">
                    {s.name}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-1 font-mono text-xs">
            {[
              { label: "评级 Tier", getter: (s: SeedItem) => `${s.tier} 级` },
              {
                label: "历史综合得分",
                getter: (s: SeedItem) => `${s.avgScore} 分`,
              },
              {
                label: "Guidance Scale (CFG)",
                getter: (s: SeedItem) => s.params.guidanceScale,
              },
              {
                label: "Steps (采样步数)",
                getter: (s: SeedItem) => s.params.steps,
              },
              {
                label: "Denoise Strength",
                getter: (s: SeedItem) => s.params.denoiseStrength,
              },
              {
                label: "CFG LipSync (口型引导)",
                getter: (s: SeedItem) => s.params.cfgLipSync,
              },
              {
                label: "推荐主干模型",
                getter: (s: SeedItem) => s.recommendedModel,
              },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-3 p-2 rounded-lg bg-[#0c1a30] border border-[#1e2f47]/50"
              >
                <span className="text-[#8a97a8] font-medium">{row.label}</span>
                {compareSeedIds.map((id) => {
                  const s = seeds.find((x) => x.id === id)
                  if (!s) return <div key={id}>--</div>
                  return (
                    <div
                      key={id}
                      className="text-center font-bold text-[#e8f0f8]"
                    >
                      {row.getter(s)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Breeding Optimization Configurator Modal */}
      {breedingSeed && (
        <Modal
          isOpen={isBreedingModalOpen}
          onClose={() => setIsBreedingModalOpen(false)}
          title={`Seed #${breedingSeed.seedNumber} 定向培育与变异矩阵`}
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBreedingModalOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLaunchBreeding}
              >
                生成 6 组衍生变异批次
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#8a97a8]">
              围绕「{breedingSeed.name}
              」在潜空间超参领域设置变异扰动范围，批量派生最优子代：
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="变异批次数量" value="6 组" readOnly />
              <Input
                label="扰动范围 (Seed Noise)"
                value="± 1, ± 5, ± 10"
                readOnly
              />
              <Input label="CFG 强度步进" value="0.2 递增" readOnly />
              <Input label="降噪梯度" value="0.60 ~ 0.72" readOnly />
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Drawer with Version History & Rollback */}
      {selectedSeed && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Seed #${selectedSeed.seedNumber} · 基因参数谱系与版本历史`}
          footer={
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsDrawerOpen(false)
                handleApply(selectedSeed)
              }}
            >
              一键应用此 Seed 到流水线工作台
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-[#e8f0f8]">
                  {selectedSeed.name}
                </span>
                <Badge variant={selectedSeed.tier === "S" ? "brand" : "info"}>
                  {selectedSeed.tier} 级基线
                </Badge>
              </div>
              <p className="text-[#8a97a8] leading-relaxed">
                {selectedSeed.notes}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-[#e8f0f8]">
                沉淀特征超参数 (Hyperparameters)
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
                  <span className="text-[#8a97a8]">
                    无分类器引导缩放 (Guidance Scale)
                  </span>
                  <span className="text-[#00e0b8] font-semibold">
                    {selectedSeed.params.guidanceScale}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
                  <span className="text-[#8a97a8]">扩散采样步数 (Steps)</span>
                  <span className="text-[#00e0b8] font-semibold">
                    {selectedSeed.params.steps}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
                  <span className="text-[#8a97a8]">
                    降噪强度 (Denoise Strength)
                  </span>
                  <span className="text-[#00e0b8] font-semibold">
                    {selectedSeed.params.denoiseStrength}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
                  <span className="text-[#8a97a8]">
                    口型 CFG 引导 (CFG LipSync)
                  </span>
                  <span className="text-[#00e0b8] font-semibold">
                    {selectedSeed.params.cfgLipSync}
                  </span>
                </div>
              </div>
            </div>

            {/* Version History & Rollback (Requirement 2.1) */}
            <div className="space-y-2 pt-2 border-t border-[#1e2f47]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e8f0f8]">
                  版本迭代历史与回溯
                </span>
                <History className="w-3.5 h-3.5 text-[#00e0b8]" />
              </div>
              <div className="space-y-2">
                {[
                  {
                    ver: "v3.0 (当前)",
                    date: "2025-04-12",
                    score: 96.8,
                    note: "优化齿音口型对齐，提高抗抖动",
                  },
                  {
                    ver: "v2.1",
                    date: "2025-04-08",
                    score: 94.5,
                    note: "初始权威主播参数定型",
                  },
                  {
                    ver: "v1.0",
                    date: "2025-03-29",
                    score: 91.2,
                    note: "实验性冷启动",
                  },
                ].map((vh, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0c1a30] border border-[#1e2f47] space-y-1"
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-[#00e0b8]">{vh.ver}</span>
                      <span className="text-[#5c697a] text-[10px]">
                        {vh.date} · 均分 {vh.score}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8a97a8]">{vh.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
