/**
 * file: src/views/LoginView/parts/LoginAuthCard.tsx
 * description: YYC³ 视图分区 — LoginView 准入卡片壳（错误告警条 + 模式页签 + 表单 + 辅助帮助链接）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[card],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的准入卡片外壳 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ./LoginModeTabs, ./LoginForm, ../useLoginView
 * exports: LoginAuthCardProps, LoginAuthCard
 */
import { AlertTriangle, HelpCircle } from "lucide-react";
import React from "react";
import { LoginForm } from "./LoginForm";
import { LoginModeTabs } from "./LoginModeTabs";
import type { LoginViewState, ShowToastFn } from "../useLoginView";

export interface LoginAuthCardProps {
  state: LoginViewState;
  onShowToast: ShowToastFn;
}

export const LoginAuthCard: React.FC<LoginAuthCardProps> = ({ state, onShowToast }) => {
  const { authMode, setAuthMode, errorMessage, setErrorMessage, setIsOfflineExplainOpen, handleSimulateFail } = state;

  return (
    <div
      className="w-full rounded-2xl bg-[#0f1e35] border border-[#1e2f47] p-8 shadow-2xl relative transition-all duration-200"
      style={{
        boxShadow: "0 0 24px rgba(0, 224, 184, 0.08), 0 20px 48px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Top Error Alert Bar if present */}
      {errorMessage && (
        <div className="mb-4 p-2.5 rounded-lg bg-[#ff7a45]/15 border border-[#ff7a45]/50 flex items-center justify-between gap-2 text-xs text-[#ff7a45] animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-[#ff7a45] hover:opacity-80 p-0.5">
            ✕
          </button>
        </div>
      )}

      {/* Mode Switcher Tabs (Local Offline vs. Team Cloud) */}
      <LoginModeTabs authMode={authMode} setAuthMode={setAuthMode} setErrorMessage={setErrorMessage} />

      {/* Form */}
      <LoginForm state={state} onShowToast={onShowToast} />

      {/* Auxiliary Help Links */}
      <div className="mt-6 pt-4 border-t border-[#1e2f47] flex items-center justify-between text-xs text-[#8a97a8]">
        <button
          type="button"
          onClick={() => setIsOfflineExplainOpen(true)}
          className="hover:text-[#00e0b8] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>本地离线安全机制说明</span>
        </button>

        <button
          type="button"
          onClick={handleSimulateFail}
          className="text-[#8b949e] hover:text-[#ff7a45] transition-colors cursor-pointer text-[10px]"
          title="用于测试安全防爆破锁定分支"
        >
          [测试密码错误锁定]
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
