/**
 * file: src/views/LoginView/index.tsx
 * description: YYC³ 功能视图 — LoginView 入口容器（状态装配 + 布局编排，分区下沉 parts）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[login],[container],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: LoginView 容器 —— 装配 useLoginView 状态并编排品牌标头 / 准入卡片 / 校验指示 / 页尾 / 弹窗群。
 *
 * dependencies: react, ../../types, ./useLoginView, ./parts/*
 * exports: LoginViewProps, LoginView
 */
import React from "react";
import { AuthUser } from "../../types";
import { LoginAuthCard } from "./parts/LoginAuthCard";
import { LoginBrandHeader } from "./parts/LoginBrandHeader";
import { LoginFooter } from "./parts/LoginFooter";
import { LoginSecurityModals } from "./parts/LoginSecurityModals";
import { LoginUtilityBar } from "./parts/LoginUtilityBar";
import { LoginVerificationStatus } from "./parts/LoginVerificationStatus";
import { useLoginView } from "./useLoginView";
import type { ShowToastFn } from "./useLoginView";

export interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onPreviewBypass?: () => void;
  onShowToast: ShowToastFn;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onPreviewBypass,
  onShowToast,
}) => {
  const state = useLoginView({ onLoginSuccess, onShowToast });

  return (
    <div
      className={`min-h-screen w-screen flex flex-col justify-between items-center p-4 sm:p-6 transition-colors duration-500 relative select-none overflow-y-auto ${
        state.isNightMode ? "bg-[#040c17]" : "bg-[#0a1628]"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 38%, rgba(0, 224, 184, 0.05) 0%, transparent 60%), linear-gradient(180deg, #0a1628 0%, #071222 100%)",
      }}
    >
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00e0b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Utility Bar: Quick Night Mode & Bypass for Pro Preview */}
      <LoginUtilityBar
        isNightMode={state.isNightMode}
        setIsNightMode={state.setIsNightMode}
        onPreviewBypass={onPreviewBypass}
      />

      {/* Main Container: Brand Header + Login Card */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 z-10 w-full max-w-md">
        {/* Brand Header Area */}
        <LoginBrandHeader />

        {/* Login Card Container (420px width, 12px radius, micro-glow) */}
        <LoginAuthCard state={state} onShowToast={onShowToast} />

        {/* Real-time 6-Node Verification Status Indicator during login */}
        {state.isVerifying && (
          <LoginVerificationStatus
            verificationStep={state.verificationStep}
            verificationLog={state.verificationLog}
          />
        )}
      </div>

      {/* Footer Credentials Area */}
      <LoginFooter />

      <LoginSecurityModals
        isOfflineExplainOpen={state.isOfflineExplainOpen}
        setIsOfflineExplainOpen={state.setIsOfflineExplainOpen}
        isQrLoginOpen={state.isQrLoginOpen}
        setIsQrLoginOpen={state.setIsQrLoginOpen}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
