/**
 * file: src/domains/ai/family.ts
 * description: YYC³ AI 域 — AI Family 成员协同回复规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[ai],[family],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI Family 会话域规则 —
 *   - familyReply：按成员分支的罐装回复决策（回复文案 + 可执行动作 + 负载）。
 *     默认分支回显用户指令并注入 DiffSynth 参数约束；
 *     悟光(gewu) 唇形时序补偿 / 千里(qianli) S 级种子比对 / 智运(zhiyun) 显存自愈
 *     为成员专属决策，文案逐字为产品口径。
 *   - familyGreeting：元启·天枢默认问候卡（会话初始消息的语义来源）。
 *
 * dependencies: ../../types
 * exports: FamilyReplyPayload, FamilyReplyDecision, familyReply, FamilyGreeting, familyGreeting
 */
import type { YYC3Member } from "../../types";

/** Family 可执行动作负载（参数注入 / 种子载入），与组件层消息契约结构同型 */
export type FamilyReplyPayload =
  | { guidanceScale: number; steps: number; denoiseStrength?: number }
  | { seedNumber: number };

/** Family 罐装回复决策（回复文案 + 动作标签 + 负载） */
export interface FamilyReplyDecision {
  text: string;
  actionLabel: string;
  payload: FamilyReplyPayload;
}

/**
 * 按成员分支的罐装回复决策（纯函数）：
 * 未命中专属成员时走默认调度口径（回显指令 + 参数约束负载）。
 */
export function familyReply(member: Pick<YYC3Member, "id" | "name">, prompt: string): FamilyReplyDecision {
  let text = `已接收您的指令「${prompt}」。已通过 ${member.name} 调度本地 DiffSynth 推理引擎，参数约束已就绪。`;
  let actionLabel = "应用调优方案至流水线";
  let payload: FamilyReplyPayload = { guidanceScale: 7.2, steps: 32 };

  if (member.id === "gewu") {
    text =
      "针对第 142 帧轻微迟滞分析：系眨眼间隔（380ms）略高于黄金基准（250ms）。已生成唇形掩码平滑补偿权重，建议采用。";
    actionLabel = "一键应用唇形时序补偿补丁";
  } else if (member.id === "qianli") {
    text = "已从种子库比对出与当前人物面容最贴合的 S 级基线 Seed #81923011，该种子具备 96.8 分抗抖动特性。";
    actionLabel = "载入 S 级种子 #81923011";
    payload = { seedNumber: 81923011 };
  } else if (member.id === "zhiyun") {
    text = "已检测到当前 VRAM 占用 19.4GB。已执行显存碎片平滑整理与 24h 前临时切片清除，释放出 3.4GB 缓冲空间。";
    actionLabel = "查看运维自愈日志";
  }

  return { text, actionLabel, payload };
}

/** Family 默认问候卡（元启·天枢全局播报；UI 侧补 id/sender 消息壳） */
export interface FamilyGreeting {
  agentName: string;
  agentColor: string;
  text: string;
  timestamp: string;
  actionLabel: string;
  actionType: string;
  payload: FamilyReplyPayload;
}

/** 默认问候卡构造（纯函数，文案/配色/负载为产品口径） */
export function familyGreeting(): FamilyGreeting {
  return {
    agentName: "元启·天枢",
    agentColor: "#00e0b8",
    text: "生产线全局状态正常，五步流水线各节点 Agent 保持 74ms 超低协同延迟。请问有何生产任务需要指派调度？",
    timestamp: "08:26",
    actionLabel: "一键将当前推荐参数应用至工作台",
    actionType: "apply_params",
    payload: { guidanceScale: 7.5, steps: 30, denoiseStrength: 0.65 },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
