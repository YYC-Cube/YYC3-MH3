/**
 * file: src/views/SeedVaultView/parts/SeedBreedingModal.tsx
 * description: YYC³ 视图分区 — SeedVaultView 定向培育与变异矩阵配置弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[breeding],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的定向培育弹窗 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types
 * exports: SeedBreedingModalProps, SeedBreedingModal
 */
import React from "react";
import { Button, Input, Modal } from "../../../components/common";
import { SeedItem } from "../../../types";

export interface SeedBreedingModalProps {
  breedingSeed: SeedItem;
  isBreedingModalOpen: boolean;
  setIsBreedingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLaunchBreeding: () => void;
}

export const SeedBreedingModal: React.FC<SeedBreedingModalProps> = ({
  breedingSeed,
  isBreedingModalOpen,
  setIsBreedingModalOpen,
  handleLaunchBreeding,
}) => {
  return (
    <Modal
      isOpen={isBreedingModalOpen}
      onClose={() => setIsBreedingModalOpen(false)}
      title={`Seed #${breedingSeed.seedNumber} 定向培育与变异矩阵`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setIsBreedingModalOpen(false)}>
            取消
          </Button>
          <Button variant="primary" size="sm" onClick={handleLaunchBreeding}>
            生成 6 组衍生变异批次
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <p className="text-[#8a97a8]">
          围绕「{breedingSeed.name}
          」在潜空间超参领域设置变异扰动范围，批量派生最优子代：
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="变异批次数量" value="6 组" readOnly />
          <Input label="扰动范围 (Seed Noise)" value="± 1, ± 5, ± 10" readOnly />
          <Input label="CFG 强度步进" value="0.2 递增" readOnly />
          <Input label="降噪梯度" value="0.60 ~ 0.72" readOnly />
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
