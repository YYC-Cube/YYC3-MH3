/**
 * file: src/views/WorkbenchView/parts/KeyframeStream.tsx
 * description: YYC³ 功能视图 — WorkbenchView 生成中实时抽帧流面板
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 右栏实时抽帧流（5s 抽样关键帧缩略图 + 异常点标记 + 口型分），
 *        逐字搬移自原 WorkbenchView.tsx（Requirement 2.1）。
 *
 * dependencies: react, lucide-react, ../../../types
 * exports: INITIAL_KEYFRAMES, KeyframeStreamProps, KeyframeStream
 */
import { Camera } from "lucide-react";
import React from "react";
import { KeyframePreview } from "../../../types";

/** 实时抽帧流演示快照（视图级 keyframes 状态初始化数据源，逐字沿用原视图常量） */
export const INITIAL_KEYFRAMES: KeyframePreview[] = [
  {
    frameNumber: 15,
    timeSec: 0.5,
    thumbnail: "/placeholders/person.svg",
    lipScore: 96.2,
    expressionScore: 94.0,
  },
  {
    frameNumber: 45,
    timeSec: 1.5,
    thumbnail: "/placeholders/person.svg",
    lipScore: 95.8,
    expressionScore: 93.5,
  },
  {
    frameNumber: 90,
    timeSec: 3.0,
    thumbnail: "/placeholders/person.svg",
    lipScore: 96.5,
    expressionScore: 95.0,
  },
  {
    frameNumber: 142,
    timeSec: 4.7,
    thumbnail: "/placeholders/person.svg",
    lipScore: 94.1,
    expressionScore: 89.2,
    anomaly: "微表情迟滞",
  },
  {
    frameNumber: 195,
    timeSec: 6.5,
    thumbnail: "/placeholders/person.svg",
    lipScore: 97.0,
    expressionScore: 96.1,
  },
  {
    frameNumber: 240,
    timeSec: 8.0,
    thumbnail: "/placeholders/person.svg",
    lipScore: 95.9,
    expressionScore: 94.5,
  },
];

export interface KeyframeStreamProps {
  keyframes: KeyframePreview[];
}

export const KeyframeStream: React.FC<KeyframeStreamProps> = ({ keyframes }) => {
  return (
    <div className="p-3 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#e8f0f8]">
          <Camera className="w-3.5 h-3.5 text-[#00e0b8]" />
          <span>生成中实时抽帧流 (Keyframe Stream)</span>
        </div>
        <span className="font-mono text-[10px] text-[#00e0b8]">5s 抽样</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {keyframes.map((kf) => (
          <div
            key={kf.frameNumber}
            className="w-20 flex-shrink-0 rounded-lg bg-[#15294a] border border-[#1e2f47] overflow-hidden p-1 space-y-1 group hover:border-[#00e0b8]/40 transition-colors cursor-pointer"
          >
            <div className="aspect-square rounded overflow-hidden relative">
              <img
                src={kf.thumbnail}
                alt={`F${kf.frameNumber}`}
                className="w-full h-full object-cover"
              />
              {kf.anomaly && (
                <span
                  className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#ff7a45]"
                  title={kf.anomaly}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono">
              <span className="text-[#8a97a8]">{kf.frameNumber}F</span>
              <span className="text-[#00e0b8]">{kf.lipScore}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
