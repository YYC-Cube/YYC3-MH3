/**
 * file: src/components/common/ErrorBoundary.tsx
 * description: YYC³ 基础通用组件 — React 渲染错误边界（可复用，回调式上报）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ui],[error-boundary],[observability]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0 可观测最小闭环 —— 渲染期错误不再静默：
 *        捕获子树的 React 渲染错误 → 经 onError 回调交由应用层上报（components
 *        层不得触达 adapters/app，故上报能力以回调注入，符合分层铁律）；
 *        默认兜底 UI 提供「重试」以重置边界状态。
 *
 * dependencies: react
 * exports: ErrorBoundary, ErrorBoundaryProps
 */
"use client";

import React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** 渲染错误上报回调（应用层注入：经遥测端口留痕） */
  onError?: (error: Error, info: React.ErrorInfo) => void;
  /** 自定义兜底渲染（缺省用内置兜底 UI） */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** 内置兜底 UI（暗色主题对齐） */
function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a1628] p-6">
      <div className="max-w-md space-y-3 rounded-xl border border-[#1e2f47] bg-[#15294a] p-5 text-center">
        <h2 className="text-sm font-semibold text-[#e8f0f8]">界面渲染异常</h2>
        <p className="text-xs text-[#8a97a8] break-all">{error.message || "未知渲染错误"}</p>
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

/**
 * 渲染错误边界（class 组件，React 唯一可捕获渲染错误的形态）。
 * 捕获 → componentDidCatch 上报 → 兜底渲染；reset 重置后可重试子树。
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      return this.props.fallback ? (
        this.props.fallback(error, this.reset)
      ) : (
        <DefaultFallback error={error} reset={this.reset} />
      );
    }
    return this.props.children;
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
