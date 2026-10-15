/**
 * file: src/data/seed.ts
 * description: 领域演示快照 · Seed 种子（SeedItem）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [data],[mock],[seed]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 种子仓储演示快照（memory 适配器种子数据）
 *
 * dependencies: ../types
 * exports: INITIAL_SEEDS
 */
import { SeedItem } from "../types";

export const INITIAL_SEEDS: SeedItem[] = [
  {
    id: "SEED-81923011",
    seedNumber: 81923011,
    name: "钛极超稳态·CEO领袖种子",
    tier: "S",
    avgScore: 96.8,
    generationCount: 148,
    lastUsed: "2025-04-12 10:02",
    tags: ["高稳定性", "商务正装", "低抖动", "SyncNet 98%"],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
    params: {
      guidanceScale: 7.2,
      steps: 32,
      denoiseStrength: 0.68,
      motionScale: 1.05,
      cfgLipSync: 8.5,
    },
    notes: "适合中近景严肃商务播报，唇齿微表情极度精准，抗运动伪影能力极强。已沉淀为S级基线种子。",
    isFavorite: true,
  },
  {
    id: "SEED-48920194",
    seedNumber: 48920194,
    name: "灵动晴川·新闻播报首席",
    tier: "S",
    avgScore: 95.4,
    generationCount: 230,
    lastUsed: "2025-04-12 10:24",
    tags: ["播音级口型", "自然微表情", "发丝分离度高"],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
    params: {
      guidanceScale: 7.5,
      steps: 30,
      denoiseStrength: 0.65,
      motionScale: 0.98,
      cfgLipSync: 9.0,
    },
    notes: "高频新闻早晚报首选种子，对于齿音、爆破音口型跟随度达到工业级95分以上。",
    isFavorite: true,
  },
  {
    id: "SEED-33491820",
    seedNumber: 33491820,
    name: "晨露微光·美妆电商活跃",
    tier: "A",
    avgScore: 92.1,
    generationCount: 96,
    lastUsed: "2025-04-12 09:48",
    tags: ["高饱和面容", "大眼神韵", "轻快语速适配"],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.0-Fast",
    params: {
      guidanceScale: 6.8,
      steps: 28,
      denoiseStrength: 0.7,
      motionScale: 1.15,
      cfgLipSync: 8.0,
    },
    notes: "适合带货短视频，头部微晃动幅度较大但不会产生时序撕裂。",
    isFavorite: false,
  },
  {
    id: "SEED-90184421",
    seedNumber: 90184421,
    name: "幽玄沉香·古风漫剧女主",
    tier: "A",
    avgScore: 91.8,
    generationCount: 64,
    lastUsed: "2025-04-11 18:20",
    tags: ["古风发簪物理", "眼神流转", "柔美光照"],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
    params: {
      guidanceScale: 8.0,
      steps: 35,
      denoiseStrength: 0.62,
      motionScale: 0.9,
      cfgLipSync: 8.2,
    },
    notes: "漫剧专属种子，配合长发物理引擎表现优越。",
    isFavorite: false,
  },
  {
    id: "SEED-11849023",
    seedNumber: 11849023,
    name: "变异试管-B04·爆破音压测",
    tier: "Experimental",
    avgScore: 78.4,
    generationCount: 19,
    lastUsed: "2025-04-11 14:10",
    tags: ["实验性变异", "高重采样", "极限CFG"],
    recommendedModel: "DiffSynth-MiniMax-H3-v2.1-HQ",
    params: {
      guidanceScale: 10.5,
      steps: 40,
      denoiseStrength: 0.85,
      motionScale: 1.3,
      cfgLipSync: 11.0,
    },
    notes: "正在测试高CFG下的口型极限驱动，偶发嘴角闪烁，待进一步调优。",
    isFavorite: false,
  },
];

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
