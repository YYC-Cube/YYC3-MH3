/**
 * file: src/data/agent.ts
 * description: 领域演示快照 · Agent 工作流节点（AgentNode）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [data],[mock],[agent]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Agent 编排画布演示快照（YYC³ AI Family 五节点协同）
 *
 * dependencies: ../types
 * exports: AGENT_NODES
 */
import { AgentNode } from "../types"

export const AGENT_NODES: AgentNode[] = [
  {
    id: "node-1",
    label: "剧本与分镜语义解析",
    role: "Script Parser Agent",
    roleColor: "#FF7A5C",
    memberId: "chuangxiang",
    type: "script",
    x: 40,
    y: 120,
    status: "success",
    inputs: [],
    outputs: ["node-2", "node-3"],
    config: {
      model: "MiniMax-Text-01",
      emotionDetection: true,
      paceControl: "Moderate",
    },
  },
  {
    id: "node-2",
    label: "音频分轨与唇形音素对齐",
    role: "Voice & Phoneme Driver",
    roleColor: "#FFD700",
    memberId: "yanqi",
    type: "voice",
    x: 320,
    y: 60,
    status: "success",
    inputs: ["node-1"],
    outputs: ["node-4"],
    config: {
      ttsVoice: "Female-Anchor-Pro",
      sampleRate: "48kHz",
      phonemeBoost: 1.25,
    },
  },
  {
    id: "node-3",
    label: "角色多机位姿态分镜控制",
    role: "Pose & Cam Agent",
    roleColor: "#FF7A5C",
    memberId: "chuangxiang",
    type: "storyboard",
    x: 320,
    y: 220,
    status: "success",
    inputs: ["node-1"],
    outputs: ["node-4"],
    config: {
      cameraMotion: "Subtle Pan",
      expressionIntensity: 0.95,
    },
  },
  {
    id: "node-4",
    label: "DiffSynth H3 核心神经渲染",
    role: "DiffSynth Core Renderer",
    roleColor: "#00e0b8",
    memberId: "yuanqi",
    type: "diffsynth",
    x: 620,
    y: 130,
    status: "active",
    inputs: ["node-2", "node-3"],
    outputs: ["node-5"],
    config: {
      model: "DiffSynth-MiniMax-H3-v2.1",
      steps: 30,
      vramProfile: "FP8-HighSpeed",
    },
  },
  {
    id: "node-5",
    label: "多模态质检与闭环评分",
    role: "Quality Inspector Agent",
    roleColor: "#C0C0C0",
    memberId: "gewu",
    type: "quality",
    x: 900,
    y: 130,
    status: "idle",
    inputs: ["node-4"],
    outputs: [],
    config: {
      thresholdLip: 90,
      autoFeedbackSeed: true,
    },
  },
]

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
