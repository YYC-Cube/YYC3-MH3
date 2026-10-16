/**
 * file: src/views/LoginView/parts/LoginVerificationStatus.tsx
 * description: YYC³ 视图分区 — LoginView 六步闭环校验实时状态指示器
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[verification],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的六步闭环校验状态指示 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: LoginVerificationStatusProps, LoginVerificationStatus
 */
import { Sparkles } from "lucide-react";
import React from "react";

export interface LoginVerificationStatusProps {
  verificationStep: number;
  verificationLog: string;
}

export const LoginVerificationStatus: React.FC<LoginVerificationStatusProps> = ({
  verificationStep,
  verificationLog,
}) => {
  return (
    <div className="mt-4 w-full p-3.5 rounded-xl bg-[#0f1f38] border border-[#00e0b8]/40 space-y-2 animate-in fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#00e0b8] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>闭环审核节点 {verificationStep}/6</span>
        </span>
        <span className="text-[11px] text-[#8a97a8] font-mono">
          {Math.round((verificationStep / 6) * 100)}%
        </span>
      </div>
      <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#00e0b8] h-full transition-all duration-300 shadow-[0_0_8px_rgba(0,224,184,0.8)]"
          style={{ width: `${(verificationStep / 6) * 100}%` }}
        />
      </div>
      <div className="text-[11px] font-mono text-[#8a97a8] truncate">{verificationLog}</div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
