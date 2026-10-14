/**
 * file: src/components/platform/MediaModule.tsx
 * description: YYC³ 平台组件 — 媒体处理中心模块（多轨时间线/转码/超分/批量导出）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[platform],[media]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 媒体处理中心 — 时间线状态经 props 注入（存视图层跨页签持久）
 *
 * dependencies: react, lucide-react, ../common, ../../types
 * exports: MediaModuleProps, MediaModule
 */
import { Film, Scissors, Volume2 } from "lucide-react"
import { MediaClipItem, ShowToast } from "../../types"
import { Badge, Button, Card } from "../common"

export interface MediaModuleProps {
  clips: MediaClipItem[]
  activeClipId: string
  onSelectClip: (id: string) => void
  /** 时间线游标（秒），总时长 10s */
  playhead: number
  onShowToast: ShowToast
}

/** 时间线总时长（秒）— 游标与片段宽度换算基准 */
const TIMELINE_TOTAL_SEC = 10

export function MediaModule({
  clips,
  activeClipId,
  onSelectClip,
  playhead,
  onShowToast,
}: MediaModuleProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Multi-Track Timeline Editor */}
      <Card
        title="成片时间线多轨剪辑与对齐 (Multi-Track Timeline Editor)"
        subtitle="时间线编辑器 · 多片段裁剪、分割、拼接、转场添加 · 音频声学校准精确到帧"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              icon={<Scissors className="w-3.5 h-3.5" />}
              onClick={() => onShowToast("success", "已对当前游标处进行无损分割")}
            >
              当前帧分割
            </Button>
            <Button
              variant="secondary"
              size="xs"
              icon={<Volume2 className="w-3.5 h-3.5 text-[#00e0b8]" />}
              onClick={() => onShowToast("success", "口型音视频时序重新自对齐完成")}
            >
              口型时序再对齐
            </Button>
            <Button
              variant="primary"
              size="xs"
              icon={<Film className="w-3.5 h-3.5" />}
              onClick={() =>
                onShowToast("success", "成片已合并并输出至 /outputs/merged/")
              }
            >
              一键合并导出
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Timeline Header Ruler */}
          <div className="p-2.5 rounded-lg bg-[#0c1a30] border border-[#1e2f47] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#8a97a8]">当前时间游标:</span>
              <span className="text-[#00e0b8] font-bold text-sm">
                00:04.20 / 00:10.00
              </span>
              <span className="text-[#5c697a]">|</span>
              <span className="text-[#e8f0f8]">126 F / 300 F</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8a97a8]">缩放:</span>
              <span className="px-2 py-0.5 rounded bg-[#15294a] text-[#00e0b8]">
                100% (帧级别)
              </span>
            </div>
          </div>

          {/* Multi-Track Visual Strip */}
          <div className="space-y-2 p-3 rounded-xl bg-[#0c1a30] border border-[#1e2f47] font-mono text-xs">
            {/* Track 1: Video Track */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#8a97a8] flex items-center justify-between font-sans">
                <span className="font-semibold text-[#e8f0f8]">
                  Track 1: 4K 视频画面轨 (Video Track)
                </span>
                <span>1080×1920 @ 30fps</span>
              </div>
              <div className="h-14 rounded-lg bg-[#15294a] border border-[#1e2f47] p-1 flex gap-2 overflow-hidden relative">
                {/* Playhead marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#00e0b8] z-20 shadow-[0_0_8px_rgba(0,224,184,1)]"
                  style={{ left: `${(playhead / TIMELINE_TOTAL_SEC) * 100}%` }}
                />

                {clips.map((clip) => {
                  const isSelected = clip.id === activeClipId
                  const widthPct = (clip.durationSec / TIMELINE_TOTAL_SEC) * 100
                  return (
                    <div
                      key={clip.id}
                      onClick={() => onSelectClip(clip.id)}
                      style={{ width: `${widthPct}%` }}
                      className={`h-full rounded-md border p-1.5 flex flex-col justify-between cursor-pointer transition-all ${isSelected
                        ? "bg-[#00e0b8]/20 border-[#00e0b8] shadow-[0_0_12px_rgba(0,224,184,0.3)]"
                        : "bg-[#0f1f38] border-[#1e2f47] hover:border-[#00e0b8]/40"
                        }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#e8f0f8] font-sans truncate">
                          {clip.name}
                        </span>
                        <span className="text-[#00e0b8]">
                          {clip.durationSec}s
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] px-1 rounded bg-[#0a1628] text-[#8a97a8]">
                          转场: 溶入
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Track 2: Audio Track & Waveform */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-[#8a97a8] flex items-center justify-between font-sans">
                <span className="font-semibold text-[#e8f0f8]">
                  Track 2: 音频音素对齐轨 (Audio Waveform)
                </span>
                <span>48kHz PCM · 嘴型对齐置信度 98.4%</span>
              </div>
              <div className="h-10 rounded-lg bg-[#15294a] border border-[#1e2f47] p-1 flex items-end gap-1 overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#00e0b8] z-20"
                  style={{ left: `${(playhead / TIMELINE_TOTAL_SEC) * 100}%` }}
                />
                {Array.from({ length: 60 }).map((_, i) => {
                  const h = Math.sin(i * 0.4) * 40 + 50
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-[#00b4d8] rounded-t opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Track 3: Subtitle Track */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-[#8a97a8] flex items-center justify-between font-sans">
                <span className="font-semibold text-[#e8f0f8]">
                  Track 3: 口型智能同步字幕轨 (Subtitles)
                </span>
                <button
                  onClick={() => onShowToast("success", "已导出 SRT 字幕文件")}
                  className="text-[#00e0b8] hover:underline cursor-pointer"
                >
                  导出 SRT 文件
                </button>
              </div>
              <div className="h-8 rounded-lg bg-[#15294a] border border-[#1e2f47] p-1 flex gap-2 overflow-hidden text-[10px] text-[#e8f0f8]">
                <div className="w-[35%] bg-[#9d7cd8]/20 border border-[#9d7cd8]/40 rounded px-2 flex items-center truncate">
                  大家好，欢迎收看今日科技前沿早报
                </div>
                <div className="w-[43%] bg-[#9d7cd8]/20 border border-[#9d7cd8]/40 rounded px-2 flex items-center truncate">
                  MiniMax-H3 全闭环流水线展现出优越的推理性能
                </div>
                <div className="w-[22%] bg-[#9d7cd8]/20 border border-[#9d7cd8]/40 rounded px-2 flex items-center truncate">
                  感谢收看，我们下期见
                </div>
              </div>
            </div>
          </div>

          {/* 3 Processing Action Modules: Transcoding, Subtitle, Quality Enhance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e8f0f8]">
                  批量转码引擎 (H.264/H.265)
                </span>
                <Badge variant="brand" size="xs">
                  NVENC 加速
                </Badge>
              </div>
              <p className="text-[#8a97a8] text-[11px]">
                预设全主流平台码率标准，自动生成 4K超清、1080P竖屏与
                720P分发多规格压缩包。
              </p>
              <Button
                variant="secondary"
                size="xs"
                className="w-full"
                onClick={() => onShowToast("success", "转码任务已启动，正在排期")}
              >
                执行批量转码
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e8f0f8]">
                  智能画质超分增强 (Enhance)
                </span>
                <Badge variant="info" size="xs">
                  RealESRGAN
                </Badge>
              </div>
              <p className="text-[#8a97a8] text-[11px]">
                一键针对发丝边缘与皮肤毛孔执行抗锯齿超分辨率重构，面部色彩微调提升通透度。
              </p>
              <Button
                variant="secondary"
                size="xs"
                className="w-full"
                onClick={() =>
                  onShowToast("success", "已为选定片段应用画质增强滤波")
                }
              >
                一键画质增强
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e8f0f8]">
                  批量导出与命名前缀
                </span>
                <Badge variant="brand" size="xs">
                  自定义命名
                </Badge>
              </div>
              <p className="text-[#8a97a8] text-[11px]">
                按 [批次]_[日期]_[渠道] 自动命名，统一打包直传本地 NAS
                或下载。
              </p>
              <Button
                variant="primary"
                size="xs"
                className="w-full"
                onClick={() =>
                  onShowToast("success", "成片已批量导出至 /data/outputs/renders/")
                }
              >
                批量导出多渠道成片
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
