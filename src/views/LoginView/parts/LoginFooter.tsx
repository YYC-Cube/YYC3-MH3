/**
 * file: src/views/LoginView/parts/LoginFooter.tsx
 * description: YYC³ 视图分区 — LoginView 页尾合规区（本地优先声明 + 加密存储说明 + 版权）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[footer],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的页尾 JSX（零重设计）。
 *
 * dependencies: react, lucide-react
 * exports: LoginFooter
 */
import { ShieldCheck } from "lucide-react";
import React from "react";

export const LoginFooter: React.FC = () => {
  return (
    <footer className="w-full max-w-6xl pb-3 pt-2 border-t border-[#1e2f47]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8b949e] z-10">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[#00e0b8] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>本地优先 · 数据主权 · 100% 离线可用</span>
        </span>
        <span className="text-[#1e2f47]">|</span>
        <span>Argon2id 凭证加密 · 沙箱隔离存储</span>
      </div>

      <div>
        <span>© 2026 YanYuCloudCube · MiniMax-H3 DiffSynth Production</span>
      </div>
    </footer>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
