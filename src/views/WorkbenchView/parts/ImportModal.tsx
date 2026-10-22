/**
 * file: src/views/WorkbenchView/parts/ImportModal.tsx
 * description: YYC³ 功能视图 — WorkbenchView 批量参数 JSON 导入弹窗
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
 * brief: WorkbenchView 批量参数导入弹窗（粘贴 JSON 数组加入调度队列），
 *        逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, ../../../components/common
 * exports: ImportModalProps, ImportModal
 */
import React from "react";
import { Button, Modal } from "../../../components/common";

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (text: string) => void;
  onConfirm: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, value, onChange, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="批量参数导入 (Batch JSON Import)"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            确认导入并生成批次队列
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs">
        <p className="text-[#8a97a8]">支持粘贴包含多条批次参数的 JSON 数组，自动批量加入调度队列：</p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder={`[\n  {\n    "name": "批次01",\n    "seed": 48920194,\n    "mode": "Ref2VA",\n    "steps": 30\n  }\n]`}
          className="w-full p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs font-mono text-[#e8f0f8] focus:outline-none focus:border-[#00e0b8]"
        />
      </div>
    </Modal>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
