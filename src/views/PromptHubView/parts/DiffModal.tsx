/**
 * file: src/views/PromptHubView/parts/DiffModal.tsx
 * description: YYC³ 视图分区 — PromptHubView 模板版本 Diff 对比弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[prompt],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 PromptHubView 逐字提取的版本 Diff 弹窗 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common
 * exports: DiffModalProps, DiffModal
 */
import React from "react";
import { Button, Modal } from "../../../components/common";

export interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiffModal: React.FC<DiffModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="模板版本 Diff 对比 (Template Version Diff)"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          关闭
        </Button>
      }
    >
      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-[#8a97a8]">
          <span>当前编辑版本 (v3.2)</span>
          <span>上一个基线版本 (v3.1)</span>
        </div>
        <div className="p-3 rounded-lg bg-[#15294a] font-mono leading-relaxed space-y-1">
          <p className="text-[#00e0b8]">
            + Direct eye gaze at camera with gentle professional authority
          </p>
          <p className="text-[#ff7a45]">- Static eye gaze looking forward</p>
          <p className="text-[#e8f0f8]">
            {" "}
            Ultra-detailed facial epidermis pores, realistic 8k skin
          </p>
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
