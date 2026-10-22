/**
 * file: src/app/RoleGate.tsx
 * description: YYC³ 应用层 — RBAC 运行时强制门组件（权限码不满足即渲染拒绝态）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[rbac],[guard],[p1]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-1 RBAC 运行时强制 — 权限矩阵此前仅纯函数无调用点：
 *   - 以会话角色（未登录按 guest 兜底）经域层 canAccess 判定权限码
 *   - 满足 → 渲染 children；不满足 → 渲染 fallback（默认拒绝提示，role=alert）
 *   - 可选 onDeny 回调（组合点可接 createAuditEvent 留痕，result="denied"）
 *   首个运行时挂载点：/settings 路由（权限码 settings:write，仅 admin）
 *
 * dependencies: react, ../domains/admin, ./contexts
 * exports: RoleGateProps, RoleGate
 */
"use client";

import { ReactNode } from "react";

import { canAccess } from "../domains/admin";
import { useAuthContext } from "./contexts";

/** 门组件属性 */
export interface RoleGateProps {
  /** 所需权限码（PERMISSION_MATRIX 权限码，如 "settings:write"） */
  permission: string;
  /** 放行内容 */
  children: ReactNode;
  /** 拒绝态自定义渲染（缺省为 role=alert 拒绝提示） */
  fallback?: ReactNode;
  /** 拒绝回调（可接审计留痕） */
  onDeny?: (role: string, permission: string) => void;
}

/** RBAC 运行时强制门：权限不满足即拒绝态（默认拒绝，明示角色与权限码） */
export function RoleGate({ permission, children, fallback, onDeny }: RoleGateProps) {
  const { currentUser } = useAuthContext();
  const role = currentUser?.role ?? "guest";
  if (canAccess(role, permission)) {
    return <>{children}</>;
  }
  onDeny?.(role, permission);
  return (
    fallback ?? (
      <div role="alert" className="flex h-full w-full items-center justify-center p-8" data-testid="rbac-denied">
        <div className="max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-lg font-semibold text-red-300">访问被拒绝</p>
          <p className="mt-2 text-sm text-red-200/80">
            当前角色「{role}」不持有权限码「{permission}」，如需访问请联系管理员。
          </p>
        </div>
      </div>
    )
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
