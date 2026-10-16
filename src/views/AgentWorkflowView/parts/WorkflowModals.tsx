/**
 * file: src/views/AgentWorkflowView/parts/WorkflowModals.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 断点查看器与拓扑导出弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[modal],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 工作流视图弹窗组 — 断点变量查看器（只读变量快照）+ 拓扑 JSON 导出弹窗
 *
 * dependencies: react, ../../../components/common, ../../../types
 * exports: WorkflowModals, WorkflowModalsProps
 */
import type React from "react";
import { Button, Modal } from "../../../components/common";
import type { AgentNode } from "../../../types";

export interface WorkflowModalsProps {
  isDebuggerOpen: boolean;
  onCloseDebugger: () => void;
  isExportTopoOpen: boolean;
  onCloseExportTopo: () => void;
  nodes: AgentNode[];
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const WorkflowModals: React.FC<WorkflowModalsProps> = ({
  isDebuggerOpen,
  onCloseDebugger,
  isExportTopoOpen,
  onCloseExportTopo,
  nodes,
  onShowToast,
}) => {
  return (
    <>
      {/* Breakpoint Variable Inspector Modal */}
      <Modal
        isOpen={isDebuggerOpen}
        onClose={onCloseDebugger}
        title="断点调试变量查看器 (Breakpoint Variable Inspector)"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs font-mono">
          <p className="text-[#8a97a8] font-sans">当前断点停驻位置：[元启·天枢 (调度总控)] 节点</p>
          <div className="p-3 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8a97a8]">latent_tensor.shape:</span>
              <span className="text-[#00e0b8]">[1, 4, 135, 240]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a97a8]">current_diffusion_step:</span>
              <span className="text-[#00e0b8]">18 / 30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a97a8]">vram_allocated_cuda0:</span>
              <span className="text-[#00e0b8]">18.42 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a97a8]">syncnet_phoneme_aligned:</span>
              <span className="text-[#00e0b8]">true</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Topology Export Modal (Requirement 3.2) */}
      <Modal
        isOpen={isExportTopoOpen}
        onClose={onCloseExportTopo}
        title="导出工作流拓扑全景 (Workflow Topology Export)"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onCloseExportTopo();
              onShowToast("success", "工作流拓扑 JSON 清单已下载");
            }}
          >
            下载完整拓扑 JSON
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#8a97a8]">
            包含 8 位 AI Family 成员拓扑连接、端口映射与各节点超参数：
          </p>
          <textarea
            rows={8}
            readOnly
            value={JSON.stringify(nodes, null, 2)}
            className="w-full p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] font-mono text-[11px] text-[#00e0b8]"
          />
        </div>
      </Modal>
    </>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
