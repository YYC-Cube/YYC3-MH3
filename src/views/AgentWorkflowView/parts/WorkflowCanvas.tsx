/**
 * file: src/views/AgentWorkflowView/parts/WorkflowCanvas.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 中部节点画布（网格 + 连接线 + 8 节点）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[canvas],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 工作流中部画布 — 点阵背景、SVG 动画连接线与 8 位 AI Family 节点卡片
 *
 * dependencies: react, ../../../types, ./renderRoleIcon
 * exports: WorkflowCanvas, WorkflowCanvasProps
 */
import type React from "react";
import type { AgentNode } from "../../../types";
import { renderRoleIcon } from "./renderRoleIcon";

export interface WorkflowCanvasProps {
  nodes: AgentNode[];
  selectedNode: AgentNode;
  onSelectNode: (nodeId: string) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodes, selectedNode, onSelectNode }) => {
  return (
    <div className="flex-1 relative bg-[#0a1628] overflow-hidden select-none">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00e0b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* SVG Connection Lines with Animated Particles (Requirement 3.2) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Yanqi -> Chuangxiang */}
        <path
          d="M 220 110 C 260 110, 260 80, 300 80"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        {/* Chuangxiang -> Yuanqi */}
        <path d="M 480 80 C 530 80, 530 150, 580 150" fill="none" stroke="#FF7A5C" strokeWidth="2" />
        {/* Yanqi -> Yuanqi */}
        <path d="M 220 110 C 400 110, 400 150, 580 150" fill="none" stroke="#00e0b8" strokeWidth="2" />
        {/* Yuanqi -> Gewu */}
        <path d="M 760 150 C 820 150, 820 110, 880 110" fill="none" stroke="#C0C0C0" strokeWidth="2" />
        {/* Yuanqi -> Yushu */}
        <path
          d="M 670 170 C 670 230, 480 230, 480 290"
          fill="none"
          stroke="#FF69B4"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Yushu -> Qianli */}
        <path d="M 480 290 L 580 340" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        {/* Qianli -> Zhiyun */}
        <path d="M 760 340 C 820 340, 820 300, 880 300" fill="none" stroke="#9d7cd8" strokeWidth="2" />
        {/* Yujian -> Zhiyun */}
        <path
          d="M 220 310 C 500 380, 700 380, 880 300"
          fill="none"
          stroke="#00BFFF"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </svg>

      {/* 8 AI Family Nodes (Requirement 3.1) */}
      {nodes.map((node) => {
        const isSelected = selectedNode.id === node.id;
        return (
          <div
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              borderColor: isSelected ? "#ffffff" : node.roleColor,
              boxShadow: isSelected ? `0 0 20px ${node.roleColor}80` : undefined,
            }}
            className={`absolute w-44 rounded-xl bg-[#0c1a30] border-2 transition-all cursor-pointer p-3 space-y-1.5 shadow-xl ${
              isSelected ? "shadow-[0_0_24px_rgba(0,224,184,0.35)] scale-105 z-20" : "hover:border-white/40 z-10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5" style={{ color: node.roleColor }}>
                {renderRoleIcon(node.memberId)}
                <span className="text-[10px] font-mono font-bold uppercase">{node.memberId}</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  node.status === "success"
                    ? "bg-[#00e0b8]"
                    : node.status === "active"
                      ? "bg-[#00e0b8] animate-ping"
                      : "bg-[#8b949e]"
                }`}
              />
            </div>

            <div className="text-xs font-bold text-[#e8f0f8]">{node.label}</div>
            <div className="text-[10px] text-[#8a97a8] truncate">{node.role}</div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-[#8b949e] border-t border-[#1e2f47]/50 font-mono">
              <span>In: {node.inputs.length}</span>
              <span>Out: {node.outputs.length}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
