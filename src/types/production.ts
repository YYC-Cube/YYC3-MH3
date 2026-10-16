/**
 * file: src/types/production.ts
 * description: YYC³ 类型契约 — 生产域（批次 / 种子 / 参数 / 算力 / 音素）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[production],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 生产域契约 — 批次模型 / 种子模型 / 参数模板 / 新建草案 / GPU 槽位 / 音素语言
 *
 * dependencies: ./pipeline
 * exports: BatchStatus, BatchMode, KeyframePreview, BatchItem, SeedItem, ParameterTemplate, NewBatchDraft, GpuSlot, PhonemeLanguage
 */
import type { PipelineStageKey } from "./pipeline";

export type BatchStatus = "running" | "completed" | "failed" | "queued" | "paused";
export type BatchMode = "Ref2VA" | "FL2VA";

export interface KeyframePreview {
  frameNumber: number;
  timeSec: number;
  thumbnail: string;
  lipScore: number;
  expressionScore: number;
  anomaly?: string;
}

export interface BatchItem {
  id: string;
  name: string;
  mode: BatchMode;
  seed: number;
  prompt: string;
  negativePrompt?: string;
  status: BatchStatus;
  progress: number;
  currentStage: PipelineStageKey;
  startTime: string;
  duration: string;
  score: number; // 0 - 100
  lipSyncScore: number;
  expressionScore: number;
  stabilityScore: number;
  coherenceScore: number;
  fidelityScore: number;
  resolution: string;
  fps: number;
  vramUsageGb: number;
  previewThumbnail: string;
  outputVideoUrl?: string;
  tags: string[];
  keyframes?: KeyframePreview[];
  anomalies?: {
    frame: number;
    issue: string;
    severity: "low" | "medium" | "high";
    fixed: boolean;
  }[];
}

export interface SeedItem {
  id: string;
  seedNumber: number;
  name: string;
  tier: "S" | "A" | "B" | "Experimental";
  avgScore: number;
  generationCount: number;
  lastUsed: string;
  tags: string[];
  recommendedModel: string;
  version?: string;
  history?: {
    version: string;
    date: string;
    score: number;
    changeNote: string;
  }[];
  params: {
    guidanceScale: number;
    steps: number;
    denoiseStrength: number;
    motionScale: number;
    cfgLipSync: number;
  };
  notes: string;
  isFavorite: boolean;
}

export interface ParameterTemplate {
  id: string;
  name: string;
  mode: BatchMode;
  steps: number;
  guidanceScale: number;
  denoiseStrength: number;
  resolution: string;
  fps: number;
  fp8: boolean;
  desc: string;
}

/** 新建批次表单草案（NewBatchModal → App → domains/production/batch.createBatchItem） */
export interface NewBatchDraft {
  name: string;
  mode: BatchMode;
  seed: number;
  prompt: string;
}

export interface GpuSlot {
  id: string;
  cudaDevice: string;
  name: string;
  totalVramGb: number;
  usedVramGb: number;
  status: "active" | "idle" | "throttled";
  assignedBatchId?: string;
  temperature: number;
  utilization: number;
}

export interface PhonemeLanguage {
  code: string;
  name: string;
  phonemeCount: number;
  accuracy: number;
  status: "ready" | "downloading" | "optimized";
  sampleRate: string;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
