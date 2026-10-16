/**
 * file: src/views/LoginView/useLoginView.ts
 * description: YYC³ 视图状态 — LoginView 登录表单状态机（六步闭环校验 / 防爆破锁定 / 双模准入）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[hook],[state],[login],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: LoginView 唯一状态真值源 —— 从原视图逐字提取的状态与事件编排，零重设计。
 *
 * dependencies: react, ../../types
 * exports: ShowToastFn, isUserRole, LoginViewState, UseLoginViewOptions, useLoginView
 */
import React, { useEffect, useState } from "react";
import { AuthUser, UserRole } from "../../types";

/** 原生 select 值为运行时 string，收窄至 UserRole 的类型守卫 */
export const isUserRole = (v: string): v is UserRole =>
  v === "admin" || v === "operator" || v === "guest";

/** Toast 上报回调签名（容器与各分区共用） */
export type ShowToastFn = (
  type: "success" | "error" | "warning" | "info",
  msg: string,
  sub?: string,
) => void;

export interface UseLoginViewOptions {
  onLoginSuccess: (user: AuthUser) => void;
  onShowToast: ShowToastFn;
}

/** LoginView 状态与事件编排的完整装配面 */
export interface LoginViewState {
  authMode: "local" | "team";
  setAuthMode: React.Dispatch<React.SetStateAction<"local" | "team">>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  rememberCredentials: boolean;
  setRememberCredentials: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRole: UserRole;
  setSelectedRole: React.Dispatch<React.SetStateAction<UserRole>>;
  fieldErrors: { username?: string; password?: string };
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  isLocked: boolean;
  lockCountdown: number;
  isVerifying: boolean;
  verificationStep: number;
  verificationLog: string;
  isOfflineExplainOpen: boolean;
  setIsOfflineExplainOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isQrLoginOpen: boolean;
  setIsQrLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNightMode: boolean;
  setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleLoginSubmit: (e?: React.FormEvent) => void;
  handleSimulateFail: () => void;
}

export function useLoginView({ onLoginSuccess, onShowToast }: UseLoginViewOptions): LoginViewState {
  // Auth Mode: Local offline vs. Team Cloud
  const [authMode, setAuthMode] = useState<"local" | "team">("local");

  // Form Fields
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  // Validation & Error state
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Closed-loop verification pipeline animation state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [verificationLog, setVerificationLog] = useState<string>("");

  // Modals state
  const [isOfflineExplainOpen, setIsOfflineExplainOpen] = useState(false);
  const [isQrLoginOpen, setIsQrLoginOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // Handle Lockout countdown
  useEffect(() => {
    let timer: number | null = null;
    if (isLocked && lockCountdown > 0) {
      timer = window.setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockCountdown]);

  // Validation
  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "请输入管理员账号或员工工号";
    }
    if (!password || password.length < 6) {
      errors.password = "密码长度不能少于 6 位";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Node 1 to Node 6 Closed-Loop Login Execution
  const handleLoginSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLocked) {
      onShowToast("error", `账号已临时锁定，请等待 ${lockCountdown} 秒后重试`);
      return;
    }

    // Node 1: Frontend format validation
    if (!validateForm()) {
      setErrorMessage("请完整填写账号与密码");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);
    setVerificationStep(1);
    setVerificationLog("正在校验本地凭证格式与安全哈希...");

    // Node 2: Credential verification (simulate local SHA-256 compare)
    setTimeout(() => {
      setVerificationStep(2);
      setVerificationLog(
        authMode === "local"
          ? "正在匹配本地安全加密凭证库 (Argon2id)..."
          : "正在请求企业身份服务端鉴权...",
      );

      setTimeout(() => {
        // Node 3: Role & Permission mapping
        setVerificationStep(3);
        setVerificationLog(
          `匹配角色权限矩阵: [${
            selectedRole === "admin" ? "超级管理员 (Full Access)" : "生产线操作员"
          }]`,
        );

        setTimeout(() => {
          // Node 4: Safety environment inspection
          setVerificationStep(4);
          setVerificationLog("正在扫描本地运行环境：PyTorch 2.4、CUDA 12.4、RTX 4090 显存...");

          setTimeout(() => {
            // Node 5: Audit logging
            setVerificationStep(5);
            setVerificationLog(
              "正在写入本地遥测留痕（浏览器环境持久化）(设备: LocalStation-01)...",
            );

            setTimeout(() => {
              // Node 6: Session initialization & entrance
              setVerificationStep(6);
              setVerificationLog("会话初始化完成，正在进入总览驾驶舱...");

              setTimeout(() => {
                setIsVerifying(false);
                const user: AuthUser = {
                  username: username.trim(),
                  displayName: authMode === "local" ? "本地超级管理员" : "企业生产主管",
                  role: selectedRole,
                  mode: authMode,
                  lastLogin: "2025-04-12 09:42:18",
                  avatar: "/yyc3-icons/logo.png",
                  token: `tok_${Date.now()}_secure_local`,
                  permissions: ["all_pipeline", "models_write", "ops_control", "seed_mutate"],
                  ipAddress: "127.0.0.1 (本地安全环回)",
                  device: "Workstation RTX 4090 (24GB)",
                };
                onLoginSuccess(user);
                onShowToast(
                  "success",
                  `欢迎回来，${user.displayName}`,
                  `上次登录时间: ${user.lastLogin} · 本地优先数据主权已就绪`,
                );
              }, 400);
            }, 400);
          }, 450);
        }, 400);
      }, 450);
    }, 400);
  };

  // Simulate failed login attempt for testing
  const handleSimulateFail = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 3) {
      setIsLocked(true);
      setLockCountdown(30);
      setErrorMessage(
        `密码连续输入错误已达 ${nextAttempts} 次，系统已启动安全防护，账号锁定 30 秒`,
      );
      onShowToast("error", "触发账号安全防爆破锁定", "已拦截异常密码尝试");
    } else {
      setErrorMessage(`密码错误，剩余 ${3 - nextAttempts} 次尝试机会`);
      onShowToast("warning", "账号或密码校验失败");
    }
  };

  return {
    authMode,
    setAuthMode,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberCredentials,
    setRememberCredentials,
    selectedRole,
    setSelectedRole,
    fieldErrors,
    errorMessage,
    setErrorMessage,
    isLocked,
    lockCountdown,
    isVerifying,
    verificationStep,
    verificationLog,
    isOfflineExplainOpen,
    setIsOfflineExplainOpen,
    isQrLoginOpen,
    setIsQrLoginOpen,
    isNightMode,
    setIsNightMode,
    handleLoginSubmit,
    handleSimulateFail,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
