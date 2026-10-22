/**
 * file: src/domains/editing/index.ts
 * description: YYC³ 剪辑域 — 时间线模型 / 模板引擎规则 / 渲染导出计划（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[editing],[timeline],[template],[render],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 剪辑域规则 —
 *   - 时间线：总时长聚合 + 按起点排序
 *   - 模板引擎：以模板输出规格重写片段（applyTemplate）
 *   - 渲染导出计划：有序片段 + 总时长 + 预估帧数（buildRenderPlan）
 *
 * dependencies: ../../types
 * exports: totalDurationOf, sortClips, EditTemplate, applyTemplate, RenderPlan, buildRenderPlan
 */
import type { MediaClipItem } from "../../types";

/** 时间线总时长：片段时长求和（秒） */
export function totalDurationOf(clips: readonly MediaClipItem[]): number {
  return clips.reduce((sum, clip) => sum + clip.durationSec, 0);
}

/** 按起点升序排序片段（返回新数组，不改动入参） */
export function sortClips(clips: readonly MediaClipItem[]): MediaClipItem[] {
  return [...clips].sort((a, b) => a.startSec - b.startSec);
}

/** 剪辑模板（输出规格单一事实源） */
export interface EditTemplate {
  id: string;
  name: string;
  transition: string;
  outputResolution: string;
  outputAspectRatio: string;
}

/** 模板引擎规则：以模板输出规格重写全部片段分辨率/画幅（返回新数组） */
export function applyTemplate(template: EditTemplate, clips: readonly MediaClipItem[]): MediaClipItem[] {
  return clips.map((clip) => ({
    ...clip,
    resolution: template.outputResolution,
    aspectRatio: template.outputAspectRatio,
  }));
}

/** 渲染导出计划 */
export interface RenderPlan {
  orderedClipIds: string[];
  totalDurationSec: number;
  outputResolution: string;
  outputAspectRatio: string;
  estimatedFrames: number;
}

/** 渲染导出计划构造：排序 → 聚合总时长 → 依模板规格与帧率预估总帧数 */
export function buildRenderPlan(input: {
  clips: readonly MediaClipItem[];
  template: EditTemplate;
  fps: number;
}): RenderPlan {
  const ordered = sortClips(input.clips);
  const total = totalDurationOf(ordered);
  return {
    orderedClipIds: ordered.map((clip) => clip.id),
    totalDurationSec: total,
    outputResolution: input.template.outputResolution,
    outputAspectRatio: input.template.outputAspectRatio,
    estimatedFrames: Math.round(total * input.fps),
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
