/**
 * file: src/components/pipeline/RadarScoreChart/parts/dimensions.ts
 * description: YYC³ 五步闭环流水线组件 — 多维质量雷达默认维度快照
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[pipeline],[radar],[data],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 多维质量雷达图默认五维评分维度（口型/表情/姿态/时序/画质）
 *
 * dependencies: ./types
 * exports: DEFAULT_DIMENSIONS
 */
import type { RadarDimension } from "./types";

export const DEFAULT_DIMENSIONS: RadarDimension[] = [
  {
    key: "lipSync",
    label: "口型吻合度",
    score: 95.8,
    benchmark: 88.4,
    threshold: 85,
    advice: "SyncNet 唇齿微运动特征对齐极佳，保持当前 CFG 权重即可。",
  },
  {
    key: "expression",
    label: "表情自然度",
    score: 92.4,
    benchmark: 89.1,
    threshold: 85,
    advice: "眼睑微闭与微笑转折流畅，建议维持 Guidance Scale 在 7.0-7.5 范围。",
  },
  {
    key: "stability",
    label: "姿态稳定性",
    score: 97.2,
    benchmark: 92.0,
    threshold: 85,
    advice: "中景镜头头部无剧烈时序晃动，肩部边缘无抗撕裂失真。",
  },
  {
    key: "coherence",
    label: "时序一致性",
    score: 93.5,
    benchmark: 86.8,
    threshold: 85,
    advice: "帧间扩散平滑度良好，无闪烁色块或发丝跳帧。",
  },
  {
    key: "fidelity",
    label: "超清画质",
    score: 96.0,
    benchmark: 91.5,
    threshold: 85,
    advice: "4K超分辨率重构面容毛孔与毛发边缘清晰度符合超清标准。",
  },
];

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
