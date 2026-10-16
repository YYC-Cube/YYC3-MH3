/**
 * file: src/views/ModelsView/parts/WarmupBanner.tsx
 * description: YYC³ 视图分区 — ModelsView 权重预热进度横幅
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[models],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 ModelsView 逐字提取的 CUDA 预热进度横幅 JSX（零重设计）。
 *
 * dependencies: react
 * exports: WarmupBannerProps, WarmupBanner
 */
import React from "react";

export interface WarmupBannerProps {
  warmupProgress: number;
}

export const WarmupBanner: React.FC<WarmupBannerProps> = ({ warmupProgress }) => {
  return (
    <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#00e0b8]/40 space-y-2 animate-in fade-in">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-[#00e0b8]">
          正在执行 CUDA 权重预热与显存常驻加载...
        </span>
        <span className="font-mono text-[#00e0b8] font-bold">{warmupProgress}%</span>
      </div>
      <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#00e0b8] h-full transition-all duration-300"
          style={{ width: `${warmupProgress}%` }}
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
