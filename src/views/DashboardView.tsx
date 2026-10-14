/**
 * file: src/views/DashboardView.tsx
 * description: YYC³ 功能视图 — DashboardView
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
 * brief: YYC³ 功能视图 — DashboardView
 *
 * dependencies: react, ../types, lucide-react, ../components/common
 * exports: DashboardViewProps, DashboardView
 */
import {
  ArrowUpRight,
  ChevronRight,
  Cpu,
  RotateCcw,
  Search,
  ShieldAlert,
  Tv,
  Wrench,
} from "lucide-react"
import React, { useState } from "react"
import { Badge, Button, Card, Modal } from "../components/common"
import { BatchItem, NavigateExtra, NavTabId } from "../types"

export interface DashboardViewProps {
  batches: BatchItem[]
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void
  onNewBatchClick: () => void
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    msg: string,
    sub?: string,
  ) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  onNavigate,
  onNewBatchClick,
  onShowToast,
}) => {
  const [isBigScreenMode, setIsBigScreenMode] = useState(false)
  const [trendPeriod] = useState<"weekly" | "monthly">("weekly")
  const [filterQuery, setFilterQuery] = useState("")
  const [statusFilter] = useState<string>("all")
  const [isHwModalOpen, setIsHwModalOpen] = useState(false)

  const filteredBatches = batches.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false
    if (filterQuery) {
      const q = filterQuery.toLowerCase()
      return b.id.toLowerCase().includes(q) || b.name.toLowerCase().includes(q)
    }
    return true
  })

  const getStatusBadge = (status: BatchItem["status"]) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="brand" pulse>
            运行中
          </Badge>
        )
      case "completed":
        return <Badge variant="brand">已完成</Badge>
      case "failed":
        return <Badge variant="danger">异常终止</Badge>
      case "queued":
        return <Badge variant="warning">等待调度</Badge>
      default:
        return <Badge variant="neutral">已暂停</Badge>
    }
  }

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628] transition-all duration-300 ${isBigScreenMode ? "max-w-none p-8" : ""
        }`}
    >
      {/* Top Welcome & Big Screen Mode Toggle (Requirement 2.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`font-bold text-[#e8f0f8] tracking-tight ${isBigScreenMode ? "text-2xl" : "text-xl"
                }`}
            >
              总览驾驶舱 · Executive Cockpit
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono shadow-[0_0_8px_rgba(0,224,184,0.2)]">
              7×24H 生产中枢在线
            </span>
          </div>
          <p className="text-xs text-[#8a97a8] mt-1">
            实时汇总 MiniMax-H3 推理管线性能、SyncNet 评分闭环与本地硬件负载
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Big screen projection mode switcher */}
          <Button
            variant={isBigScreenMode ? "primary" : "secondary"}
            size="sm"
            icon={<Tv className="w-3.5 h-3.5" />}
            onClick={() => {
              setIsBigScreenMode((p) => !p)
              onShowToast(
                "info",
                isBigScreenMode
                  ? "已退出大屏投屏模式"
                  : "已切换至 2K/4K 生产大屏模式",
              )
            }}
          >
            {isBigScreenMode ? "退出大屏视角" : "大屏投屏模式 (2K/4K)"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Wrench className="w-3.5 h-3.5 text-[#00e0b8]" />}
            onClick={() => {
              onShowToast(
                "success",
                "显存整理完成",
                "已清理 2.8GB 冗余激活值缓存",
              )
            }}
          >
            一键显存整理
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Cpu className="w-4 h-4" />}
            onClick={() => onNavigate("workbench")}
          >
            进入流水线工作台
          </Button>
        </div>
      </div>

      {/* Global Alarm Aggregation Banner with Pulsing Border */}
      <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#ff7a45]/50 flex items-center justify-between gap-4 text-xs animate-in fade-in shadow-[0_0_16px_rgba(255,122,69,0.12)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7a45] opacity-50" />
            <ShieldAlert className="w-5 h-5 text-[#ff7a45] flex-shrink-0" />
          </div>
          <div>
            <span className="font-semibold text-[#e8f0f8]">
              全局告警聚合提示：
            </span>
            <span className="text-[#8a97a8]">
              检测到 1 处瞬时显存超标警告 (批次 086 峰值
              22.8GB)，已由看门狗降级保护。
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="danger" size="xs" onClick={() => onNavigate("ops")}>
            下钻运维自愈大屏
          </Button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards with Glowing Micro-Numbers & Gradient Area Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8a97a8]">
            <span>
              产出批次总数 ({trendPeriod === "weekly" ? "本周" : "本月"})
            </span>
            <span className="text-[#00e0b8] flex items-center font-mono">
              +18.4%
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#e8f0f8] font-mono drop-shadow-[0_0_12px_rgba(0,224,184,0.4)]">
              128
            </span>
            <span className="text-xs text-[#8a97a8]">批次</span>
          </div>
          {/* SVG Gradient Area Sparkline */}
          <div className="mt-3 h-8 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e0b8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00e0b8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 20 Q 25 15, 50 10 T 100 4 L 100 24 L 0 24 Z"
                fill="url(#grad1)"
              />
              <path
                d="M 0 20 Q 25 15, 50 10 T 100 4"
                fill="none"
                stroke="#00e0b8"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8a97a8]">
            <span>流水线达标率</span>
            <span className="text-[#00e0b8] flex items-center font-mono">
              +0.4%
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#00e0b8] font-mono drop-shadow-[0_0_12px_rgba(0,224,184,0.5)]">
              98.6%
            </span>
            <span className="text-xs text-[#8a97a8]">≥85分达标</span>
          </div>
          <div className="mt-3 h-8 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 18 Q 30 14, 60 8 T 100 5 L 100 24 L 0 24 Z"
                fill="url(#grad2)"
              />
              <path
                d="M 0 18 Q 30 14, 60 8 T 100 5"
                fill="none"
                stroke="#00b4d8"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8a97a8]">
            <span>平均单批推理耗时</span>
            <span className="text-[#00e0b8] flex items-center font-mono">
              -6.2s
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#e8f0f8] font-mono drop-shadow-[0_0_12px_rgba(157,124,216,0.35)]">
              42.8s
            </span>
            <span className="text-xs text-[#8a97a8]">/ 10s 4K</span>
          </div>
          <div className="mt-3 h-8 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9d7cd8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#9d7cd8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 6 Q 35 12, 70 16 T 100 20 L 100 24 L 0 24 Z"
                fill="url(#grad3)"
              />
              <path
                d="M 0 6 Q 35 12, 70 16 T 100 20"
                fill="none"
                stroke="#9d7cd8"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] card-running-shimmer transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8a97a8]">
            <span>显存负载 (RTX 4090)</span>
            <span className="text-[#00e0b8] font-mono">80.8%</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#00e0b8] font-mono drop-shadow-[0_0_12px_rgba(0,224,184,0.4)]">
              19.4
            </span>
            <span className="text-xs text-[#8a97a8]">/ 24.0 GB</span>
          </div>
          <div className="mt-3 w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#00e0b8] to-[#00b4d8] h-full"
              style={{ width: "80.8%" }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: 5-Node Closed-Loop Flow & Hardware Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Closed-loop task funnel flow */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#e8f0f8]">
                五步闭环生产流水线 · 实时吞吐流转图
              </h2>
              <p className="text-xs text-[#8a97a8]">
                任务从生成至 Seed 基因回写的端到端自动化漏斗
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => onNavigate("workbench")}
              >
                流水线看板
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {[
              {
                step: "01",
                title: "神经渲染",
                num: "1,420",
                unit: "片段",
                pass: "100%",
                color: "border-[#00e0b8]",
              },
              {
                step: "02",
                title: "口型初评",
                num: "1,392",
                unit: "片段",
                pass: "98.0%",
                color: "border-[#00e0b8]",
              },
              {
                step: "03",
                title: "多模精评",
                num: "840",
                unit: "优质",
                pass: "92.4分",
                color: "border-[#00b4d8]",
              },
              {
                step: "04",
                title: "缺陷归因",
                num: "420",
                unit: "聚类",
                pass: "敏感度高",
                color: "border-[#9d7cd8]",
              },
              {
                step: "05",
                title: "Seed 回写",
                num: "64",
                unit: "S级种子",
                pass: "闭环进化",
                color: "border-[#00e0b8]",
              },
            ].map((node, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl bg-[#15294a]/60 border-l-2 ${node.color} border border-[#1e2f47] space-y-2 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#5c697a]">
                  <span>STAGE {node.step}</span>
                  <span className="text-[#00e0b8] font-mono font-bold">
                    {node.pass}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#e8f0f8]">
                  {node.title}
                </div>
                <div className="font-mono text-lg font-bold text-[#e8f0f8]">
                  {node.num}{" "}
                  <span className="text-[10px] text-[#8a97a8] font-normal">
                    {node.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2f47]/60 flex items-center justify-between text-xs text-[#8a97a8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00e0b8] animate-ping" />
              <span>闭环状态：今日已反哺回写 64 组高置信度种子基因</span>
            </div>
            <button
              onClick={() => onNavigate("seed")}
              className="text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              查看种子库 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Local Hardware Live Meters with Modal Drilldown */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#e8f0f8]">
              本地硬件算力负载
            </h2>
            <button
              onClick={() => setIsHwModalOpen(true)}
              className="text-[11px] text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              全屏监控大图 →
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-[#8a97a8] mb-1">
                <span>GPU 核心利用率 (RTX 4090)</span>
                <span className="font-mono text-[#00e0b8] font-bold">91%</span>
              </div>
              <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00e0b8] h-full shadow-[0_0_8px_rgba(0,224,184,0.6)]"
                  style={{ width: "91%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#8a97a8] mb-1">
                <span>显存占用 (FP8 缓冲已启用)</span>
                <span className="font-mono text-[#00b4d8] font-bold">
                  19.4 / 24.0 GB
                </span>
              </div>
              <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00b4d8] h-full shadow-[0_0_8px_rgba(0,180,216,0.6)]"
                  style={{ width: "80.8%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#8a97a8] mb-1">
                <span>系统内存 (DDR5 64GB)</span>
                <span className="font-mono text-[#e8f0f8] font-semibold">
                  26.2 / 64.0 GB
                </span>
              </div>
              <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#9d7cd8] h-full"
                  style={{ width: "40.9%" }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between text-[11px] text-[#5c697a]">
            <span>看门狗探活周期: 1000ms</span>
            <button
              onClick={() => onNavigate("ops")}
              className="text-[#00b4d8] hover:underline cursor-pointer"
            >
              运维大屏 →
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Batches Table with Search & Status Filters */}
      <Card
        title="近期批次任务列表 (Recent Batches)"
        subtitle="按创建时间倒序排列 · 支持快速检索与状态筛选"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97a8]" />
              <input
                type="text"
                placeholder="筛选批次ID/名称..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-36 sm:w-44 h-7 pl-8 pr-2 rounded bg-[#15294a] text-xs text-[#e8f0f8] placeholder-[#5c697a] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
              />
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate("nightly")}
            >
              夜间批量
            </Button>
            <Button variant="primary" size="xs" onClick={onNewBatchClick}>
              + 新建批次
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
                <th className="py-2.5 px-3">批次ID / 任务名称</th>
                <th className="py-2.5 px-3">模式</th>
                <th className="py-2.5 px-3">Seed 种子</th>
                <th className="py-2.5 px-3">状态 / 阶段</th>
                <th className="py-2.5 px-3">耗时 / 分辨率</th>
                <th className="py-2.5 px-3">5维评分</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2f47]/50">
              {filteredBatches.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-[#15294a]/40 transition-colors group cursor-pointer"
                  onClick={() => onNavigate("workbench", { batchId: b.id })}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#0a1628] border border-[#1e2f47] overflow-hidden flex-shrink-0">
                        <img
                          src={b.previewThumbnail}
                          alt={b.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-mono text-[#00e0b8] font-semibold text-xs group-hover:underline">
                          {b.id}
                        </div>
                        <div className="text-[#e8f0f8] font-medium truncate max-w-xs">
                          {b.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono px-2 py-0.5 rounded bg-[#15294a] text-[#00b4d8] border border-[#1e2f47]">
                      {b.mode}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[#e8f0f8]">{b.seed}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(b.status)}
                      <span className="text-[11px] text-[#8a97a8] font-mono">
                        {b.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono text-[#e8f0f8]">{b.duration}</div>
                    <div className="text-[11px] text-[#8a97a8]">
                      {b.resolution} · {b.fps}fps
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {b.score > 0 ? (
                      <span
                        className={`font-mono font-bold text-xs ${b.score >= 90
                          ? "text-[#00e0b8]"
                          : b.score >= 80
                            ? "text-[#00b4d8]"
                            : "text-[#ff7a45]"
                          }`}
                      >
                        {b.score} 分
                      </span>
                    ) : (
                      <span className="text-[#5c697a]">--</span>
                    )}
                  </td>
                  <td
                    className="py-3 px-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() =>
                          onNavigate("batch-detail", { batchId: b.id })
                        }
                      >
                        复盘
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          onShowToast("info", `已加入重跑队列: ${b.id}`)
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 24-Hour Detailed Curve Modal */}
      <Modal
        isOpen={isHwModalOpen}
        onClose={() => setIsHwModalOpen(false)}
        title="24小时本地算力与显存详细时序监控大图"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="flex justify-between text-[#8a97a8]">
            <span>RTX 4090 显存波动走势</span>
            <span className="text-[#00e0b8]">峰值 22.8 GB · 均值 18.2 GB</span>
          </div>
          <div className="h-44 w-full bg-[#15294a] rounded-xl p-3 flex items-end gap-2 border border-[#1e2f47]">
            {[14, 18, 22.8, 16.8, 21.2, 17.5, 19.4].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#00e0b8] font-bold">
                  {v}G
                </span>
                <div
                  className="w-full bg-gradient-to-t from-[#00b4d8] to-[#00e0b8] rounded-t"
                  style={{ height: `${(v / 24) * 100}%` }}
                />
                <span className="text-[9px] text-[#8a97a8]">0{i + 1}:00</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
