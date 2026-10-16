/**
 * file: src/app/perf-sink.tsx
 * description: YYC³ 应用层 — 运行时性能采集 sink（长任务 / 内存 / 导航耗时 → 全链路留痕）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[perf],[observability],[sink],[p0]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 可观测最小闭环 P0-1 — 运行时性能采集（此前全库 0 采集）：
 *   - 长任务：PerformanceObserver 监听 longtask，超预算（> 50ms）产 overBudget 观测
 *   - 堆内存：定时采样 performance.memory（非 Chromium 安全降级 null）
 *   - 导航耗时：启动读一次 navigation 条目 duration（p95 代理）
 *   观测经组合根可观测端口 emitLog 落留痕（stage=perf:<kind>，Loki 可解析）；
 *   采集通道自身失败静默，不引发二次错误。不支持环境（jsdom/SSR/旧浏览器）no-op。
 *
 * dependencies: react, ../kernel/trace, ../types, ./composition
 * exports: LONG_TASK_BUDGET_MS, PerfKind, PerfObservation, toLogEntry, startPerfObserver, PerfSink
 */
"use client";

import { useEffect } from "react";

import { currentTraceId, newTraceId } from "../kernel/trace";
import { LogEntry } from "../types";
import { getPorts } from "./composition";
import { startRuntimeMetricsExport } from "./metrics-exporter";
import {
  exposeRuntimeMetricsDebug,
  recordClientLatency,
  recordClientLongTask,
  recordClientPageView,
} from "./runtimeMetrics";

/** 长任务预算（ms）—— 评分卡目标：长任务 < 50ms */
export const LONG_TASK_BUDGET_MS = 50;
/** 内存采样间隔（ms）—— 8h 长会话平稳性观测粒度 */
const MEMORY_SAMPLE_INTERVAL_MS = 60_000;
/** 导航耗时的 p95 门禁代理阈值（ms）—— 评分卡目标：p95 < 2s */
const NAVIGATION_BUDGET_MS = 2000;

/** 性能观测类型 */
export type PerfKind = "longtask" | "memory" | "navigation";

/** 单条性能观测（结构化，含全链路 traceId） */
export interface PerfObservation {
  kind: PerfKind;
  /** 度量值（unit 声明单位） */
  value: number;
  unit: "ms" | "MB";
  /** 是否越预算（长任务 > 50ms / 导航 ≥ 2s） */
  overBudget: boolean;
  /** ISO 时间戳 */
  at: string;
  traceId: string;
}

/** 非标准 performance.memory 结构（Chromium 私有，结构化窄化避免 any） */
interface PerfMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/** 读浏览器堆内存（MB，一位小数）；无 performance.memory 返回 null */
function readHeapMb(): number | null {
  const perf = performance as Performance & { memory?: PerfMemory };
  const mem = perf.memory;
  if (!mem || typeof mem.usedJSHeapSize !== "number") return null;
  return Math.round((mem.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
}

/** 读导航加载耗时（ms，p95 代理）；无导航条目或非正数返回 null */
function readNavigationMs(): number | null {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
    return null;
  }
  const nav = performance.getEntriesByType("navigation")[0];
  if (!nav || typeof nav.duration !== "number" || nav.duration <= 0) return null;
  return Math.round(nav.duration);
}

/** 观测 → 结构化日志（stage=perf:<kind>，traceId 全链路；越预算升 warn 级） */
export function toLogEntry(obs: PerfObservation): LogEntry {
  const label = obs.kind === "longtask" ? "长任务" : obs.kind === "memory" ? "堆内存" : "页面加载";
  const budget = obs.kind === "longtask" ? `（预算 ${LONG_TASK_BUDGET_MS}ms）` : "";
  return {
    id: `perf-${obs.traceId}-${obs.kind}-${obs.at}`,
    timestamp: new Date(obs.at).toLocaleTimeString(),
    level: obs.overBudget ? "warn" : "info",
    stage: `perf:${obs.kind}`,
    message: `${label} ${obs.value}${obs.unit}${budget}`,
    traceId: obs.traceId,
  };
}

/**
 * 启动性能采集（浏览器可用时；返回停止函数）：
 * - 导航耗时：启动读一次（p95 代理）
 * - 长任务：PerformanceObserver 监听，超预算产出观测（环境不支持时跳过）
 * - 堆内存：定时采样
 * 全环境安全降级：jsdom / SSR / 无 PerformanceObserver 均不抛错，返回 no-op 停止。
 */
export function startPerfObserver(onObserve: (obs: PerfObservation) => void): () => void {
  if (typeof performance === "undefined") return () => { };

  const traceId = currentTraceId() ?? newTraceId();
  const stamp = (kind: PerfKind, value: number, unit: "ms" | "MB", overBudget: boolean): void => {
    onObserve({ kind, value, unit, overBudget, at: new Date().toISOString(), traceId });
  };

  const disposers: Array<() => void> = [];

  const navMs = readNavigationMs();
  if (navMs !== null) stamp("navigation", navMs, "ms", navMs >= NAVIGATION_BUDGET_MS);

  if (typeof PerformanceObserver !== "undefined") {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of Array.from(list.getEntries())) {
          stamp("longtask", Math.round(entry.duration), "ms", entry.duration > LONG_TASK_BUDGET_MS);
        }
      });
      observer.observe({ type: "longtask", buffered: true });
      disposers.push(() => observer.disconnect());
    } catch {
      /* longtask 不被该环境支持：跳过，不阻断其余采集 */
    }
  }

  const timer = setInterval(() => {
    const mb = readHeapMb();
    if (mb !== null) stamp("memory", mb, "MB", false);
  }, MEMORY_SAMPLE_INTERVAL_MS);
  disposers.push(() => clearInterval(timer));

  return () => {
    for (const dispose of disposers) dispose();
  };
}

/** 全局性能采集组件（无 UI，仅副作用）：观测经可观测端口 emitLog 落留痕 */
export function PerfSink() {
  useEffect(() => {
    // P0-1：页面视图计数（错误率分母）+ 调试探针（e2e 数值断言出口）
    recordClientPageView();
    exposeRuntimeMetricsDebug();
    // 第七批 ②：运行时指标定时导出（默认关，NEXT_PUBLIC_LOKI_ENDPOINT 显式启用）
    const stopExport = startRuntimeMetricsExport();
    const stop = startPerfObserver((obs) => {
      // 真实数值入窗口：长任务/导航耗时进 p95 分位样本
      if (obs.kind === "longtask") recordClientLongTask(obs.value);
      else if (obs.kind === "navigation") recordClientLatency(obs.value);
      void getPorts()
        .observability.emitLog(toLogEntry(obs))
        .catch(() => {
          /* 采集通道自身失败时静默，避免错误级联 */
        });
    });
    return () => {
      stop();
      stopExport();
    };
  }, []);
  return null;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
