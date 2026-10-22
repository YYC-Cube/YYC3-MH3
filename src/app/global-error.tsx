/**
 * file: src/app/global-error.tsx
 * description: App Router 全局错误边界（根布局级兜底，含 html/body）
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
 * brief: P0 可观测最小闭环 —— 根布局级兜底（layout 自身抛错时接管）：
 *        必须自带 <html>/<body>；错误经 reportClientError 留痕 → 重试。
 *
 * dependencies: react, ./error-sink
 * exports: default (GlobalError)
 */
"use client";

import { useEffect } from "react";

import { reportClientError } from "./error-sink";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error.message || "全局渲染错误", error.digest ? `digest: ${error.digest}` : undefined);
  }, [error]);

  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-[#0a1628] text-[#e8f0f8] font-sans antialiased">
        <div className="flex h-screen w-screen items-center justify-center bg-[#0a1628] p-6">
          <div className="max-w-md space-y-3 rounded-xl border border-[#1e2f47] bg-[#15294a] p-5 text-center">
            <h2 className="text-sm font-semibold text-[#e8f0f8]">应用发生严重异常</h2>
            <p className="text-xs text-[#8a97a8] break-all">{error.message || "未知错误"}</p>
            <p className="text-[11px] text-[#8a97a8]">该错误已记录至本地遥测留痕。</p>
            <button
              type="button"
              onClick={reset}
              className="mt-1 rounded-lg border border-[#00e0b8]/30 bg-[#00e0b8]/15 px-3 py-1.5 text-xs font-medium text-[#00e0b8] transition-colors hover:bg-[#00e0b8]/25"
            >
              重新加载
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
