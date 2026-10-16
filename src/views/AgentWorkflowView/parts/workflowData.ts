/**
 * file: src/views/AgentWorkflowView/parts/workflowData.ts
 * description: YYC³ 功能视图 — AgentWorkflowView 初始节点与分镜种子数据
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[data],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Agent 工作流视图静态快照 — 8 位 AI Family 对齐节点拓扑与分镜队列种子
 *
 * dependencies: ../../../types
 * exports: Storyboard, INITIAL_YYC3_NODES, INITIAL_STORYBOARDS
 */
import type { AgentNode } from "../../../types";

/** 左侧分镜队列条目 */
export interface Storyboard {
  id: string;
  title: string;
  duration: string;
  status: string;
  memberId: string;
  memberName: string;
  color: string;
}

// 8 Nodes directly aligned with YYC3 AI Family (Requirement 3.1)
export const INITIAL_YYC3_NODES: AgentNode[] = [
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

export const INITIAL_STORYBOARDS: Storyboard[] = [
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
];

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
