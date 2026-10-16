/**
 * file: src/views/BatchDetailView/parts/BatchMetaCards.tsx
 * description: YYC³ 功能视图 — BatchDetailView 批次规格概览卡片组（6 项）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[meta],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 批次规格概览卡片组（耗时/评分/规格/显存/权重/设备），
 *        逐字搬移自原 BatchDetailView.tsx。
 *
 * dependencies: react, ../../../types
 * exports: BatchMetaCardsProps, BatchMetaCards
 */
import React from "react";
import { BatchItem } from "../../../types";

export interface BatchMetaCardsProps {
  currentBatch: BatchItem;
}

export const BatchMetaCards: React.FC<BatchMetaCardsProps> = ({ currentBatch }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
      <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
        <span className="text-[#8a97a8]">总推理耗时</span>
        <div className="font-mono text-sm font-bold text-[#e8f0f8] mt-1">
          {currentBatch.duration}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
        <span className="text-[#8a97a8]">综合评分</span>
        <div className="font-mono text-sm font-bold text-[#00e0b8] mt-1">
          {currentBatch.score} 分
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
        <span className="text-[#8a97a8]">输出规格</span>
        <div className="font-mono text-sm font-bold text-[#e8f0f8] mt-1">
          {currentBatch.resolution} @ {currentBatch.fps}fps
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
        <span className="text-[#8a97a8]">显存占用峰值</span>
        <div className="font-mono text-sm font-bold text-[#00b4d8] mt-1">
          {currentBatch.vramUsageGb} GB
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
        <span className="text-[#8a97a8]">模型主干权重</span>
        <div className="font-mono text-[11px] font-semibold text-[#e8f0f8] mt-1 truncate">
          DiffSynth H3 v2.1
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
        <span className="text-[#8a97a8]">本地硬件设备</span>
        <div className="font-mono text-[11px] font-semibold text-[#00e0b8] mt-1">
          CUDA:0 (RTX 4090)
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
