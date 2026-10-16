/**
 * file: src/views/LoginView/parts/LoginModeTabs.tsx
 * description: YYC³ 视图分区 — LoginView 准入模式切换页签（本地离线 / 团队云端）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的模式切换页签 JSX（零重设计）。
 *
 * dependencies: react
 * exports: LoginModeTabsProps, LoginModeTabs
 */
import React from "react";

export interface LoginModeTabsProps {
  authMode: "local" | "team";
  setAuthMode: React.Dispatch<React.SetStateAction<"local" | "team">>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export const LoginModeTabs: React.FC<LoginModeTabsProps> = ({
  authMode,
  setAuthMode,
  setErrorMessage,
}) => {
  return (
    <div className="flex border-b border-[#1e2f47] pb-3 mb-6 select-none">
      <button
        onClick={() => {
          setAuthMode("local");
          setErrorMessage(null);
        }}
        className={`flex-1 text-center pb-2 text-xs font-semibold transition-all relative cursor-pointer ${
          authMode === "local" ? "text-[#00e0b8]" : "text-[#8a97a8] hover:text-[#e8f0f8]"
        }`}
      >
        <span>本地离线账号</span>
        {authMode === "local" && (
          <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00e0b8] shadow-[0_0_8px_rgba(0,224,184,0.6)]" />
        )}
      </button>

      <button
        onClick={() => {
          setAuthMode("team");
          setErrorMessage(null);
        }}
        className={`flex-1 text-center pb-2 text-xs font-semibold transition-all relative cursor-pointer ${
          authMode === "team" ? "text-[#00e0b8]" : "text-[#8a97a8] hover:text-[#e8f0f8]"
        }`}
      >
        <span>团队云端账号</span>
        {authMode === "team" && (
          <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00e0b8] shadow-[0_0_8px_rgba(0,224,184,0.6)]" />
        )}
      </button>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
