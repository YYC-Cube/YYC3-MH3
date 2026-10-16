/**
 * file: src/__tests__/domains.ai.test.ts
 * description: AI 域纯函数单元测试 — Family 罐装回复分支 / 默认问候卡（P1-3 上移基线）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[domain],[ai],[family],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: domains/ai/family 纯函数测试 — 默认调度口径回显指令、
 *        gewu/qianli/zhiyun 专属决策文案与负载、问候卡字段齐备、纯函数幂等
 *
 * dependencies: vitest, ../domains/ai/family
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { familyGreeting, familyReply } from "../domains/ai/family";

/** 最小成员契约（familyReply 仅消费 id/name） */
function member(id: string, name = id): { id: string; name: string } {
  return { id, name };
}

describe("domains/ai · familyReply", () => {
  it("默认分支：回显用户指令 + 注入成员名与 DiffSynth 参数约束负载", () => {
    const d = familyReply(member("yanqi", "元启·天枢"), "启动黄金时段直播任务");
    expect(d.text).toBe(
      "已接收您的指令「启动黄金时段直播任务」。已通过 元启·天枢 调度本地 DiffSynth 推理引擎，参数约束已就绪。",
    );
    expect(d.actionLabel).toBe("应用调优方案至流水线");
    expect(d.payload).toEqual({ guidanceScale: 7.2, steps: 32 });
  });

  it("gewu 分支：唇形时序补偿专属决策（负载沿用默认参数约束）", () => {
    const d = familyReply(member("gewu", "悟光"), "第 142 帧为什么迟滞");
    expect(d.text).toBe(
      "针对第 142 帧轻微迟滞分析：系眨眼间隔（380ms）略高于黄金基准（250ms）。已生成唇形掩码平滑补偿权重，建议采用。",
    );
    expect(d.actionLabel).toBe("一键应用唇形时序补偿补丁");
    expect(d.payload).toEqual({ guidanceScale: 7.2, steps: 32 });
  });

  it("qianli 分支：S 级种子比对决策（负载切换 seedNumber）", () => {
    const d = familyReply(member("qianli", "千里"), "找一个抗抖动的种子");
    expect(d.text).toBe(
      "已从种子库比对出与当前人物面容最贴合的 S 级基线 Seed #81923011，该种子具备 96.8 分抗抖动特性。",
    );
    expect(d.actionLabel).toBe("载入 S 级种子 #81923011");
    expect(d.payload).toEqual({ seedNumber: 81923011 });
  });

  it("zhiyun 分支：显存自愈决策（负载沿用默认参数约束）", () => {
    const d = familyReply(member("zhiyun", "智运"), "显存吃紧怎么办");
    expect(d.text).toBe(
      "已检测到当前 VRAM 占用 19.4GB。已执行显存碎片平滑整理与 24h 前临时切片清除，释放出 3.4GB 缓冲空间。",
    );
    expect(d.actionLabel).toBe("查看运维自愈日志");
    expect(d.payload).toEqual({ guidanceScale: 7.2, steps: 32 });
  });

  it("纯函数自证：同参两次调用决策逐字段相等", () => {
    const a = familyReply(member("gewu", "悟光"), "p");
    const b = familyReply(member("gewu", "悟光"), "p");
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

describe("domains/ai · familyGreeting", () => {
  it("元启·天枢默认问候卡字段齐备（文案/配色/动作/负载）", () => {
    const g = familyGreeting();
    expect(g.agentName).toBe("元启·天枢");
    expect(g.agentColor).toBe("#00e0b8");
    expect(g.text).toBe(
      "生产线全局状态正常，五步流水线各节点 Agent 保持 74ms 超低协同延迟。请问有何生产任务需要指派调度？",
    );
    expect(g.timestamp).toBe("08:26");
    expect(g.actionLabel).toBe("一键将当前推荐参数应用至工作台");
    expect(g.actionType).toBe("apply_params");
    expect(g.payload).toEqual({ guidanceScale: 7.5, steps: 30, denoiseStrength: 0.65 });
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
