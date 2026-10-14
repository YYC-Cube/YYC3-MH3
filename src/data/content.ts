/**
 * file: src/data/content.ts
 * description: 领域演示快照 · 内容中心（提示词模板 / 文档指南）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [data],[mock],[content]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 提示词工程中心与文档中心演示快照
 *
 * dependencies: —
 * exports: PROMPT_TEMPLATES, DOC_GUIDES
 */

export const PROMPT_TEMPLATES = [
  {
    id: "pt-01",
    category: "播报主持人",
    name: "央广权威主播·沉稳正装（Ref2VA最佳基线）",
    version: "v3.2",
    rating: 96.8,
    isBestPractice: true,
    text: `{{gender}} news anchor in {{clothing_color}} tailored business suit, crisp white shirt collar, studio warm-neutral split lighting. Direct eye gaze at camera with gentle professional authority, micro eye blinks every 3.5 seconds. Ultra-detailed facial epidermis pores, realistic 8k sub-surface scattering skin. Natural synchronous mouth articulation matching {{audio_emotion}} audio, zero motion smear, shot on ARRI Alexa Mini LF 85mm T1.5.`,
    variables: ["gender", "clothing_color", "audio_emotion"],
  },
  {
    id: "pt-02",
    category: "泛娱乐主播",
    name: "灵动带货达人·高频互动微表情",
    version: "v2.4",
    rating: 93.5,
    isBestPractice: true,
    text: `Dynamic friendly beauty influencer {{influencer_name}}, engaging warm smile, sparkling eyes with catchlights, subtle hand gestures holding product near chest level. Softbox beauty lighting with subtle teal and orange background bokeh. Natural jaw opening, crisp teeth alignment, lively expressive enunciation, 60fps high temporal coherence.`,
    variables: ["influencer_name"],
  },
  {
    id: "pt-03",
    category: "漫剧角色",
    name: "古风仙侠女主·柔美发丝与眼神流转",
    version: "v1.8",
    rating: 91.2,
    isBestPractice: false,
    text: `Ethereal ancient Chinese heroine in flowing silk hanfu robe, delicate jade hairpins with realistic physics, cherry blossom misty temple background. Melancholic yet resolute gaze, subtle head tilt, delicate lips enunciating classical poem cadence, photorealistic cinematic film grain.`,
    variables: [],
  },
]

export const DOC_GUIDES = [
  {
    id: "g01",
    category: "快速上手",
    title: "01. MiniMax-H3 本地生产线 5 分钟极速部署",
    readTime: "5 min",
  },
  {
    id: "g02",
    category: "快速上手",
    title: "02. 五步闭环流水线全景工作流详解",
    readTime: "8 min",
  },
  {
    id: "g03",
    category: "核心生产",
    title: "03. Ref2VA 与 FL2VA 双模式选择与最佳实践",
    readTime: "10 min",
  },
  {
    id: "g04",
    category: "核心生产",
    title: "04. 高保真口型对齐 SyncNet 初评与精评调校",
    readTime: "12 min",
  },
  {
    id: "g05",
    category: "核心生产",
    title: "05. Seed 种子库培育、遗传与变异测试指南",
    readTime: "15 min",
  },
  {
    id: "g06",
    category: "核心生产",
    title: "06. 提示词工程中心变量占位符与模板语法",
    readTime: "7 min",
  },
  {
    id: "g07",
    category: "Agent编排",
    title: "07. 多 Agent 分镜漫剧协同流水线搭建",
    readTime: "14 min",
  },
  {
    id: "g08",
    category: "Agent编排",
    title: "08. 节点断点调试与错误栈定位策略",
    readTime: "9 min",
  },
  {
    id: "g09",
    category: "硬件与运维",
    title: "09. RTX 4090 / A100 本地显存极速优化与 FP8 部署",
    readTime: "11 min",
  },
  {
    id: "g10",
    category: "硬件与运维",
    title: "10. 看门狗进程探活策略与自愈脚本编写",
    readTime: "8 min",
  },
  {
    id: "g11",
    category: "硬件与运维",
    title: "11. 常见 CUDA OOM 与模型加载崩溃排障手册",
    readTime: "13 min",
  },
  {
    id: "g12",
    category: "夜间批量",
    title: "12. 夜间批量无人值守策略与 NAS 自动归档",
    readTime: "6 min",
  },
]

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
