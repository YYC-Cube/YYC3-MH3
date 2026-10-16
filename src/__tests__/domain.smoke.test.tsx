/**
 * file: src/__tests__/domain.smoke.test.tsx
 * description: YYC³ 冒烟测试用例
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [test],[smoke]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 冒烟测试用例
 *
 * dependencies: vitest, ../components/pipeline/PipelineBar, ../data/agent, ../adapters/memory/fixtures/batch, ../adapters/memory/fixtures/seed, ../data/yyc3Data
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { STAGES } from "../components/pipeline/PipelineBar";
import { AGENT_NODES } from "../data/agent";
import { INITIAL_BATCHES } from "../adapters/memory/fixtures/batch";
import { INITIAL_SEEDS } from "../adapters/memory/fixtures/seed";
import { YYC3_MEMBERS } from "../data/yyc3Data";

describe("领域数据不变量冒烟", () => {
  it("YYC³ AI Family 固定为 8 位成员，档案字段完整", () => {
    expect(YYC3_MEMBERS).toHaveLength(8);
    YYC3_MEMBERS.forEach((m) => {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.roleColor).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      expect(m.responsibilities.length).toBeGreaterThan(0);
      expect(m.capabilities.length).toBeGreaterThan(0);
    });
  });

  it("Agent 工作流节点均关联有效 AI Family 成员", () => {
    const memberIds = new Set(YYC3_MEMBERS.map((m) => m.id));
    expect(AGENT_NODES.length).toBeGreaterThan(0);
    AGENT_NODES.forEach((n) => {
      expect(memberIds.has(n.memberId)).toBe(true);
      expect(n.roleColor).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    });
  });

  it("五步闭环流水线阶段定义完整", () => {
    expect(STAGES).toHaveLength(5);
    STAGES.forEach((st) => {
      expect(st.key).toBeTruthy();
      expect(st.label).toBeTruthy();
    });
  });

  it("批次与种子初始数据结构完整", () => {
    expect(INITIAL_BATCHES.length).toBeGreaterThan(0);
    INITIAL_BATCHES.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.score).toBeGreaterThanOrEqual(0);
      expect(b.score).toBeLessThanOrEqual(100);
      expect(b.vramUsageGb).toBeGreaterThanOrEqual(0);
    });
    expect(INITIAL_SEEDS.length).toBeGreaterThan(0);
    INITIAL_SEEDS.forEach((s) => {
      expect(["S", "A", "B", "Experimental"]).toContain(s.tier);
      expect(s.seedNumber).toBeGreaterThan(0);
    });
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
