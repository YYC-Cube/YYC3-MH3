/**
 * file: src/types/admin.ts
 * description: YYC³ 类型契约 — 管理域（角色 / 认证模式 / 认证用户）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[admin],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 管理域契约 — 登录角色 / 认证模式 / 认证用户档案
 *
 * dependencies: —
 * exports: UserRole, AuthMode, AuthUser
 */

/** 登录角色（LoginView 角色选择器与 AuthUser.role 的单一事实来源） */
export type UserRole = "admin" | "operator" | "guest";

/** 认证模式：本地离线 / 团队协同 */
export type AuthMode = "local" | "team";

export interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
  mode: AuthMode;
  lastLogin: string;
  avatar?: string;
  token: string;
  permissions: string[];
  ipAddress?: string;
  device?: string;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
