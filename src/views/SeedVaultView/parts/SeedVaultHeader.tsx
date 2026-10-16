/**
 * file: src/views/SeedVaultView/parts/SeedVaultHeader.tsx
 * description: YYC³ 视图分区 — SeedVaultView 顶部标题区（标题徽标 + 对比/培育入口按钮）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[header],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的顶部标题区 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: SeedVaultHeaderProps, SeedVaultHeader
 */
import { Scale, Sparkles } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";

export interface SeedVaultHeaderProps {
  compareCount: number;
  onOpenCompare: () => void;
  onGenerateSeed: () => void;
}

export const SeedVaultHeader: React.FC<SeedVaultHeaderProps> = ({
  compareCount,
  onOpenCompare,
  onGenerateSeed,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#e8f0f8]">Seed 种子库全生命周期资产</h1>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#9d7cd8]/15 text-[#9d7cd8] border border-[#9d7cd8]/35 font-mono">
            沉淀优质基因 · 闭环进化
          </span>
        </div>
        <p className="text-xs text-[#8a97a8] mt-1">
          高评分批次自动回写，支持种子培育优化、参数遗传、多 Seed 批量对比与 A/B 测试
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {compareCount > 0 && (
          <Button
            variant="primary"
            size="sm"
            icon={<Scale className="w-3.5 h-3.5" />}
            onClick={onOpenCompare}
          >
            对比已选种子 ({compareCount}/3)
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          icon={<Sparkles className="w-3.5 h-3.5 text-[#00e0b8]" />}
          onClick={onGenerateSeed}
        >
          + 培育新种子
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
