/**
 * file: src/components/pipeline/VideoPreviewPlayer/parts/PlayerHeader.tsx
 * description: YYC³ 流水线分区 — VideoPreviewPlayer 顶部信息条（批次/Seed + 唇形框切换 + 评分）
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
 * brief: 从 VideoPreviewPlayer 顶部信息条逐字提取的 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: PlayerHeaderProps, PlayerHeader
 */
import { Scan } from "lucide-react";
import React from "react";

export interface PlayerHeaderProps {
  batchId: string;
  seedNumber: number;
  score: number;
  showLipBox: boolean;
  onToggleLipBox: () => void;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  batchId,
  seedNumber,
  score,
  showLipBox,
  onToggleLipBox,
}) => {
  return (
    <div className="px-4 py-2.5 bg-[#071425]/90 border-b border-[#30363d] flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
        <span className="font-mono text-[#e6edf3] font-semibold">{batchId}</span>
        <span className="text-[#8b949e]">·</span>
        <span className="font-mono text-[#8b949e]">Seed: {seedNumber}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLipBox}
          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
            showLipBox
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
