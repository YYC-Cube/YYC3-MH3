/**
 * file: src/components/pipeline/VideoPreviewPlayer/parts/ProgressScrubber.tsx
 * description: YYC³ 流水线分区 — VideoPreviewPlayer 进度时间轴拖拽定位条
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
 * brief: 从 VideoPreviewPlayer 进度时间轴逐字提取的 JSX（零重设计）。
 *
 * dependencies: react
 * exports: ProgressScrubberProps, ProgressScrubber
 */
import React from "react";

export interface ProgressScrubberProps {
  progressPercent: number;
  totalFrames: number;
  onScrub: (frame: number) => void;
}

export const ProgressScrubber: React.FC<ProgressScrubberProps> = ({ progressPercent, totalFrames, onScrub }) => {
  return (
    <div className="px-4 pt-3 pb-1 bg-[#0c1a30]">
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          onScrub(Math.floor(clickPos * totalFrames));
        }}
        className="relative w-full h-1.5 bg-[#122340] rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
      >
        <div
          className="h-full bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
