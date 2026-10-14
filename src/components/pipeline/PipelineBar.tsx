/**
 * file: src/components/pipeline/PipelineBar.tsx
 * description: YYC³ 五步闭环流水线组件 — PipelineBar
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[pipeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 五步闭环流水线组件 — PipelineBar
 *
 * dependencies: react, ../../types, lucide-react
 * exports: PipelineBarProps, STAGES, PipelineBar
 */
import {
  Activity,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  Dna,
  Sparkles,
} from "lucide-react"
import React from "react"
import { getStageIndex } from "../../domains/pipeline"
import { PipelineStageKey } from "../../types"

export interface PipelineBarProps {
  currentStage: PipelineStageKey
  progress: number // 0 - 100
  isRunning?: boolean
  onStageClick?: (stage: PipelineStageKey) => void
  className?: string
}

export const STAGES: {
  key: PipelineStageKey
  label: string
  sub: string
  icon: React.ReactNode
  metricLabel: string
}[] = [
    {
      key: "generation",
      label: "1. 神经渲染",
      sub: "DiffSynth H3 扩散采样",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      metricLabel: "30 Steps / FP8",
    },
    {
      key: "scoring",
      label: "2. 口型初评",
      sub: "SyncNet 唇形音素对齐",
      icon: <Activity className="w-3.5 h-3.5" />,
      metricLabel: "误差 <0.05s",
    },
    {
      key: "fine_eval",
      label: "3. 多模精评",
      sub: "表情/时序连续性5维",
      icon: <BarChart2 className="w-3.5 h-3.5" />,
      metricLabel: "5维雷达评分",
    },
    {
      key: "analysis",
      label: "4. 缺陷归因",
      sub: "关键帧特征聚类排障",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      metricLabel: "参数灵敏度",
    },
    {
      key: "seed_iter",
      label: "5. Seed 迭代",
      sub: "优质基因回写种子库",
      icon: <Dna className="w-3.5 h-3.5" />,
      metricLabel: "闭环进化",
    },
  ]

export const PipelineBar: React.FC<PipelineBarProps> = ({
  currentStage,
  progress,
  isRunning = true,
  onStageClick,
  className = "",
}) => {
  // 阶段顺序与索引由领域层单一事实来源提供
  const currentIndex = getStageIndex(currentStage)

  return (
    <div
      className={`p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
          <span className="text-xs font-semibold text-[#e6edf3] tracking-wide uppercase">
            五步闭环生产流水线
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00d4aa]/15 text-[#00d4aa] font-mono border border-[#00d4aa]/30">
            {isRunning ? "RUNNING · SSE 实时流" : "PAUSED"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#8b949e]">总进度:</span>
          <span className="font-mono text-sm font-semibold text-[#00d4aa]">
            {progress}%
          </span>
        </div>
      </div>

      {/* Main horizontal flow */}
      <div className="relative grid grid-cols-5 gap-2 pt-2 pb-1">
        {STAGES.map((st, idx) => {
          const isCurrent = st.key === currentStage
          const isDone =
            idx < currentIndex || (progress === 100 && idx <= currentIndex)

          return (
            <div
              key={st.key}
              onClick={() => onStageClick && onStageClick(st.key)}
              className={`relative flex flex-col p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${isCurrent
                ? "bg-[#122340] border-[#00d4aa] shadow-[0_0_16px_rgba(0,212,170,0.25)]"
                : isDone
                  ? "bg-[#0c1a30]/80 border-[#30363d] hover:border-[#00d4aa]/40"
                  : "bg-[#071425]/40 border-[#30363d]/50 opacity-60 hover:opacity-85"
                }`}
            >
              {/* Connector line for active/completed */}
              {idx < STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-[2px] z-10 pointer-events-none">
                  <div
                    className={`h-full w-full ${idx < currentIndex
                      ? "bg-[#00d4aa]"
                      : idx === currentIndex
                        ? "bg-gradient-to-r from-[#00d4aa] to-[#30363d]"
                        : "bg-[#30363d]"
                      }`}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${isCurrent
                    ? "bg-[#00d4aa] text-[#071425] shadow-sm animate-pulse"
                    : isDone
                      ? "bg-[#00d4aa]/20 text-[#00d4aa]"
                      : "bg-[#122340] text-[#8b949e]"
                    }`}
                >
                  {isDone && !isCurrent ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    st.icon
                  )}
                </span>
                <span className="text-[10px] font-mono text-[#8b949e]">
                  {isCurrent ? (
                    <span className="text-[#00d4aa] font-semibold animate-pulse">
                      进行中
                    </span>
                  ) : isDone ? (
                    <span className="text-[#00d4aa]">已完成</span>
                  ) : (
                    "等待中"
                  )}
                </span>
              </div>

              <div className="text-xs font-medium text-[#e6edf3] truncate mb-0.5">
                {st.label}
              </div>
              <div className="text-[11px] text-[#8b949e] truncate">
                {st.sub}
              </div>

              {/* Progress micro-bar inside card */}
              <div className="mt-2 w-full bg-[#071425] h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isCurrent
                    ? "bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] pipeline-flowing"
                    : isDone
                      ? "bg-[#00d4aa]"
                      : "bg-transparent"
                    }`}
                  style={{
                    width: isCurrent
                      ? `${((progress % 20) / 20) * 100 || 60}%`
                      : isDone
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
