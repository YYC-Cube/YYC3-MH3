/**
 * file: src/data/auth.ts
 * description: 领域演示快照 · 本地认证会话（AuthUser）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [data],[mock],[auth]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 本地演示会话（断网默认登录态，产品演示语义 — 口径见 05 Runbook）
 *
 * dependencies: ../types
 * exports: INITIAL_DEMO_SESSION
 */
import { AuthUser } from "../types";

export const INITIAL_DEMO_SESSION: AuthUser = {
  username: "admin",
  displayName: "本地超级管理员",
  role: "admin",
  mode: "local",
  lastLogin: "2025-04-12 09:42:18",
  avatar: "/yyc3-icons/logo.png",
  token: "tok_initial_local_session",
  permissions: ["all_pipeline", "models_write", "ops_control", "seed_mutate"],
  ipAddress: "127.0.0.1 (本地安全环回)",
  device: "Workstation RTX 4090 (24GB)",
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
