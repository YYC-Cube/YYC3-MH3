/**
 * file: src/__tests__/domains.six.test.ts
 * description: 六域骨架纯函数单元测试 — ai/admin/editing/distribution 规则与边界
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[domain],[ai],[admin],[editing],[distribution]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2 六域骨架纯函数基线（ReAct-C 状态机 / RBAC / 成本审计 / 时间线 / 渠道分发）
 *
 * dependencies: vitest, ../domains/ai, ../domains/admin, ../domains/editing, ../domains/distribution, ../types
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { PERMISSION_MATRIX, canAccess, createAuditEvent, estimateCost } from "../domains/admin";
import { REACT_C_STEPS, buildAgentTopology, isReactCComplete, nextReactCStep } from "../domains/ai";
import { groupTasksByPlatform, isDispatchComplete, platformLabel } from "../domains/distribution";
import {
  applyTemplate,
  buildRenderPlan,
  sortClips,
  totalDurationOf,
  type EditTemplate,
} from "../domains/editing";
import type { AgentNode, MediaClipItem, PushTaskItem } from "../types";

/* ---------------- ai：ReAct-C 九步闭环 + Agent 集群拓扑 ---------------- */

describe("domains/ai", () => {
  it("REACT_C_STEPS 为九步且顺序恒定（感知→…→沉淀）", () => {
    expect(REACT_C_STEPS.map((s) => s.key)).toEqual([
      "perceive",
      "reason",
      "retrieve",
      "plan",
      "act",
      "observe",
      "reflect",
      "revise",
      "consolidate",
    ]);
  });

  it("nextReactCStep 顺序推进且 consolidate 闭环回 perceive", () => {
    expect(nextReactCStep("perceive")).toBe("reason");
    expect(nextReactCStep("revise")).toBe("consolidate");
    expect(nextReactCStep("consolidate")).toBe("perceive");
  });

  it("isReactCComplete 仅沉淀阶段判定完成", () => {
    expect(isReactCComplete("consolidate")).toBe(true);
    expect(isReactCComplete("observe")).toBe(false);
  });

  it("buildAgentTopology 由 outputs→inputs 令牌交集推导协作边与孤立节点", () => {
    const nodes: AgentNode[] = [
      makeAgentNode("script-agent", "剧本", ["script"], ["storyboard"]),
      makeAgentNode("storyboard-agent", "分镜", ["storyboard"], ["video"]),
      makeAgentNode("isolated-agent", "孤立", ["none"], ["nothing"]),
    ];
    const topology = buildAgentTopology(nodes);
    expect(topology.nodes).toEqual(["script-agent", "storyboard-agent", "isolated-agent"]);
    expect(topology.edges).toEqual([{ from: "script-agent", to: "storyboard-agent" }]);
    expect(topology.isolated).toEqual(["isolated-agent"]);
  });
});

function makeAgentNode(id: string, label: string, inputs: string[], outputs: string[]): AgentNode {
  return {
    id,
    label,
    role: label,
    roleColor: "#00b4d8",
    memberId: "yanqi",
    type: "script",
    x: 0,
    y: 0,
    status: "idle",
    inputs,
    outputs,
    config: { model: "test", enabled: true },
  };
}

/* ---------------- admin：RBAC / 成本核算 / 审计 ---------------- */

describe("domains/admin", () => {
  it("PERMISSION_MATRIX 覆盖全部角色且 admin 权限超集包含 operator", () => {
    expect(Object.keys(PERMISSION_MATRIX).sort()).toEqual(["admin", "guest", "operator"]);
    for (const perm of PERMISSION_MATRIX.operator) {
      expect(canAccess("admin", perm)).toBe(true);
    }
  });

  it("canAccess 依角色判定权限（越权返回 false）", () => {
    expect(canAccess("operator", "publish")).toBe(true);
    expect(canAccess("guest", "publish")).toBe(false);
    expect(canAccess("guest", "batch:read")).toBe(true);
    expect(canAccess("operator", "admin:rbac")).toBe(false);
  });

  it("estimateCost 折算算力（秒→小时）+ 存储并保留两位小数", () => {
    const cost = estimateCost({
      gpuSeconds: 3600,
      gpuHourlyRateCny: 3.5,
      storageGb: 10,
      storageHourlyRateCny: 0.12,
    });
    expect(cost.gpuCostCny).toBe(3.5);
    expect(cost.storageCostCny).toBe(1.2);
    expect(cost.totalCostCny).toBe(4.7);
  });

  it("createAuditEvent 以注入时间派生确定性 id 与时间戳", () => {
    const event = createAuditEvent(
      { actor: "root", role: "admin", action: "publish", target: "BATCH-1", result: "success" },
      new Date("2026-10-16T00:00:00.000Z"),
    );
    expect(event.id).toBe(`AUDIT-${new Date("2026-10-16T00:00:00.000Z").getTime()}`);
    expect(event.timestamp).toBe("2026-10-16T00:00:00.000Z");
    expect(event.result).toBe("success");
  });
});

/* ---------------- editing：时间线 / 模板 / 渲染计划 ---------------- */

describe("domains/editing", () => {
  const clips: MediaClipItem[] = [makeClip("C2", 5, 3), makeClip("C1", 0, 4), makeClip("C3", 8, 2)];

  it("totalDurationOf 聚合片段时长", () => {
    expect(totalDurationOf(clips)).toBe(9);
  });

  it("sortClips 按起点升序返回新数组（不改动入参）", () => {
    const ordered = sortClips(clips);
    expect(ordered.map((c) => c.id)).toEqual(["C1", "C2", "C3"]);
    expect(clips.map((c) => c.id)).toEqual(["C2", "C1", "C3"]);
  });

  it("applyTemplate 以模板输出规格重写片段分辨率/画幅", () => {
    const templated = applyTemplate(TEMPLATE, clips);
    for (const clip of templated) {
      expect(clip.resolution).toBe("1080x1920");
      expect(clip.aspectRatio).toBe("9:16");
    }
  });

  it("buildRenderPlan 依排序片段与帧率生成导出计划", () => {
    const plan = buildRenderPlan({ clips, template: TEMPLATE, fps: 30 });
    expect(plan.orderedClipIds).toEqual(["C1", "C2", "C3"]);
    expect(plan.totalDurationSec).toBe(9);
    expect(plan.estimatedFrames).toBe(270);
    expect(plan.outputResolution).toBe("1080x1920");
  });
});

const TEMPLATE: EditTemplate = {
  id: "TPL-1",
  name: "竖屏短视频",
  transition: "cut",
  outputResolution: "1080x1920",
  outputAspectRatio: "9:16",
};

function makeClip(id: string, startSec: number, durationSec: number): MediaClipItem {
  return {
    id,
    name: id,
    startSec,
    endSec: startSec + durationSec,
    durationSec,
    resolution: "720x1280",
    aspectRatio: "9:16",
    audioAligned: true,
  };
}

/* ---------------- distribution：渠道 / 分发完成 / 分组 ---------------- */

describe("domains/distribution", () => {
  it("platformLabel 返回渠道中文标签", () => {
    expect(platformLabel("douyin")).toBe("抖音");
    expect(platformLabel("bilibili")).toBe("哔哩哔哩");
    expect(platformLabel("nas")).toBe("本地 NAS");
  });

  it("isDispatchComplete 仅在存在任务且全部完成时为 true", () => {
    expect(isDispatchComplete([])).toBe(false);
    expect(isDispatchComplete([makePushTask("t1", "completed", ["douyin"])])).toBe(true);
    expect(
      isDispatchComplete([
        makePushTask("t1", "completed", ["douyin"]),
        makePushTask("t2", "queued", ["channels"]),
      ]),
    ).toBe(false);
  });

  it("groupTasksByPlatform 返回全渠道齐备的分组表", () => {
    const grouped = groupTasksByPlatform([
      makePushTask("t1", "completed", ["douyin", "channels"]),
      makePushTask("t2", "queued", ["douyin"]),
    ]);
    expect(grouped.douyin.map((t) => t.id)).toEqual(["t1", "t2"]);
    expect(grouped.channels.map((t) => t.id)).toEqual(["t1"]);
    expect(grouped.bilibili).toEqual([]);
    expect(Object.keys(grouped)).toHaveLength(7);
  });
});

function makePushTask(
  id: string,
  status: PushTaskItem["status"],
  platforms: PushTaskItem["platforms"],
): PushTaskItem {
  return {
    id,
    title: id,
    batchId: "BATCH-1",
    platforms,
    status,
    progress: status === "completed" ? 100 : 0,
    speed: "0 MB/s",
    estRemaining: "—",
    targetAccount: "acct",
    retryCount: 0,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
