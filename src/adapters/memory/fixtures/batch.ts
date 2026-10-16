/**
 * file: src/adapters/memory/fixtures/batch.ts
 * description: YYC³ memory 适配器夹具 — 生产批次演示快照（BatchItem，顶层冻结）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[memory],[fixtures],[batch]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 批次仓储演示快照 — 顶层 Object.freeze + 逐项浅拷贝派生（审计 G-2）：
 *        数组层冻结防 push/splice 就地污染；元素为 RAW 的独立浅副本，
 *        消费方（memory 适配器 / App Hook）初始化时必须再逐项浅拷贝出新数组，
 *        之后的一切变更只作用于副本，禁止回写本模块。
 *
 * dependencies: ../../../types
 * exports: INITIAL_BATCHES
 */
import { BatchItem } from "../../../types";

/** 原始种子行（模块私有；冻结导出由其浅拷贝派生） */
const RAW_BATCHES: BatchItem[] = [
  {
    id: "BATCH-20250412-089",
    name: "金融早报数字人-主播04号-4K超分",
    mode: "Ref2VA",
    seed: 48920194,
    prompt:
      "Professional female financial news anchor in dark navy blazer, neutral expression, subtle smile, studio soft lighting, ultra-realistic skin texture, 8k uhd, looking straight at camera, sharp lip sync",
    status: "running",
    progress: 68,
    currentStage: "fine_eval",
    startTime: "10:24:18",
    duration: "01:42",
    score: 94.6,
    lipSyncScore: 95.8,
    expressionScore: 92.4,
    stabilityScore: 97.2,
    coherenceScore: 93.5,
    fidelityScore: 96.0,
    resolution: "1080x1920",
    fps: 30,
    vramUsageGb: 19.4,
    previewThumbnail: "/placeholders/person.svg",
    tags: ["金融播报", "Ref2VA", "4K增强", "口型S级"],
  },
  {
    id: "BATCH-20250412-088",
    name: "科技发布会-CEO演说虚拟分身-长镜头",
    mode: "FL2VA",
    seed: 81923011,
    prompt:
      "Male tech executive standing in front of high-tech keynote stage, confident gestures, articulated speech synchronization, cinematic lighting, photorealistic",
    status: "completed",
    progress: 100,
    currentStage: "seed_iter",
    startTime: "10:02:10",
    duration: "03:15",
    score: 96.8,
    lipSyncScore: 97.4,
    expressionScore: 96.0,
    stabilityScore: 98.1,
    coherenceScore: 95.5,
    fidelityScore: 97.2,
    resolution: "1080x1920",
    fps: 60,
    vramUsageGb: 21.2,
    previewThumbnail: "/placeholders/person.svg",
    tags: ["科技发布", "FL2VA", "60FPS", "优质种子回写"],
  },
  {
    id: "BATCH-20250412-087",
    name: "电商带货数字人-美妆达人自然说话态",
    mode: "Ref2VA",
    seed: 33491820,
    prompt:
      "Beauty influencer showcasing cosmetic product, warm lighting, sparkling eyes, dynamic facial micro-expressions, flawless lip movements",
    status: "completed",
    progress: 100,
    currentStage: "seed_iter",
    startTime: "09:48:33",
    duration: "02:08",
    score: 91.2,
    lipSyncScore: 93.0,
    expressionScore: 90.5,
    stabilityScore: 92.0,
    coherenceScore: 89.4,
    fidelityScore: 91.8,
    resolution: "720x1280",
    fps: 30,
    vramUsageGb: 16.8,
    previewThumbnail: "/placeholders/person.svg",
    tags: ["电商带货", "高频口型"],
  },
  {
    id: "BATCH-20250412-086",
    name: "文旅虚拟导游-古风国潮讲解员",
    mode: "Ref2VA",
    seed: 71209384,
    prompt:
      "Traditional oriental costume tour guide smiling gracefully, historic temple background, soft natural sunlight, smooth head turn, realistic hair physics",
    status: "failed",
    progress: 42,
    currentStage: "scoring",
    startTime: "09:30:15",
    duration: "00:54",
    score: 62.4,
    lipSyncScore: 58.0,
    expressionScore: 65.2,
    stabilityScore: 71.0,
    coherenceScore: 54.0,
    fidelityScore: 68.0,
    resolution: "1080x1920",
    fps: 30,
    vramUsageGb: 22.8,
    previewThumbnail: "/placeholders/person.svg",
    tags: ["文旅导游", "口型偏移", "需优化Seed"],
  },
  {
    id: "BATCH-20250412-085",
    name: "医疗问诊数字人-严谨男医生语音同步",
    mode: "FL2VA",
    seed: 55410928,
    prompt:
      "Male doctor in white medical coat with stethoscope, serious and calm demeanor, hospital consultation room, precise enunciation and medical terminology lip movements",
    status: "queued",
    progress: 0,
    currentStage: "generation",
    startTime: "待调度",
    duration: "--:--",
    score: 0,
    lipSyncScore: 0,
    expressionScore: 0,
    stabilityScore: 0,
    coherenceScore: 0,
    fidelityScore: 0,
    resolution: "1080x1920",
    fps: 30,
    vramUsageGb: 0,
    previewThumbnail: "/placeholders/person.svg",
    tags: ["医疗科普", "排队中"],
  },
];

/** 演示快照（顶层冻结 + 逐项浅拷贝；注意 tags 等嵌套引用与 RAW 共享，禁止就地修改） */
export const INITIAL_BATCHES: readonly BatchItem[] = Object.freeze(
  RAW_BATCHES.map((b) => ({ ...b })),
);

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
