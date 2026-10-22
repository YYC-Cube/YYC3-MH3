/**
 * file: src/app/error-sink.tsx
 * description: YYC³ 应用层 — 客户端错误留痕 sink（唯一上报入口）+ 全局错误捕获
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[error],[sink],[observability]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P0 可观测最小闭环 —— 前端错误不再静默消失：
 *         - reportClientError：唯一 sink，经组合根遥测端口 appendLog 落留痕
 *           （任务 §P0-3），供路由 error.tsx / ErrorBoundary / 全局捕获共用；
 *           P0-2 补全链路 traceId（环境作用域优先，否则新发，单次操作可串联）
 *         - ErrorSink 组件：注册 window.onerror + unhandledrejection 捕获，
 *           经 sink 留痕；挂 app/layout.tsx，全树生效
 *
 * dependencies: react, ../kernel/trace, ../types, ./composition
 * exports: reportClientError, ErrorSink
 */
"use client";

import { useEffect } from "react";

import { currentTraceId, newTraceId } from "../kernel/trace";
import { LogEntry } from "../types";
import { getPorts } from "./composition";
import { recordClientError } from "./runtimeMetrics";

/**
 * 客户端错误留痕（唯一 sink）：构造 error 级 LogEntry 经遥测端口前置写入。
 * 端口失败静默兜底（错误上报本身不得引发二次错误）。
 */
export function reportClientError(message: string, suggestion?: string): void {
  recordClientError(); // P0-1：错误率分母分子真实采集
  const entry: LogEntry = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toLocaleTimeString(),
    level: "error",
    stage: "client-runtime",
    message: message || "未知客户端错误",
    traceId: currentTraceId() ?? newTraceId(),
    ...(suggestion ? { suggestion } : {}),
  };
  void getPorts()
    .telemetry.appendLog(entry)
    .catch(() => {
      /* 上报通道自身失败时静默，避免错误级联 */
    });
}

/** 全局错误捕获组件（无 UI，仅副作用）：window error + unhandledrejection → sink */
export function ErrorSink() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError(
        event.message || "未捕获的运行时错误",
        event.filename ? `来源: ${event.filename}:${event.lineno}` : undefined,
      );
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      reportClientError(reason instanceof Error ? reason.message : String(reason), "未处理的 Promise 拒绝");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
