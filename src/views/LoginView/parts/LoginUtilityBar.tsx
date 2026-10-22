/**
 * file: src/views/LoginView/parts/LoginUtilityBar.tsx
 * description: YYC³ 视图分区 — LoginView 顶部工具条（夜间模式切换 + 体验模式直进）
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
 * brief: 从 LoginView 逐字提取的顶部工具条 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: LoginUtilityBarProps, LoginUtilityBar
 */
import { ArrowRight, Moon, ShieldCheck } from "lucide-react";
import React from "react";

export interface LoginUtilityBarProps {
  isNightMode: boolean;
  setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
  onPreviewBypass?: () => void;
}

export const LoginUtilityBar: React.FC<LoginUtilityBarProps> = ({ isNightMode, setIsNightMode, onPreviewBypass }) => {
  return (
    <div className="w-full max-w-6xl flex items-center justify-between text-xs text-[#8a97a8] z-20 pt-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#00e0b8]" />
        <span className="font-mono text-[#e8f0f8] font-semibold text-[11px]">
          MiniMax-H3 Security Gate · 离线与团队双模准入
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsNightMode((p) => !p)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#15294a] hover:text-[#00e0b8] border border-[#1e2f47] transition-colors cursor-pointer"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>{isNightMode ? "低蓝光夜间" : "深色工业"}</span>
        </button>

        {onPreviewBypass && (
          <button
            onClick={onPreviewBypass}
            className="text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer"
            title="免密直接进入工作台体验"
          >
            <span>体验模式直接进入</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
