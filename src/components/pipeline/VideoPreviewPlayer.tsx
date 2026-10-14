/**
 * file: src/components/pipeline/VideoPreviewPlayer.tsx
 * description: YYC³ 五步闭环流水线组件 — VideoPreviewPlayer
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
 * brief: YYC³ 五步闭环流水线组件 — VideoPreviewPlayer
 *
 * dependencies: react, lucide-react
 * exports: VideoPreviewPlayerProps, VideoPreviewPlayer
 */
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Scan,
  Volume2,
  VolumeX,
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

export interface VideoPreviewPlayerProps {
  posterUrl?: string
  batchId?: string
  seedNumber?: number
  score?: number
  onSnapshot?: () => void
  className?: string
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  posterUrl = "/placeholders/video-poster.svg",
  batchId = "BATCH-20250412-089",
  seedNumber = 48920194,
  score = 94.6,
  onSnapshot,
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(142)
  const totalFrames = 300
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)
  const [showLipBox, setShowLipBox] = useState(true)
  const [flash, setFlash] = useState(false)
  const timerRef = useRef<number | null>(null)

  // Playback timer simulation
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / (30 * playbackSpeed)
      timerRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= totalFrames) return 1
          return prev + 1
        })
      }, interval)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, playbackSpeed])

  // Space key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault()
        setIsPlaying((p) => !p)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const handleStepFrame = (delta: number) => {
    setIsPlaying(false)
    setCurrentFrame((prev) => Math.max(1, Math.min(totalFrames, prev + delta)))
  }

  const handleTakeSnapshot = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    onSnapshot?.()
  }

  const progressPercent = (currentFrame / totalFrames) * 100
  const currentSeconds = (currentFrame / 30).toFixed(1)

  return (
    <div
      className={`relative rounded-xl bg-[#0c1a30] border border-[#30363d] overflow-hidden flex flex-col ${className}`}
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#071425]/90 border-b border-[#30363d] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
          <span className="font-mono text-[#e6edf3] font-semibold">
            {batchId}
          </span>
          <span className="text-[#8b949e]">·</span>
          <span className="font-mono text-[#8b949e]">Seed: {seedNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLipBox((p) => !p)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${showLipBox
              ? "bg-[#00d4aa]/20 border-[#00d4aa] text-[#00d4aa]"
              : "bg-[#122340] border-[#30363d] text-[#8b949e]"
              }`}
          >
            <Scan className="w-3 h-3" />
            SyncNet 唇形框
          </button>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#122340] text-[#00d4aa] border border-[#30363d]">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Main Video Screen */}
      <div className="relative aspect-video w-full bg-[#071425] overflow-hidden flex items-center justify-center select-none group">
        <img
          src={posterUrl}
          alt="AI Digital Human Preview"
          className="w-full h-full object-cover filter brightness-95"
        />

        {/* Shutter flash effect */}
        {flash && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none transition-opacity" />
        )}

        {/* SyncNet HUD bounding box simulation */}
        {showLipBox && (
          <div className="absolute top-[48%] left-[44%] w-[12%] h-[12%] border border-[#00d4aa] rounded shadow-[0_0_8px_rgba(0,212,170,0.6)] pointer-events-none transition-all duration-75">
            <span className="absolute -top-4 left-0 text-[9px] font-mono bg-[#071425]/80 text-[#00d4aa] px-1 rounded">
              LIP: 95.8%
            </span>
          </div>
        )}

        {/* Audio waveform simulator overlay */}
        <div className="absolute bottom-3 left-4 flex items-end gap-1 h-6 pointer-events-none">
          {[40, 75, 90, 60, 30, 85, 95, 60, 40, 70, 85, 50].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[#00d4aa]/80 rounded-t transition-all duration-150"
              style={{
                height: isPlaying
                  ? `${(h * ((currentFrame % 5) + 3)) / 8}%`
                  : `${h * 0.4}%`,
              }}
            />
          ))}
          <span className="text-[10px] font-mono text-[#8b949e] ml-1.5 self-center">
            48kHz PCM
          </span>
        </div>

        {/* Center Play Overlay on hover or paused */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#071425]/80 border border-[#00d4aa] text-[#00d4aa] flex items-center justify-center backdrop-blur-md shadow-[0_0_24px_rgba(0,212,170,0.4)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </button>
        )}

        {/* Top-Right HUD stats */}
        <div className="absolute top-3 right-3 bg-[#071425]/80 backdrop-blur-md border border-[#30363d] px-2.5 py-1 rounded text-[11px] font-mono text-[#8b949e] flex items-center gap-2 pointer-events-none">
          <span className="text-[#00d4aa] font-semibold">30 FPS</span>
          <span>·</span>
          <span>1080×1920</span>
        </div>
      </div>

      {/* Progress timeline scrubber */}
      <div className="px-4 pt-3 pb-1 bg-[#0c1a30]">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickPos = (e.clientX - rect.left) / rect.width
            setCurrentFrame(Math.floor(clickPos * totalFrames))
          }}
          className="relative w-full h-1.5 bg-[#122340] rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
        >
          <div
            className="h-full bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-4 py-3 bg-[#0c1a30] flex items-center justify-between text-xs">
        {/* Left controls: Play/pause, step */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="w-8 h-8 rounded-lg bg-[#122340] hover:bg-[#182e54] text-[#e6edf3] hover:text-[#00d4aa] flex items-center justify-center border border-[#30363d] transition-colors cursor-pointer"
            title="播放/暂停 (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => handleStepFrame(-1)}
            className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
            title="后退一帧"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStepFrame(1)}
            className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
            title="前进一帧"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentFrame(1)}
            className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
            title="重头开始"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Time & Frame counter */}
          <div className="font-mono text-[11px] text-[#8b949e] ml-2 flex items-center gap-1.5">
            <span className="text-[#e6edf3] font-semibold">
              {currentSeconds}s
            </span>
            <span>/</span>
            <span>10.0s</span>
            <span className="text-[#30363d]">|</span>
            <span className="text-[#00d4aa]">
              {String(currentFrame).padStart(4, "0")}/{totalFrames}F
            </span>
          </div>
        </div>

        {/* Right controls: Speed, Mute, Snapshot */}
        <div className="flex items-center gap-2">
          {/* Speed switcher */}
          <div className="flex items-center bg-[#122340] rounded border border-[#30363d] p-0.5">
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${playbackSpeed === s
                  ? "bg-[#00d4aa] text-[#071425] font-bold"
                  : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Snapshot button */}
          <button
            onClick={handleTakeSnapshot}
            className="px-2.5 py-1.5 rounded-lg bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#00d4aa] border border-[#30363d] flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            title="捕获当前帧为关键样张"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>截图样张</span>
          </button>

          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted((p) => !p)}
            className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
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
