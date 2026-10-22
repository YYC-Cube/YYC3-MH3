/**
 * file: src/views/AgentWorkflowView/parts/NodeInspector.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 节点属性检视器（停靠 / 悬浮双态）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[inspector],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 节点属性卡 — 停靠右栏（可编辑参数/超参）+ 悬浮拖拽卡（超参速览）双态切换
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: NodeInspector, NodeInspectorProps
 */
import { Move, Pin } from "lucide-react";
import type React from "react";
import { Button, Input } from "../../../components/common";
import type { AgentNode } from "../../../types";

export interface NodeInspectorProps {
  cardDocked: boolean;
  cardPosition: { x: number; y: number };
  selectedNode: AgentNode;
  onSetDocked: (docked: boolean) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  cardDocked,
  cardPosition,
  selectedNode,
  onSetDocked,
  onShowToast,
}) => {
  if (cardDocked) {
    return (
      /* Docked Right Inspector */
      <div className="w-80 border-l border-[#1e2f47] bg-[#0c1a30] p-4 space-y-4 flex flex-col flex-shrink-0 text-xs overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#e8f0f8]">节点属性配置</span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.roleColor }} />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetDocked(false)}
              className="p-1 rounded text-[#8a97a8] hover:text-[#00e0b8] transition-colors cursor-pointer"
              title="转换为悬浮拖拽卡片"
            >
              <Move className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Input label="节点名称" value={selectedNode.label} readOnly />
          <Input label="对齐 AI Family" value={selectedNode.role} readOnly />

          <div className="p-3 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-2">
            <span className="font-semibold text-[#e8f0f8]">特征超参数与配置</span>
            <div className="space-y-1 font-mono text-[11px] text-[#8a97a8]">
              {Object.entries(selectedNode.config).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-[#1e2f47]/50">
                  <span>{k}:</span>
                  <span className="text-[#00e0b8] font-bold">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onShowToast("success", `${selectedNode.label} 属性已更新并生效`)}
          >
            应用节点参数更改
          </Button>
        </div>
      </div>
    );
  }

  return (
    /* Floating Draggable Card */
    <div
      style={{ left: `${cardPosition.x}px`, top: `${cardPosition.y}px` }}
      className="absolute z-30 w-72 rounded-xl bg-[#0c1a30]/95 border border-[#00e0b8] shadow-2xl backdrop-blur-md p-3.5 space-y-3 text-xs"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#1e2f47] cursor-move select-none">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-[#00e0b8]" />
          <span className="font-semibold text-[#e8f0f8]">{selectedNode.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetDocked(true)}
            className="p-1 text-[#8a97a8] hover:text-[#00e0b8]"
            title="停靠回右侧"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="p-2 rounded bg-[#15294a] text-[11px] font-mono space-y-1">
          {Object.entries(selectedNode.config).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[#8a97a8]">{k}:</span>
              <span className="text-[#00e0b8]">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
