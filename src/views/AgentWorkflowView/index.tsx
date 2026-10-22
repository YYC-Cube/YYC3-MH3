/**
 * file: src/views/AgentWorkflowView/index.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 容器（状态装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 漫剧分镜多 Agent 智能协同工作流 — 单一真值收敛节点/页签/卡片/弹窗状态，
 *        编排顶栏、左栏、画布、属性检视器与弹窗（大块 JSX 下沉至 parts）。
 *
 * dependencies: react, ../../types, ./parts/types, ./parts/workflowData, ./parts/WorkflowToolbar, ./parts/WorkflowLeftPanel, ./parts/WorkflowCanvas, ./parts/NodeInspector, ./parts/WorkflowModals
 * exports: AgentLeftTab, AgentWorkflowViewProps, AgentWorkflowView
 */
import React, { useState } from "react";
import type { AgentNode } from "../../types";
import type { AgentLeftTab, AgentWorkflowViewProps } from "./parts/types";
import { INITIAL_STORYBOARDS, INITIAL_YYC3_NODES, type Storyboard } from "./parts/workflowData";
import { WorkflowToolbar } from "./parts/WorkflowToolbar";
import { WorkflowLeftPanel } from "./parts/WorkflowLeftPanel";
import { WorkflowCanvas } from "./parts/WorkflowCanvas";
import { NodeInspector } from "./parts/NodeInspector";
import { WorkflowModals } from "./parts/WorkflowModals";

export type { AgentLeftTab, AgentWorkflowViewProps } from "./parts/types";

export const AgentWorkflowView: React.FC<AgentWorkflowViewProps> = ({ onShowToast }) => {
  const [nodes] = useState<AgentNode[]>(INITIAL_YYC3_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    INITIAL_YYC3_NODES[2]!.id, // mock 常量数组恒非空，静态索引安全
  ); // Default to Yuanqi
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [activeTabLeft, setActiveTabLeft] = useState<AgentLeftTab>("storyboards");

  // Floating Draggable Card state (Requirement 3.2)
  const [cardDocked, setCardDocked] = useState(true);
  const [cardPosition] = useState({ x: 30, y: 30 });

  // Modals state
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
  const [isExportTopoOpen, setIsExportTopoOpen] = useState(false);

  const [storyboards] = useState<Storyboard[]>(INITIAL_STORYBOARDS);

  const handleRunWorkflow = () => {
    setIsRunningWorkflow(true);
    onShowToast("info", "正在启动 YYC³ 全链路多 Agent 协同流水线", "8 位核心 AI 成员开始协同计算");
    setTimeout(() => {
      setIsRunningWorkflow(false);
      onShowToast("success", "多 Agent 漫剧分镜生成完毕", "分镜 #01~#03 已自动回写至生产批次队列");
    }, 2200);
  };

  // 数据守卫：无匹配节点时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#8a97a8] bg-[#0a1628]">
        暂无 Agent 节点数据
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a1628]">
      {/* Top Project Toolbar */}
      <WorkflowToolbar
        isRunningWorkflow={isRunningWorkflow}
        onExportTopology={() => setIsExportTopoOpen(true)}
        onOpenDebugger={() => setIsDebuggerOpen(true)}
        onRunWorkflow={handleRunWorkflow}
      />

      {/* Main Content: Left Panel + Middle Canvas + Right Floating/Docked Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Tabbed Panel (Storyboards / AI Family / Templates) (260px) */}
        <WorkflowLeftPanel
          activeTabLeft={activeTabLeft}
          onSelectTab={setActiveTabLeft}
          storyboards={storyboards}
          onSelectAgent={(memberId) => {
            const matchedNode = nodes.find((n) => n.memberId === memberId);
            if (matchedNode) setSelectedNodeId(matchedNode.id);
          }}
          onShowToast={onShowToast}
        />

        {/* Middle: Visual Node Canvas (Flex 1) */}
        <WorkflowCanvas nodes={nodes} selectedNode={selectedNode} onSelectNode={setSelectedNodeId} />

        {/* Right: Draggable, Floating, Dockable Node Property Card (Requirement 3.2) */}
        <NodeInspector
          cardDocked={cardDocked}
          cardPosition={cardPosition}
          selectedNode={selectedNode}
          onSetDocked={setCardDocked}
          onShowToast={onShowToast}
        />
      </div>

      {/* Breakpoint Variable Inspector Modal + Topology Export Modal */}
      <WorkflowModals
        isDebuggerOpen={isDebuggerOpen}
        onCloseDebugger={() => setIsDebuggerOpen(false)}
        isExportTopoOpen={isExportTopoOpen}
        onCloseExportTopo={() => setIsExportTopoOpen(false)}
        nodes={nodes}
        onShowToast={onShowToast}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
