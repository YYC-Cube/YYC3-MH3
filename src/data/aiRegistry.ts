/**
 * file: src/data/aiRegistry.ts
 * description: 领域演示快照 · Agent 调用主体注册表（AGENT_REGISTRY，八成员六字段档案）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [data],[ai-registry],[agent],[react-c]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PR-1 端口 v2 — 八成员调用主体注册表：
 *   - 从 YYC3_MEMBERS 派生 AgentProfile（id/name/roleDefinition/capabilities 直读，
 *     capabilities 拷贝防外泄变更），defaultModel 与 riskTags 为成员级基线补全
 *   - 落位 data 层（boundary 铁律：domains 禁触 data，data → types 放行），
 *     与 AGENT_NODES（编排层工位拓扑）分层——成员为调用主体，节点仅引用 memberId
 *   - invokeStep.agentId 的合法全集 = 本注册表 8 员 id
 *
 * dependencies: ../types, ./yyc3Data
 * exports: AGENT_REGISTRY
 */
import { AgentProfile, YYC3Member } from "../types";
import { YYC3_MEMBERS } from "./yyc3Data";

/** 默认推理模型基线（适配器可按部署实际路由覆盖，如 vLLM 部署名） */
const DEFAULT_MODEL = "MiniMax-Text-01";

/** 成员级风险标签基线（zhiyun 守护：数据不离本地，结构性禁外联工具） */
const RISK_BASELINES: Record<string, readonly string[]> = {
  zhiyun: ["local-only"],
};

/** 成员档案派生（直读不复制语义字段；数组字段拷贝快照，调用方变更不回写源） */
function deriveProfile(member: YYC3Member): AgentProfile {
  return {
    id: member.id,
    name: member.name,
    roleDefinition: member.roleDefinition,
    capabilities: [...member.capabilities],
    defaultModel: DEFAULT_MODEL,
    riskTags: [...(RISK_BASELINES[member.id] ?? [])],
  };
}

/**
 * Agent 调用主体注册表（八员，顺序与 YYC3_MEMBERS 一致）：
 * 言启·千行 / 语枢·万物 / 预见·先知 / 千里·伯乐 / 元启·天枢 / 智云·守护 / 格物·宗师 / 创想·灵韵
 */
export const AGENT_REGISTRY: readonly AgentProfile[] = YYC3_MEMBERS.map(deriveProfile);

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
