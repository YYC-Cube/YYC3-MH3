/**
 * file: src/domains/ai/index.ts
 * description: YYC³ AI 域 — ReAct-C 九步闭环状态机 + Agent 集群拓扑（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[ai],[react-c],[agent],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI 域规则 —
 *   - ReAct-C 九步闭环：感知→推理→检索→规划→行动→观察→反思→修正→沉淀
 *     阶段常量 + 线性推进（末步闭环回首步）+ 完成判定
 *   - Agent 集群拓扑：由 AgentNode 的 outputs/inputs 令牌交集推导协作边与孤立节点
 *
 * dependencies: ../../types
 * exports: ReactCStepKey, ReactCStep, REACT_C_STEPS, nextReactCStep, isReactCComplete, AgentTopologyEdge, AgentTopology, buildAgentTopology
 */
import type { AgentNode } from "../../types";

/** ReAct-C 九步闭环阶段键（AI 域内部状态机标识） */
export type ReactCStepKey =
  | "perceive"
  | "reason"
  | "retrieve"
  | "plan"
  | "act"
  | "observe"
  | "reflect"
  | "revise"
  | "consolidate";

export interface ReactCStep {
  key: ReactCStepKey;
  label: string;
  brief: string;
}

/** ReAct-C 九步闭环阶段顺序 — 全项目单一事实来源 */
export const REACT_C_STEPS: readonly ReactCStep[] = [
  { key: "perceive", label: "感知", brief: "采集输入与环境上下文" },
  { key: "reason", label: "推理", brief: "依目标做因果与意图推断" },
  { key: "retrieve", label: "检索", brief: "召回相关素材与知识" },
  { key: "plan", label: "规划", brief: "编排行动序列与资源" },
  { key: "act", label: "行动", brief: "执行计划并产生中间产物" },
  { key: "observe", label: "观察", brief: "读取执行反馈与度量" },
  { key: "reflect", label: "反思", brief: "对照目标评估偏差" },
  { key: "revise", label: "修正", brief: "调整策略与参数再迭代" },
  { key: "consolidate", label: "沉淀", brief: "固化为经验与可复用资产" },
];

/** 阶段索引（未知阶段返回 -1，与 Array.indexOf 语义一致） */
function reactCStepIndex(step: ReactCStepKey): number {
  return REACT_C_STEPS.findIndex((s) => s.key === step);
}

/** 闭环推进至下一阶段（consolidate 之后回到 perceive，构成九步闭环） */
export function nextReactCStep(step: ReactCStepKey): ReactCStepKey {
  const index = reactCStepIndex(step);
  const next = REACT_C_STEPS[(index + 1) % REACT_C_STEPS.length];
  // 全联合成员均在 REACT_C_STEPS 中，取模结果恒存在（未知阶段回退首阶段）
  return next?.key ?? "perceive";
}

/** 完成判定：到达末步（沉淀）即为一次 ReAct-C 闭环完成 */
export function isReactCComplete(step: ReactCStepKey): boolean {
  return step === "consolidate";
}

/** Agent 集群协作边（由产出方到消费方） */
export interface AgentTopologyEdge {
  from: string;
  to: string;
}

/** Agent 集群拓扑结果（节点全集 / 协作边 / 孤立节点） */
export interface AgentTopology {
  nodes: string[];
  edges: AgentTopologyEdge[];
  isolated: string[];
}

/**
 * 由 AgentNode 契约构建集群拓扑：
 * 若消费者某 input 令牌命中产出者 outputs，则建立一条 producer → consumer 协作边；
 * 无任何边关联的节点视为孤立节点（提示编排缺环）。
 */
export function buildAgentTopology(nodes: readonly AgentNode[]): AgentTopology {
  const ids = nodes.map((n) => n.id);
  const edges: AgentTopologyEdge[] = [];
  for (const producer of nodes) {
    for (const consumer of nodes) {
      if (producer.id === consumer.id) continue;
      const hasLink = consumer.inputs.some((token) => producer.outputs.includes(token));
      if (hasLink) edges.push({ from: producer.id, to: consumer.id });
    }
  }
  const linked = new Set<string>();
  for (const edge of edges) {
    linked.add(edge.from);
    linked.add(edge.to);
  }
  const isolated = ids.filter((id) => !linked.has(id));
  return { nodes: ids, edges, isolated };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
