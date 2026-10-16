/**
 * file: src/adapters/memory/fixtures/auth.ts
 * description: YYC³ memory 适配器夹具 — 本地认证会话演示快照（AuthUser，顶层冻结）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[memory],[fixtures],[auth]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 本地演示会话（断网默认登录态，产品演示语义 — 口径见 05 Runbook）—
 *        顶层 Object.freeze（审计 G-2）：对象层冻结防就地污染；
 *        消费方（App Hook）初始化时必须再浅拷贝出新对象，禁止回写本模块。
 *
 * dependencies: ../../../types
 * exports: INITIAL_DEMO_SESSION
 */
import { AuthUser } from "../../../types";

/** 演示会话（顶层冻结；permissions 数组为嵌套引用，禁止就地修改） */
export const INITIAL_DEMO_SESSION: Readonly<AuthUser> = Object.freeze({
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
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
