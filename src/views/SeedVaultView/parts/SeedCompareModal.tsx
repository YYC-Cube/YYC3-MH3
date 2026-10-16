/**
 * file: src/views/SeedVaultView/parts/SeedCompareModal.tsx
 * description: YYC³ 视图分区 — SeedVaultView 多 Seed 批量多维横向对比弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[compare],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的多 Seed 对比弹窗 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types
 * exports: SeedCompareModalProps, SeedCompareModal
 */
import React from "react";
import { Modal } from "../../../components/common";
import { SeedItem } from "../../../types";

export interface SeedCompareModalProps {
  seeds: SeedItem[];
  compareSeedIds: string[];
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SeedCompareModal: React.FC<SeedCompareModalProps> = ({
  seeds,
  compareSeedIds,
  isCompareModalOpen,
  setIsCompareModalOpen,
}) => {
  return (
    <Modal
      isOpen={isCompareModalOpen}
      onClose={() => setIsCompareModalOpen(false)}
      title={`多 Seed 批量多维横向对比 (${compareSeedIds.length} 组)`}
      maxWidth="4xl"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-4 gap-3 font-mono">
          <div className="p-2.5 rounded-lg bg-[#0c1a30] text-[#8a97a8] font-bold">
            维度 / 参数项
          </div>
          {compareSeedIds.map((id) => {
            const s = seeds.find((x) => x.id === id);
            if (!s) return null;
            return (
              <div
                key={id}
                className="p-2.5 rounded-lg bg-[#15294a] text-center border border-[#1e2f47]"
              >
                <div className="text-[#00e0b8] font-bold">#{s.seedNumber}</div>
                <div className="text-[11px] text-[#e8f0f8] truncate">{s.name}</div>
              </div>
            );
          })}
        </div>

        <div className="space-y-1 font-mono text-xs">
          {[
            { label: "评级 Tier", getter: (s: SeedItem) => `${s.tier} 级` },
            {
              label: "历史综合得分",
              getter: (s: SeedItem) => `${s.avgScore} 分`,
            },
            {
              label: "Guidance Scale (CFG)",
              getter: (s: SeedItem) => s.params.guidanceScale,
            },
            {
              label: "Steps (采样步数)",
              getter: (s: SeedItem) => s.params.steps,
            },
            {
              label: "Denoise Strength",
              getter: (s: SeedItem) => s.params.denoiseStrength,
            },
            {
              label: "CFG LipSync (口型引导)",
              getter: (s: SeedItem) => s.params.cfgLipSync,
            },
            {
              label: "推荐主干模型",
              getter: (s: SeedItem) => s.recommendedModel,
            },
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-3 p-2 rounded-lg bg-[#0c1a30] border border-[#1e2f47]/50"
            >
              <span className="text-[#8a97a8] font-medium">{row.label}</span>
              {compareSeedIds.map((id) => {
                const s = seeds.find((x) => x.id === id);
                if (!s) return <div key={id}>--</div>;
                return (
                  <div key={id} className="text-center font-bold text-[#e8f0f8]">
                    {row.getter(s)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
