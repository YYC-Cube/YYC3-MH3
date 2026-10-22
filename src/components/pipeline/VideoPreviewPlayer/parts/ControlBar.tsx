/**
 * file: src/components/pipeline/VideoPreviewPlayer/parts/ControlBar.tsx
 * description: YYC³ 流水线分区 — VideoPreviewPlayer 控制栏（播放/逐帧/复位 + 倍速/截图/静音）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[part],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 VideoPreviewPlayer 控制栏逐字提取的 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: ControlBarProps, ControlBar
 */
import { Camera, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import React from "react";

export interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepFrame: (delta: number) => void;
  onRewind: () => void;
  currentSeconds: string;
  currentFrame: number;
  totalFrames: number;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onSnapshot: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStepFrame,
  onRewind,
  currentSeconds,
  currentFrame,
  totalFrames,
  playbackSpeed,
  onSpeedChange,
  onSnapshot,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="px-4 py-3 bg-[#0c1a30] flex items-center justify-between text-xs">
      {/* Left controls: Play/pause, step */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-lg bg-[#122340] hover:bg-[#182e54] text-[#e6edf3] hover:text-[#00d4aa] flex items-center justify-center border border-[#30363d] transition-colors cursor-pointer"
          title="播放/暂停 (Space)"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => onStepFrame(-1)}
          className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
          title="后退一帧"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onStepFrame(1)}
          className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
          title="前进一帧"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onRewind}
          className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
          title="重头开始"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Time & Frame counter */}
        <div className="font-mono text-[11px] text-[#8b949e] ml-2 flex items-center gap-1.5">
          <span className="text-[#e6edf3] font-semibold">{currentSeconds}s</span>
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
              onClick={() => onSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                playbackSpeed === s ? "bg-[#00d4aa] text-[#071425] font-bold" : "text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Snapshot button */}
        <button
          onClick={onSnapshot}
          className="px-2.5 py-1.5 rounded-lg bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#00d4aa] border border-[#30363d] flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
          title="捕获当前帧为关键样张"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>截图样张</span>
        </button>

        {/* Mute toggle */}
        <button
          onClick={onToggleMute}
          className="p-1.5 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
