/**
 * file: src/views/WorkbenchView/parts/DiffModal.tsx
 * description: YYC³ 功能视图 — WorkbenchView 参数历史版本对比与回滚弹窗
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
 * brief: WorkbenchView 参数历史版本对比与回滚弹窗（当前值 vs v2.0 黄金基线），
 *        逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, ../../../components/common
 * exports: DiffModalProps, DiffModal
 */
import React from "react";
import { Button, Modal } from "../../../components/common";

export interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidanceScale: number;
  steps: number;
  denoiseStrength: number;
  onRollback: () => void;
}

export const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  guidanceScale,
  steps,
  denoiseStrength,
  onRollback,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="参数历史版本对比与回滚 (Parameter Version Diff)"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
          <Button variant="primary" size="sm" onClick={onRollback}>
            一键回滚到此历史版本
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs">
        <p className="text-[#8a97a8]">当前配置 vs 历史推荐基准 (v2.0 Benchmark)</p>
        <div className="p-3 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-2 font-mono">
          <div className="flex justify-between py-1 border-b border-[#1e2f47]/50">
            <span className="text-[#8a97a8]">参数项</span>
            <span className="text-[#e8f0f8]">当前值</span>
            <span className="text-[#00e0b8]">历史 v2.0 基准</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#1e2f47]/50 bg-[#ff7a45]/10 px-1 rounded">
            <span className="text-[#8a97a8]">Guidance Scale</span>
            <span className="text-[#ff7a45]">{guidanceScale} (偏高)</span>
            <span className="text-[#00e0b8]">7.2</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#1e2f47]/50 bg-[#ff7a45]/10 px-1 rounded">
            <span className="text-[#8a97a8]">Steps</span>
            <span className="text-[#ff7a45]">{steps}</span>
            <span className="text-[#00e0b8]">32</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#1e2f47]/50">
            <span className="text-[#8a97a8]">Denoise Strength</span>
            <span className="text-[#e8f0f8]">{denoiseStrength}</span>
            <span className="text-[#00e0b8]">{denoiseStrength}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
