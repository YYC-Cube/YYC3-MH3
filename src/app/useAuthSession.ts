/**
 * file: src/app/useAuthSession.ts
 * description: YYC³ 应用层 — 认证会话 Hook（本地演示会话 + 登录/旁路/退出）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [app],[hook],[auth]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 认证会话 Hook — 初始本地演示会话，login/bypass/logout 状态收敛
 *
 * dependencies: react, ../data/auth, ../types
 * exports: useAuthSession
 */
import { useState } from "react";
import { INITIAL_DEMO_SESSION } from "../data/auth";
import { AuthUser } from "../types";

/** 认证会话状态机（演示语义：本地单用户，无网络认证依赖） */
export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(INITIAL_DEMO_SESSION);
  const [isLoginViewOpen, setIsLoginViewOpen] = useState(false);

  /** 登录成功：写入会话并关闭登录视图 */
  const login = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginViewOpen(false);
  };

  /** 预览旁路：跳过认证直接进入演示工作台（不写入会话） */
  const bypassLogin = () => setIsLoginViewOpen(false);

  /** 退出登录：清空会话并回到登录视图 */
  const logout = () => {
    setCurrentUser(null);
    setIsLoginViewOpen(true);
  };

  return {
    currentUser,
    isLoginViewOpen,
    setIsLoginViewOpen,
    login,
    bypassLogin,
    logout,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
