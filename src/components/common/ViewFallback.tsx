/**
 * file: src/components/common/ViewFallback.tsx
 * description: YYC³ 基础通用组件 — 视图分包加载占位（Suspense fallback）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[ui],[suspense]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 视图分包加载占位（与 DS 深空主题一致）
 *
 * dependencies: react
 * exports: ViewFallback
 */

/** 视图分包加载占位（与 DS 深空主题一致） */
export function ViewFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0a1628]">
      <div className="flex items-center gap-2.5 font-mono text-xs text-[#8b949e]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8] animate-pulse" />
        <span>视图模块载入中…</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
