/**
 * file: src/domains/admin/index.ts
 * description: YYC³ 管理域 — RBAC 权限矩阵 / 成本核算 / 审计事件（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[admin],[rbac],[cost],[audit],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 管理域规则 —
 *   - RBAC：基于 UserRole 的权限矩阵 + canAccess 判定
 *   - 成本核算：算力/存储时长折算（estimateCost）
 *   - 审计：审计事件类型与构造（createAuditEvent）
 *
 * dependencies: ../../types
 * exports: PERMISSION_MATRIX, canAccess, CostEstimateInput, CostEstimate, estimateCost, AuditEvent, createAuditEvent
 */
import type { UserRole } from "../../types";

/** 角色 → 权限码集合（RBAC 单一事实来源） */
export const PERMISSION_MATRIX: Readonly<Record<UserRole, readonly string[]>> = {
  admin: [
    "batch:read",
    "batch:write",
    "seed:read",
    "seed:write",
    "publish",
    "admin:rbac",
    "admin:audit",
    "settings:write",
  ],
  operator: ["batch:read", "batch:write", "seed:read", "seed:write", "publish"],
  guest: ["batch:read", "seed:read"],
};

/** 权限判定：角色是否持有指定权限码 */
export function canAccess(role: UserRole, permission: string): boolean {
  return PERMISSION_MATRIX[role].includes(permission);
}

/** 成本核算入参（算力按秒、存储按 GB·小时折算） */
export interface CostEstimateInput {
  gpuSeconds: number;
  gpuHourlyRateCny: number;
  storageGb: number;
  storageHourlyRateCny: number;
}

export interface CostEstimate {
  gpuCostCny: number;
  storageCostCny: number;
  totalCostCny: number;
}

/** 保留两位小数的成本取整（防浮点尾差向上游泄漏） */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 成本核算：算力（秒→小时 × 时价）+ 存储（GB × 时价） */
export function estimateCost(input: CostEstimateInput): CostEstimate {
  const gpuCost = (input.gpuSeconds / 3600) * input.gpuHourlyRateCny;
  const storageCost = input.storageGb * input.storageHourlyRateCny;
  return {
    gpuCostCny: round2(gpuCost),
    storageCostCny: round2(storageCost),
    totalCostCny: round2(gpuCost + storageCost),
  };
}

/** 审计事件（敏感操作留痕） */
export interface AuditEvent {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  timestamp: string;
  result: "success" | "denied";
}

/** 审计事件构造（now 参数注入便于测试确定性，id 以时间戳派生） */
export function createAuditEvent(
  input: {
    actor: string;
    role: UserRole;
    action: string;
    target: string;
    result: "success" | "denied";
  },
  now = new Date(),
): AuditEvent {
  return {
    id: `AUDIT-${now.getTime()}`,
    actor: input.actor,
    role: input.role,
    action: input.action,
    target: input.target,
    timestamp: now.toISOString(),
    result: input.result,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
