/**
 * file: src/views/BatchDetailView/parts/MutationPanel.tsx
 * description: YYC³ 功能视图 — BatchDetailView 页签 C · Seed 微变异测试发射器
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[mutation],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 页签 C 一键发起 Seed 参数微变异矩阵（三维度 + 启动队列），
 *        逐字搬移自原 BatchDetailView.tsx（TAB C）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: MutationPanelProps, MutationPanel
 */
import { Zap } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { BatchItem } from "../../../types";

export interface MutationPanelProps {
  currentBatch: BatchItem;
  isGeneratingMutations: boolean;
  onLaunchMutations: () => void;
}

export const MutationPanel: React.FC<MutationPanelProps> = ({
  currentBatch,
  isGeneratingMutations,
  onLaunchMutations,
}) => {
  return (
    <div className="p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-semibold text-[#e8f0f8]">一键发起 Seed 参数微变异矩阵</h3>
        <p className="text-[#8a97a8] mt-1">
          基于当前高分基线 Seed #{currentBatch.seed}
          ，在近邻超参数空间微调，自动批量寻找更优表现点。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1">
          <span className="text-[#8a97a8]">变异维度 1: 种子抖动</span>
          <div className="font-mono text-sm text-[#00e0b8] font-bold">Seed ± 1, ± 10</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1">
          <span className="text-[#8a97a8]">变异维度 2: CFG 阶梯</span>
          <div className="font-mono text-sm text-[#00b4d8] font-bold">Guidance 7.0 / 7.5 / 8.0</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1">
          <span className="text-[#8a97a8]">变异维度 3: 降噪微调</span>
          <div className="font-mono text-sm text-[#9d7cd8] font-bold">
            Denoise 0.60 / 0.65 / 0.70
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-[#1e2f47]/60">
        <span className="text-[#8a97a8]">预计创建 4 组衍生测试批次，预计显存占用 19.4GB</span>
        <Button
          variant="primary"
          size="md"
          icon={<Zap className="w-4 h-4 fill-current" />}
          loading={isGeneratingMutations}
          onClick={onLaunchMutations}
        >
          启动变异测试队列
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
