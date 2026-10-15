/**
 * file: src/views/AgentWorkflowView.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — AgentWorkflowView
 *
 * dependencies: react, ../data/yyc3Data, ../types, lucide-react
 * exports: AgentLeftTab, AGENT_LEFT_TABS, AgentWorkflowViewProps, AgentWorkflowView
 */
import {
  Brain,
  Bug,
  Download,
  Ear,
  Eye,
  GitBranch,
  Lightbulb,
  Move,
  Network,
  Pin,
  Play,
  Scale,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import React, { useState } from "react";
import { Badge, Button, Input, Modal } from "../components/common";
import { YYC3_MEMBERS } from "../data/yyc3Data";
import { AgentNode, NavigateExtra, NavTabId } from "../types";

/** Agent 工作流左侧面板页签 ID */
export type AgentLeftTab = "agents" | "storyboards" | "templates";

const AGENT_LEFT_TABS: { id: AgentLeftTab; label: string }[] = [
  { id: "storyboards", label: "分镜队列" },
  { id: "agents", label: "AI Family (8)" },
  { id: "templates", label: "漫剧模板" },
];

export interface AgentWorkflowViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

// 8 Nodes directly aligned with YYC3 AI Family (Requirement 3.1)
const INITIAL_YYC3_NODES: AgentNode[] = [
  {
    id: "node-yanqi",
    memberId: "yanqi",
    label: "言启·千行 (语音音素)",
    role: "意图识别、语音转写、语义解析",
    roleColor: "#FFD700",
    type: "voice",
    x: 40,
    y: 80,
    status: "success",
    inputs: [],
    outputs: ["node-chuangxiang", "node-yuanqi"],
    config: {
      model: "Voice-Genesis-v2",
      phonemeAccuracy: "98.4%",
      audioEmotion: "Authoritative",
    },
  },
  {
    id: "node-chuangxiang",
    memberId: "chuangxiang",
    label: "创想·灵韵 (分镜创意)",
    role: "提示词生成、创意优化、分镜创作",
    roleColor: "#FF7A5C",
    type: "storyboard",
    x: 300,
    y: 50,
    status: "success",
    inputs: ["node-yanqi"],
    outputs: ["node-yuanqi"],
    config: {
      storyboardPacing: "Dramatic",
      microExpressionBoost: 1.25,
      cameraMotion: "Subtle Pan",
    },
  },
  {
    id: "node-yuanqi",
    memberId: "yuanqi",
    label: "元启·天枢 (调度总控)",
    role: "全局调度、流程编排、任务分发",
    roleColor: "#00e0b8",
    type: "diffsynth",
    x: 580,
    y: 120,
    status: "active",
    inputs: ["node-yanqi", "node-chuangxiang"],
    outputs: ["node-gewu", "node-yushu"],
    config: {
      engine: "DiffSynth-MiniMax-H3-v2.1",
      steps: 30,
      vramProfile: "FP8-HighSpeed",
    },
  },
  {
    id: "node-yushu",
    memberId: "yushu",
    label: "语枢·万物 (数据指标)",
    role: "数据分析、内容提炼、信息聚合",
    roleColor: "#FF69B4",
    type: "script",
    x: 300,
    y: 260,
    status: "success",
    inputs: ["node-yuanqi"],
    outputs: ["node-qianli"],
    config: {
      metricDimensions: "5-Dim Weighted",
      clusteringSensitivity: 0.88,
    },
  },
  {
    id: "node-qianli",
    memberId: "qianli",
    label: "千里·伯乐 (种子推荐)",
    role: "种子推荐、参数优化、效果匹配",
    roleColor: "#FFFFFF",
    type: "recommend",
    x: 580,
    y: 310,
    status: "active",
    inputs: ["node-yushu"],
    outputs: ["node-zhiyun"],
    config: {
      baseSeed: 81923011,
      targetTier: "S-Grade",
      mutationStep: 0.05,
    },
  },
  {
    id: "node-yujian",
    memberId: "yujian",
    label: "预见·先知 (预测调度)",
    role: "趋势预测、异常预警、调度规划",
    roleColor: "#00BFFF",
    type: "predict",
    x: 40,
    y: 280,
    status: "success",
    inputs: [],
    outputs: ["node-zhiyun"],
    config: {
      vramOOMRisk: "Low (0.02%)",
      timePredictionSec: 42.8,
    },
  },
  {
    id: "node-gewu",
    memberId: "gewu",
    label: "格物·宗师 (质量校验)",
    role: "质量评分、标准校验、缺陷识别",
    roleColor: "#C0C0C0",
    type: "quality",
    x: 880,
    y: 80,
    status: "active",
    inputs: ["node-yuanqi"],
    outputs: ["node-zhiyun"],
    config: {
      syncNetPassThreshold: 85,
      temporalCoherenceThreshold: 90,
    },
  },
  {
    id: "node-zhiyun",
    memberId: "zhiyun",
    label: "智云·守护 (安全防护)",
    role: "异常检测、风险防护、自动排障",
    roleColor: "#9d7cd8",
    type: "security",
    x: 880,
    y: 270,
    status: "idle",
    inputs: ["node-qianli", "node-yujian", "node-gewu"],
    outputs: [],
    config: {
      watchdogIntervalMs: 1000,
      autoMemoryDefrag: true,
      sandboxActive: true,
    },
  },
];

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

  const [storyboards] = useState([
    {
      id: "SC-01",
      title: "第01镜：权威早报开场 (特写)",
      duration: "5.0s",
      status: "ready",
      memberId: "yanqi",
      memberName: "言启·千行",
      color: "#FFD700",
    },
    {
      id: "SC-02",
      title: "第02镜：数据拓扑演进 (中景)",
      duration: "6.5s",
      status: "queued",
      memberId: "yushu",
      memberName: "语枢·万物",
      color: "#FF69B4",
    },
    {
      id: "SC-03",
      title: "第03镜：总裁决绝目光 (长镜头)",
      duration: "4.2s",
      status: "queued",
      memberId: "qianli",
      memberName: "千里·伯乐",
      color: "#FFFFFF",
    },
  ]);

  const handleRunWorkflow = () => {
    setIsRunningWorkflow(true);
    onShowToast("info", "正在启动 YYC³ 全链路多 Agent 协同流水线", "8 位核心 AI 成员开始协同计算");
    setTimeout(() => {
      setIsRunningWorkflow(false);
      onShowToast("success", "多 Agent 漫剧分镜生成完毕", "分镜 #01~#03 已自动回写至生产批次队列");
    }, 2200);
  };

  const renderRoleIcon = (memberId: string) => {
    switch (memberId) {
      case "yanqi":
        return <Ear className="w-3.5 h-3.5" />;
      case "yushu":
        return <Brain className="w-3.5 h-3.5" />;
      case "yujian":
        return <Eye className="w-3.5 h-3.5" />;
      case "qianli":
        return <Star className="w-3.5 h-3.5 fill-current" />;
      case "yuanqi":
        return <GitBranch className="w-3.5 h-3.5" />;
      case "zhiyun":
        return <Shield className="w-3.5 h-3.5" />;
      case "gewu":
        return <Scale className="w-3.5 h-3.5" />;
      case "chuangxiang":
        return <Lightbulb className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
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
      <div className="h-12 px-4 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between select-none z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#00e0b8]" />
            <span className="text-xs font-semibold text-[#e8f0f8]">
              漫剧分镜多 Agent 智能协同流水线
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15294a] text-[#00e0b8] border border-[#1e2f47]">
            YYC³ AI Family 8 大成员体系全量对齐
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => setIsExportTopoOpen(true)}
          >
            导出拓扑 (JSON)
          </Button>
          <Button
            variant="secondary"
            size="xs"
            icon={<Bug className="w-3.5 h-3.5 text-[#00e0b8]" />}
            onClick={() => setIsDebuggerOpen(true)}
          >
            断点变量查看器
          </Button>
          <Button
            variant="primary"
            size="xs"
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            loading={isRunningWorkflow}
            onClick={handleRunWorkflow}
          >
            全局执行工作流
          </Button>
        </div>
      </div>

      {/* Main Content: Left Panel + Middle Canvas + Right Floating/Docked Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Tabbed Panel (Storyboards / AI Family / Templates) (260px) */}
        <div className="w-64 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-[#1e2f47] flex gap-1 bg-[#0c1a30] text-xs">
            {AGENT_LEFT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabLeft(tab.id)}
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
                    const matchedNode = nodes.find((n) => n.memberId === ag.id);
                    if (matchedNode) setSelectedNodeId(matchedNode.id);
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

        {/* Middle: Visual Node Canvas (Flex 1) */}
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
            <path
              d="M 480 80 C 530 80, 530 150, 580 150"
              fill="none"
              stroke="#FF7A5C"
              strokeWidth="2"
            />
            {/* Yanqi -> Yuanqi */}
            <path
              d="M 220 110 C 400 110, 400 150, 580 150"
              fill="none"
              stroke="#00e0b8"
              strokeWidth="2"
            />
            {/* Yuanqi -> Gewu */}
            <path
              d="M 760 150 C 820 150, 820 110, 880 110"
              fill="none"
              stroke="#C0C0C0"
              strokeWidth="2"
            />
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
            <path
              d="M 760 340 C 820 340, 820 300, 880 300"
              fill="none"
              stroke="#9d7cd8"
              strokeWidth="2"
            />
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
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  borderColor: isSelected ? "#ffffff" : node.roleColor,
                  boxShadow: isSelected ? `0 0 20px ${node.roleColor}80` : undefined,
                }}
                className={`absolute w-44 rounded-xl bg-[#0c1a30] border-2 transition-all cursor-pointer p-3 space-y-1.5 shadow-xl ${
                  isSelected
                    ? "shadow-[0_0_24px_rgba(0,224,184,0.35)] scale-105 z-20"
                    : "hover:border-white/40 z-10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" style={{ color: node.roleColor }}>
                    {renderRoleIcon(node.memberId)}
                    <span className="text-[10px] font-mono font-bold uppercase">
                      {node.memberId}
                    </span>
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

        {/* Right: Draggable, Floating, Dockable Node Property Card (Requirement 3.2) */}
        {cardDocked ? (
          /* Docked Right Inspector */
          <div className="w-80 border-l border-[#1e2f47] bg-[#0c1a30] p-4 space-y-4 flex flex-col flex-shrink-0 text-xs overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#e8f0f8]">节点属性配置</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedNode.roleColor }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCardDocked(false)}
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
        ) : (
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
                  onClick={() => setCardDocked(true)}
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
        )}
      </div>

      {/* Breakpoint Variable Inspector Modal */}
      <Modal
        isOpen={isDebuggerOpen}
        onClose={() => setIsDebuggerOpen(false)}
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
        onClose={() => setIsExportTopoOpen(false)}
        title="导出工作流拓扑全景 (Workflow Topology Export)"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsExportTopoOpen(false);
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
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
