/**
 * file: src/views/AgentWorkflowView/parts/WorkflowToolbar.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 顶部项目工具栏
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[toolbar],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 工作流顶栏 — 标题徽章 + 导出拓扑 / 断点查看器 / 全局执行三操作
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: WorkflowToolbar, WorkflowToolbarProps
 */
import { Bug, Download, Network, Play } from "lucide-react";
import type React from "react";
import { Button } from "../../../components/common";

export interface WorkflowToolbarProps {
  isRunningWorkflow: boolean;
  onExportTopology: () => void;
  onOpenDebugger: () => void;
  onRunWorkflow: () => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  isRunningWorkflow,
  onExportTopology,
  onOpenDebugger,
  onRunWorkflow,
}) => {
  return (
    <div className="h-12 px-4 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between select-none z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#00e0b8]" />
          <span className="text-xs font-semibold text-[#e8f0f8]">漫剧分镜多 Agent 智能协同流水线</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15294a] text-[#00e0b8] border border-[#1e2f47]">
          YYC³ AI Family 8 大成员体系全量对齐
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="xs" icon={<Download className="w-3.5 h-3.5" />} onClick={onExportTopology}>
          导出拓扑 (JSON)
        </Button>
        <Button
          variant="secondary"
          size="xs"
          icon={<Bug className="w-3.5 h-3.5 text-[#00e0b8]" />}
          onClick={onOpenDebugger}
        >
          断点变量查看器
        </Button>
        <Button
          variant="primary"
          size="xs"
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
          loading={isRunningWorkflow}
          onClick={onRunWorkflow}
        >
          全局执行工作流
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
