/**
 * file: src/views/AgentWorkflowView/parts/WorkflowLeftPanel.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 左侧页签面板（分镜队列 / AI Family / 模板）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[panel],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 工作流左栏 — 三页签（分镜队列 / AI Family 8 成员 / 漫剧模板）内容区
 *
 * dependencies: react, ../../../components/common, ../../../data/yyc3Data, ./types, ./workflowData, ./renderRoleIcon
 * exports: WorkflowLeftPanel, WorkflowLeftPanelProps
 */
import type React from "react";
import { Badge } from "../../../components/common";
import { YYC3_MEMBERS } from "../../../data/yyc3Data";
import { AGENT_LEFT_TABS, type AgentLeftTab } from "./types";
import type { Storyboard } from "./workflowData";
import { renderRoleIcon } from "./renderRoleIcon";

export interface WorkflowLeftPanelProps {
  activeTabLeft: AgentLeftTab;
  onSelectTab: (tab: AgentLeftTab) => void;
  storyboards: Storyboard[];
  onSelectAgent: (memberId: string) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const WorkflowLeftPanel: React.FC<WorkflowLeftPanelProps> = ({
  activeTabLeft,
  onSelectTab,
  storyboards,
  onSelectAgent,
  onShowToast,
}) => {
  return (
    <div className="w-64 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0">
      <div className="p-2 border-b border-[#1e2f47] flex gap-1 bg-[#0c1a30] text-xs">
        {AGENT_LEFT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 py-1 text-center rounded-md text-[11px] transition-colors cursor-pointer ${
              activeTabLeft === tab.id
                ? "bg-[#15294a] text-[#00e0b8] font-semibold border border-[#1e2f47]"
                : "text-[#8a97a8] hover:text-[#e8f0f8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Storyboard List with AI Character Avatars (Requirement 3.2) */}
      {activeTabLeft === "storyboards" && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
          <div className="flex justify-between items-center text-[10px] text-[#8a97a8] px-1">
            <span>分镜清单 (3项)</span>
            <span className="text-[#00e0b8] font-mono">15.7s 合计</span>
          </div>
          {storyboards.map((sb) => (
            <div
              key={sb.id}
              className="p-2.5 rounded-lg bg-[#0f1f38] border border-[#1e2f47] space-y-1.5 hover:border-[#00e0b8]/40 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#00e0b8]">{sb.id}</span>
                <span className="text-[10px] text-[#8a97a8] font-mono">{sb.duration}</span>
              </div>
              <div className="text-[#e8f0f8] font-medium">{sb.title}</div>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1e2f47]/50">
                <div className="flex items-center gap-1.5" style={{ color: sb.color }}>
                  {renderRoleIcon(sb.memberId)}
                  <span className="font-semibold">{sb.memberName}</span>
                </div>
                <Badge variant="brand" size="xs">
                  已就绪
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Family 8 Members List (Requirement 3.1) */}
      {activeTabLeft === "agents" && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
          {YYC3_MEMBERS.map((ag) => (
            <div
              key={ag.id}
              onClick={() => {
                onSelectAgent(ag.id);
              }}
              className="p-2 rounded-lg bg-[#0f1f38] border border-[#1e2f47] flex items-center justify-between hover:border-white/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: ag.roleColor }}
                />
                <div>
                  <div className="font-medium text-[#e8f0f8]">{ag.name}</div>
                  <div className="text-[10px] text-[#8a97a8] truncate max-w-[130px]">
                    {ag.roleDefinition}
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#8b949e]">{ag.clockPosition}</span>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {activeTabLeft === "templates" && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
          {[
            {
              name: "古风武侠双人对决 (8镜)",
              desc: "含打斗姿态控制与眼神对峙",
            },
            {
              name: "都市悬疑室内对话 (5镜)",
              desc: "微光影调与细腻瞳孔特写",
            },
            {
              name: "科技产品发布演说 (4镜)",
              desc: "长镜头推拉与PPT协同画中画",
            },
          ].map((t, i) => (
            <div
              key={i}
              onClick={() => onShowToast("success", `已载入模板: ${t.name}`)}
              className="p-2.5 rounded-lg bg-[#0f1f38] border border-[#1e2f47] hover:border-[#00e0b8]/40 transition-colors cursor-pointer space-y-1"
            >
              <div className="font-semibold text-[#e8f0f8]">{t.name}</div>
              <p className="text-[11px] text-[#8a97a8]">{t.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
