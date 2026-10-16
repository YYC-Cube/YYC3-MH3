/**
 * file: src/app/error.tsx
 * description: App Router 路由段错误边界（渲染/数据加载错误兜底）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[error],[boundary],[observability]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0 可观测最小闭环 —— App Router 段级错误边界：
 *        捕获子树渲染/加载错误 → 经 reportClientError 留痕 → 兜底 UI + 重试。
 *
 * dependencies: react, ./error-sink
 * exports: default (Error)
 */
"use client";

import { useEffect } from "react";

import { reportClientError } from "./error-sink";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(
      error.message || "路由段渲染错误",
      error.digest ? `digest: ${error.digest}` : undefined,
    );
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a1628] p-6">
      <div className="max-w-md space-y-3 rounded-xl border border-[#1e2f47] bg-[#15294a] p-5 text-center">
        <h2 className="text-sm font-semibold text-[#e8f0f8]">页面加载异常</h2>
        <p className="text-xs text-[#8a97a8] break-all">{error.message || "未知错误"}</p>
        <p className="text-[11px] text-[#8a97a8]">该错误已记录至本地遥测留痕。</p>
        <button
          type="button"
          onClick={reset}
          className="mt-1 rounded-lg border border-[#00e0b8]/30 bg-[#00e0b8]/15 px-3 py-1.5 text-xs font-medium text-[#00e0b8] transition-colors hover:bg-[#00e0b8]/25"
        >
          重试
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
