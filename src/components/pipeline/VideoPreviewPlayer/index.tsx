/**
 * file: src/components/pipeline/VideoPreviewPlayer/index.tsx
 * description: YYC³ 五步闭环流水线组件 — VideoPreviewPlayer 入口容器（播放控制装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.0.2
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 视频预览播放器入口 —— 收敛播放状态单一真值（useVideoPlayback），装配信息条 /
 *        主屏 / 时间轴 / 控制栏；大块屏体 JSX 分别下沉至 parts（PlayerHeader /
 *        VideoScreen / ProgressScrubber / ControlBar）。
 *
 * dependencies: react, ./useVideoPlayback, ./parts/PlayerHeader, ./parts/VideoScreen, ./parts/ProgressScrubber, ./parts/ControlBar
 * exports: VideoPreviewPlayerProps, VideoPreviewPlayer
 */
import React from "react";
import { useVideoPlayback } from "./useVideoPlayback";
import { ControlBar } from "./parts/ControlBar";
import { PlayerHeader } from "./parts/PlayerHeader";
import { ProgressScrubber } from "./parts/ProgressScrubber";
import { VideoScreen } from "./parts/VideoScreen";

export interface VideoPreviewPlayerProps {
  posterUrl?: string;
  batchId?: string;
  seedNumber?: number;
  score?: number;
  onSnapshot?: () => void;
  className?: string;
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  posterUrl = "/placeholders/video-poster.svg",
  batchId = "BATCH-20250412-089",
  seedNumber = 48920194,
  score = 94.6,
  onSnapshot,
  className = "",
}) => {
  const player = useVideoPlayback(onSnapshot);

  return (
    <div
      className={`relative rounded-xl bg-[#0c1a30] border border-[#30363d] overflow-hidden flex flex-col ${className}`}
    >
      <PlayerHeader
        batchId={batchId}
        seedNumber={seedNumber}
        score={score}
        showLipBox={player.showLipBox}
        onToggleLipBox={player.toggleLipBox}
      />

      <VideoScreen
        posterUrl={posterUrl}
        flash={player.flash}
        showLipBox={player.showLipBox}
        isPlaying={player.isPlaying}
        currentFrame={player.currentFrame}
        onPlay={player.play}
      />

      <ProgressScrubber
        progressPercent={player.progressPercent}
        totalFrames={player.totalFrames}
        onScrub={player.setCurrentFrame}
      />

      <ControlBar
        isPlaying={player.isPlaying}
        onTogglePlay={player.togglePlay}
        onStepFrame={player.stepFrame}
        onRewind={player.rewind}
        currentSeconds={player.currentSeconds}
        currentFrame={player.currentFrame}
        totalFrames={player.totalFrames}
        playbackSpeed={player.playbackSpeed}
        onSpeedChange={player.setPlaybackSpeed}
        onSnapshot={player.takeSnapshot}
        isMuted={player.isMuted}
        onToggleMute={player.toggleMute}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
