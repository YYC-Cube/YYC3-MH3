/**
 * file: src/views/PromptHubView/parts/BatchTestModal.tsx
 * description: YYC³ 视图分区 — PromptHubView 批量参数提示词测试队列弹窗
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
 * brief: 从 PromptHubView 逐字提取的批量测试队列弹窗 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types
 * exports: BatchTestModalProps, BatchTestModal
 */
import React from "react";
import { Button, Modal } from "../../../components/common";
import type { ShowToast } from "../../../types";

export interface BatchTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: ShowToast;
}

export const BatchTestModal: React.FC<BatchTestModalProps> = ({ isOpen, onClose, onShowToast }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="批量参数提示词测试队列 (Batch Inference Test)"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onShowToast("success", "已加入 4 组变量组合测试队列", "结果将在完成时通知");
            }}
          >
            启动批量测试
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs">
        <p className="text-[#8a97a8]">自动交叉组合变量，生成 4 组测试样本进行对比：</p>
        <div className="p-3 rounded-lg bg-[#15294a] space-y-1 font-mono text-[11px]">
          <div>1. [Female, dark navy suit, authoritative]</div>
          <div>2. [Female, crimson suit, authoritative]</div>
          <div>3. [Male, dark navy suit, authoritative]</div>
          <div>4. [Male, charcoal suit, neutral]</div>
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
