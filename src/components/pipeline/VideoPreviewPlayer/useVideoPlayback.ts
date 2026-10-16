/**
 * file: src/components/pipeline/VideoPreviewPlayer/useVideoPlayback.ts
 * description: YYC³ 流水线组件状态 — VideoPreviewPlayer 播放控制器（帧推进 / 倍速 / 静音 / 唇形框 / 截图）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[hook],[state],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: VideoPreviewPlayer 唯一状态真值源 —— 从原组件逐字提取的播放状态、定时器、
 *        快捷键与事件编排，零重设计。
 *
 * dependencies: react
 * exports: VideoPlaybackController, useVideoPlayback
 */
import { useEffect, useRef, useState } from "react";

/** VideoPreviewPlayer 播放控制器的完整装配面 */
export interface VideoPlaybackController {
  isPlaying: boolean;
  play: () => void;
  togglePlay: () => void;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  totalFrames: number;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  showLipBox: boolean;
  toggleLipBox: () => void;
  flash: boolean;
  stepFrame: (delta: number) => void;
  rewind: () => void;
  takeSnapshot: () => void;
  progressPercent: number;
  currentSeconds: string;
}

export function useVideoPlayback(onSnapshot?: () => void): VideoPlaybackController {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(142);
  const totalFrames = 300;
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLipBox, setShowLipBox] = useState(true);
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Playback timer simulation
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / (30 * playbackSpeed);
      timerRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= totalFrames) return 1;
          return prev + 1;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Space key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const stepFrame = (delta: number) => {
    setIsPlaying(false);
    setCurrentFrame((prev) => Math.max(1, Math.min(totalFrames, prev + delta)));
  };

  const takeSnapshot = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    onSnapshot?.();
  };

  const progressPercent = (currentFrame / totalFrames) * 100;
  const currentSeconds = (currentFrame / 30).toFixed(1);

  return {
    isPlaying,
    play: () => setIsPlaying(true),
    togglePlay: () => setIsPlaying((p) => !p),
    currentFrame,
    setCurrentFrame,
    totalFrames,
    playbackSpeed,
    setPlaybackSpeed,
    isMuted,
    toggleMute: () => setIsMuted((p) => !p),
    showLipBox,
    toggleLipBox: () => setShowLipBox((p) => !p),
    flash,
    stepFrame,
    rewind: () => setCurrentFrame(1),
    takeSnapshot,
    progressPercent,
    currentSeconds,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
