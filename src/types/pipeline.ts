/**
 * file: src/types/pipeline.ts
 * description: YYC³ 类型契约 — 五步闭环流水线阶段模型
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[pipeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 五步闭环流水线阶段模型 — 阶段键与阶段运行时态契约
 *
 * dependencies: —
 * exports: PipelineStageKey, PipelineStage
 */

export type PipelineStageKey = "generation" | "scoring" | "fine_eval" | "analysis" | "seed_iter";

export interface PipelineStage {
  id: PipelineStageKey;
  label: string;
  subLabel: string;
  status: "idle" | "running" | "completed" | "failed" | "warning";
  progress: number; // 0 - 100
  durationSec?: number;
  metric?: string;
  errorMsg?: string;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
