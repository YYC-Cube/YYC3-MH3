/**
 * file: src/views/SeedVaultView/parts/SeedGrid.tsx
 * description: YYC³ 视图分区 — SeedVaultView 网格视图（种子卡片 + 多选对比 + 卡内操作）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[grid],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的网格视图 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../useSeedVaultView
 * exports: SeedGridProps, SeedGrid
 */
import { TrendingUp } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import type { SeedVaultState } from "../useSeedVaultView";

export interface SeedGridProps {
  state: SeedVaultState;
}

export const SeedGrid: React.FC<SeedGridProps> = ({ state }) => {
  const {
    filteredSeeds,
    compareSeedIds,
    toggleCompareSeed,
    handleOpenBreeding,
    handleOpenDetail,
    handleApply,
  } = state;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSeeds.map((seed) => {
        const isComparing = compareSeedIds.includes(seed.id);
        return (
          <div
            key={seed.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between group space-y-3 ${
              isComparing
                ? "bg-[#15294a] border-[#00e0b8] shadow-[0_0_16px_rgba(0,224,184,0.2)]"
                : "bg-[#0c1a30] border-[#1e2f47] hover:border-[#00e0b8]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isComparing}
                    onChange={() => toggleCompareSeed(seed.id)}
                    className="rounded accent-[#00e0b8] cursor-pointer"
                    title="勾选加入多种子对比"
                  />
                  <span className="font-mono text-sm font-bold text-[#00e0b8]">
                    #{seed.seedNumber}
                  </span>
                  <Badge
                    variant={seed.tier === "S" ? "brand" : seed.tier === "A" ? "info" : "purple"}
                    size="xs"
                  >
                    {seed.tier} 级种子
                  </Badge>
                </div>
                <div className="font-mono text-xs font-semibold text-[#e8f0f8] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#00e0b8]" />
                  均分 {seed.avgScore}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[#e8f0f8] mb-1">{seed.name}</h3>
              <p className="text-xs text-[#8a97a8] leading-relaxed line-clamp-2">{seed.notes}</p>

              {/* Parameters tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {seed.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#15294a] text-[#8a97a8] border border-[#1e2f47]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom stats and action */}
            <div className="pt-3 border-t border-[#1e2f47]/60 flex items-center justify-between text-xs">
              <span className="text-[#8b949e]">衍生: {seed.generationCount} 批次</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={() => handleOpenBreeding(seed)}>
                  培育优化
                </Button>
                <Button variant="secondary" size="xs" onClick={() => handleOpenDetail(seed)}>
                  基因谱系
                </Button>
                <Button variant="primary" size="xs" onClick={() => handleApply(seed)}>
                  载入工作台
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
