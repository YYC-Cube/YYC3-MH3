/**
 * file: src/components/pipeline/VideoPreviewPlayer/parts/VideoScreen.tsx
 * description: YYC³ 流水线分区 — VideoPreviewPlayer 主视频屏（海报 + 快门闪光 + SyncNet 唇形框 + 波形）
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
 * brief: 从 VideoPreviewPlayer 主视频屏逐字提取的 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: VideoScreenProps, VideoScreen
 */
import { Play } from "lucide-react";
import React from "react";

export interface VideoScreenProps {
  posterUrl: string;
  flash: boolean;
  showLipBox: boolean;
  isPlaying: boolean;
  currentFrame: number;
  onPlay: () => void;
}

export const VideoScreen: React.FC<VideoScreenProps> = ({
  posterUrl,
  flash,
  showLipBox,
  isPlaying,
  currentFrame,
  onPlay,
}) => {
  return (
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
              height: isPlaying ? `${(h * ((currentFrame % 5) + 3)) / 8}%` : `${h * 0.4}%`,
            }}
          />
        ))}
        <span className="text-[10px] font-mono text-[#8b949e] ml-1.5 self-center">48kHz PCM</span>
      </div>

      {/* Center Play Overlay on hover or paused */}
      {!isPlaying && (
        <button
          onClick={onPlay}
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
