/**
 * file: src/components/navigation/GlobalSearchModal/parts/SearchFooter.tsx
 * description: YYC³ 导航组件 — GlobalSearchModal 底部提示栏
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[search],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: GlobalSearchModal 底部模糊匹配提示与 Esc 退出说明栏，
 *        逐字搬移自原 GlobalSearchModal.tsx（Footer info）。
 *
 * dependencies: react
 * exports: SearchFooter
 */
import React from "react";

export const SearchFooter: React.FC = () => {
  return (
    <div className="px-4 py-2 border-t border-[#1e2f47] bg-[#0c1a30] flex items-center justify-between text-[11px] text-[#8b949e]">
      <div className="flex items-center gap-2">
        <span>支持全局模糊匹配</span>
        <span>·</span>
        <span>回车直达目标</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.2 rounded bg-[#15294a] border border-[#1e2f47]">Esc</kbd>
        <span>退出</span>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
