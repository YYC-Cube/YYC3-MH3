/**
 * file: src/__tests__/domains.pure.test.ts
 * description: 领域层纯函数单元测试 — pipeline/batch/seed/quality 规则与边界
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[domain],[pure]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 领域层纯函数单元测试（先于视图迁移建立规则基线）
 *
 * dependencies: vitest, ../domains/*
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { createBatchId, createBatchItem, findCurrentBatch } from "../domains/batch";
import {
  PIPELINE_STAGE_ORDER,
  advancePipeline,
  getNextStage,
  getStageIndex,
  stageForProgress,
} from "../domains/pipeline";
import { averageDimensionScore } from "../domains/quality";
import { createSeedFromAdoption, generateSeedNumber } from "../domains/seed";
import { BatchItem } from "../types";

/* ---------------- pipeline：五步闭环流水线 ---------------- */

describe("domains/pipeline", () => {
  it("PIPELINE_STAGE_ORDER 为五阶段且顺序恒定", () => {
    expect(PIPELINE_STAGE_ORDER).toEqual([
      "generation",
      "scoring",
      "fine_eval",
      "analysis",
      "seed_iter",
    ]);
  });

  it("getStageIndex 返回阶段索引，未知阶段返回 -1", () => {
    expect(getStageIndex("generation")).toBe(0);
    expect(getStageIndex("seed_iter")).toBe(4);
    // @ts-expect-error 故意注入非法值验证运行时韧性
    expect(getStageIndex("unknown")).toBe(-1);
  });

  it("getNextStage 顺序推进且 seed_iter 闭环回 generation", () => {
    expect(getNextStage("generation")).toBe("scoring");
    expect(getNextStage("scoring")).toBe("fine_eval");
    expect(getNextStage("fine_eval")).toBe("analysis");
    expect(getNextStage("analysis")).toBe("seed_iter");
    expect(getNextStage("seed_iter")).toBe("generation");
  });

  it("stageForProgress 阈值边界与生产规则一致（>80/>60/>40/>20）", () => {
    expect(stageForProgress(0)).toBe("generation");
    expect(stageForProgress(20)).toBe("generation"); // 等于阈值不升段
    expect(stageForProgress(21)).toBe("scoring");
    expect(stageForProgress(40)).toBe("scoring");
    expect(stageForProgress(41)).toBe("fine_eval");
    expect(stageForProgress(60)).toBe("fine_eval");
    expect(stageForProgress(61)).toBe("analysis");
    expect(stageForProgress(80)).toBe("analysis");
    expect(stageForProgress(81)).toBe("seed_iter");
    expect(stageForProgress(99)).toBe("seed_iter");
  });

  it("advancePipeline 未完成时按增量推进并映射阶段", () => {
    expect(advancePipeline(0)).toEqual({
      progress: 5,
      stage: "generation",
      completed: false,
    });
    expect(advancePipeline(20, 5)).toEqual({
      progress: 25,
      stage: "scoring",
      completed: false,
    });
    expect(advancePipeline(80, 5)).toEqual({
      progress: 85,
      stage: "seed_iter",
      completed: false, // >80 落 seed_iter 阶段，但尚未 100% 完机
    });
  });

  it("advancePipeline 达 100% 时收敛停机并落完成态", () => {
    expect(advancePipeline(95)).toEqual({
      progress: 100,
      stage: "seed_iter",
      completed: true,
    });
    // 跨越 100（99+5=104）亦收敛为 100，防溢出
    expect(advancePipeline(99)).toEqual({
      progress: 100,
      stage: "seed_iter",
      completed: true,
    });
  });
});

/* ---------------- batch：生产批次 ---------------- */

function makeBatch(id: string): BatchItem {
  return {
    id,
    name: `批次 ${id}`,
    mode: "Ref2VA",
    seed: 48920194,
    prompt: "演示提示词",
    status: "completed",
    progress: 100,
    currentStage: "seed_iter",
    startTime: "08:00:00",
    duration: "00:15",
    score: 95.2,
    lipSyncScore: 96,
    expressionScore: 93.5,
    stabilityScore: 97,
    coherenceScore: 94,
    fidelityScore: 95.5,
    resolution: "1080x1920",
    fps: 30,
    vramUsageGb: 19.4,
    previewThumbnail: "/placeholders/person.svg",
    tags: ["测试"],
  };
}

describe("domains/batch", () => {
  const batches = [makeBatch("BATCH-A"), makeBatch("BATCH-B")];

  it("findCurrentBatch 精确命中 activeId", () => {
    expect(findCurrentBatch(batches, "BATCH-B")?.id).toBe("BATCH-B");
  });

  it("findCurrentBatch 未命中时回退首个批次", () => {
    expect(findCurrentBatch(batches, "BATCH-X")?.id).toBe("BATCH-A");
  });

  it("findCurrentBatch 无 activeId 时返回首个批次", () => {
    expect(findCurrentBatch(batches)?.id).toBe("BATCH-A");
  });

  it("findCurrentBatch 空批次库返回 undefined（调用方渲染空态）", () => {
    expect(findCurrentBatch([], "BATCH-A")).toBeUndefined();
    expect(findCurrentBatch([])).toBeUndefined();
  });

  it("createBatchId 生成 BATCH-YYYYMMDD-NNN 编号", () => {
    const id = createBatchId(4, new Date("2026-10-12T00:00:00Z"));
    expect(id).toBe("BATCH-20261012-094");
  });

  it("createBatchId 序号三位补零", () => {
    expect(createBatchId(0, new Date("2026-01-01T00:00:00Z"))).toBe("BATCH-20260101-090");
    expect(createBatchId(11, new Date("2026-01-01T00:00:00Z"))).toBe("BATCH-20260101-101");
  });

  it("createBatchItem 以 S 级演示基线构造新批次（五步流水线 generation 起步）", () => {
    const batch = createBatchItem(
      { name: "测试批次", mode: "FL2VA", seed: 12345678, prompt: "test prompt" },
      4,
      new Date("2026-10-12T00:00:00Z"),
    );
    expect(batch.id).toBe("BATCH-20261012-094");
    expect(batch.status).toBe("running");
    expect(batch.progress).toBe(10);
    expect(batch.currentStage).toBe("generation");
    expect(batch.tags).toEqual(["FL2VA", "五步流水线"]);
    expect(batch.score).toBe(95.2);
    expect(batch.lipSyncScore).toBe(96.0);
    expect(batch.resolution).toBe("1080x1920");
  });

  it("createBatchItem 草案字段透传（名称/模式/种子/提示词）", () => {
    const batch = createBatchItem(
      {
        name: "自定义名称",
        mode: "Ref2VA",
        seed: 87654321,
        prompt: "custom prompt",
      },
      0,
      new Date("2026-01-01T00:00:00Z"),
    );
    expect(batch.name).toBe("自定义名称");
    expect(batch.mode).toBe("Ref2VA");
    expect(batch.seed).toBe(87654321);
    expect(batch.prompt).toBe("custom prompt");
  });
});

/* ---------------- seed：种子规则 ---------------- */

describe("domains/seed", () => {
  it("generateSeedNumber 生成 8 位整数，值域 [10000000, 99999999]", () => {
    for (let i = 0; i < 200; i++) {
      const n = generateSeedNumber();
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(10000000);
      expect(n).toBeLessThanOrEqual(99999999);
    }
  });

  it("createSeedFromAdoption 以采纳数据回填 S 级基线种子", () => {
    const seed = createSeedFromAdoption({
      seedNumber: 81923011,
      name: "测试回写",
      avgScore: 96.8,
      tags: ["人工复核通过"],
    });
    expect(seed.id).toBe("SEED-81923011");
    expect(seed.tier).toBe("S");
    expect(seed.generationCount).toBe(1);
    expect(seed.isFavorite).toBe(true);
    expect(seed.recommendedModel).toBe("DiffSynth-MiniMax-H3-v2.1-HQ");
    expect(seed.name).toBe("测试回写");
    expect(seed.avgScore).toBe(96.8);
    expect(seed.tags).toEqual(["人工复核通过"]);
  });

  it("createSeedFromAdoption 缺省字段回填生产默认值", () => {
    const seed = createSeedFromAdoption({});
    expect(seed.seedNumber).toBe(81923011);
    expect(seed.name).toBe("优质回写种子");
    expect(seed.avgScore).toBe(95.0);
    expect(seed.params.guidanceScale).toBe(7.5);
    expect(seed.params.steps).toBe(30);
  });
});

/* ---------------- quality：质量评分 ---------------- */

describe("domains/quality", () => {
  it("averageDimensionScore 计算多维均分", () => {
    expect(averageDimensionScore([{ score: 95.8 }, { score: 92.4 }, { score: 97.2 }])).toBeCloseTo(
      95.1333,
      4,
    );
  });

  it("averageDimensionScore 空集合返回 0（防 NaN 泄漏）", () => {
    expect(averageDimensionScore([])).toBe(0);
  });

  it("averageDimensionScore 兼容 RadarDimension 结构（结构化最小契约）", () => {
    // 先声明为具体维度对象，再经变量宽化为最小契约（结构与 RadarDimension 兼容）
    const radarDim = {
      score: 90,
      key: "lipSync",
      label: "口型",
      benchmark: 88,
      threshold: 85,
      advice: "",
    };
    const radarLike: { score: number }[] = [radarDim];
    expect(averageDimensionScore(radarLike)).toBe(90);
  });
});
