/**
 * file: src/views/DesignSystemView/parts/DemoModals.tsx
 * description: YYC³ 功能视图 — DesignSystemView 交互式模态框与侧滑抽屉演示
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[designsystem],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DesignSystemView 交互演示容器 —— 终止批次二次确认模态框 + Seed 基因参数侧滑抽屉，
 *        逐字搬移自原 DesignSystemView.tsx。
 *
 * dependencies: react, ../../../components/common
 * exports: DemoModalsProps, DemoModals
 */
import React from "react";
import { Button, Drawer, Modal } from "../../../components/common";

export interface DemoModalsProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const DemoModals: React.FC<DemoModalsProps> = ({
  isModalOpen,
  onCloseModal,
  isDrawerOpen,
  onCloseDrawer,
  onShowToast,
}) => {
  return (
    <>
      {/* Interactive Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title="二次确认：终止当前批次推理"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={onCloseModal}>
              取消
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onCloseModal();
                onShowToast("error", "批次已强制终止", "显存资源已成功释放");
              }}
            >
              确认终止并释放 VRAM
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#8b949e] leading-relaxed">
          正在执行的批次为 <span className="font-mono text-[#00d4aa]">BATCH-20250412-089</span>
          。强制终止会导致未完成的 SyncNet 唇形精评数据丢失，并立即清空 CUDA 缓存，确定要执行吗？
        </p>
      </Modal>

      {/* Interactive Drawer Demo */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        title="Seed 种子详细基因参数"
        footer={
          <Button variant="primary" size="sm" onClick={onCloseDrawer}>
            应用到工作台
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#122340] border border-[#30363d] space-y-1">
            <span className="text-[#8b949e]">种子代号</span>
            <div className="font-mono text-base font-bold text-[#00d4aa]">81923011</div>
            <div className="text-[11px] text-[#8b949e]">钛极超稳态·CEO领袖种子 (S级)</div>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-[#e6edf3]">关键扩散特征参数</span>
            <div className="space-y-1 font-mono text-[11px] text-[#8b949e]">
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>Guidance Scale</span>
                <span className="text-[#00d4aa]">7.2</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>Steps</span>
                <span className="text-[#00d4aa]">32</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>Denoise Strength</span>
                <span className="text-[#00d4aa]">0.68</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>CFG LipSync</span>
                <span className="text-[#00d4aa]">8.5</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
