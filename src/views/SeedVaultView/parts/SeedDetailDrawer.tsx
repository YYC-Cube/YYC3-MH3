/**
 * file: src/views/SeedVaultView/parts/SeedDetailDrawer.tsx
 * description: YYC³ 视图分区 — SeedVaultView 详情抽屉（基因参数谱系 + 版本迭代历史与回溯）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[drawer],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的详情抽屉 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: SeedDetailDrawerProps, SeedDetailDrawer
 */
import { History } from "lucide-react";
import React from "react";
import { Badge, Button, Drawer } from "../../../components/common";
import { SeedItem } from "../../../types";

export interface SeedDetailDrawerProps {
  selectedSeed: SeedItem;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleApply: (seed: SeedItem) => void;
}

export const SeedDetailDrawer: React.FC<SeedDetailDrawerProps> = ({
  selectedSeed,
  isDrawerOpen,
  setIsDrawerOpen,
  handleApply,
}) => {
  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      title={`Seed #${selectedSeed.seedNumber} · 基因参数谱系与版本历史`}
      footer={
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => {
            setIsDrawerOpen(false);
            handleApply(selectedSeed);
          }}
        >
          一键应用此 Seed 到流水线工作台
        </Button>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-[#e8f0f8]">{selectedSeed.name}</span>
            <Badge variant={selectedSeed.tier === "S" ? "brand" : "info"}>
              {selectedSeed.tier} 级基线
            </Badge>
          </div>
          <p className="text-[#8a97a8] leading-relaxed">{selectedSeed.notes}</p>
        </div>

        <div className="space-y-2">
          <span className="font-semibold text-[#e8f0f8]">沉淀特征超参数 (Hyperparameters)</span>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
              <span className="text-[#8a97a8]">无分类器引导缩放 (Guidance Scale)</span>
              <span className="text-[#00e0b8] font-semibold">
                {selectedSeed.params.guidanceScale}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
              <span className="text-[#8a97a8]">扩散采样步数 (Steps)</span>
              <span className="text-[#00e0b8] font-semibold">{selectedSeed.params.steps}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
              <span className="text-[#8a97a8]">降噪强度 (Denoise Strength)</span>
              <span className="text-[#00e0b8] font-semibold">
                {selectedSeed.params.denoiseStrength}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[#0a1628] border border-[#1e2f47]">
              <span className="text-[#8a97a8]">口型 CFG 引导 (CFG LipSync)</span>
              <span className="text-[#00e0b8] font-semibold">{selectedSeed.params.cfgLipSync}</span>
            </div>
          </div>
        </div>

        {/* Version History & Rollback (Requirement 2.1) */}
        <div className="space-y-2 pt-2 border-t border-[#1e2f47]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#e8f0f8]">版本迭代历史与回溯</span>
            <History className="w-3.5 h-3.5 text-[#00e0b8]" />
          </div>
          <div className="space-y-2">
            {[
              {
                ver: "v3.0 (当前)",
                date: "2025-04-12",
                score: 96.8,
                note: "优化齿音口型对齐，提高抗抖动",
              },
              {
                ver: "v2.1",
                date: "2025-04-08",
                score: 94.5,
                note: "初始权威主播参数定型",
              },
              {
                ver: "v1.0",
                date: "2025-03-29",
                score: 91.2,
                note: "实验性冷启动",
              },
            ].map((vh, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#0c1a30] border border-[#1e2f47] space-y-1"
              >
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-[#00e0b8]">{vh.ver}</span>
                  <span className="text-[#8b949e] text-[10px]">
                    {vh.date} · 均分 {vh.score}
                  </span>
                </div>
                <div className="text-[11px] text-[#8a97a8]">{vh.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
