/**
 * file: src/adapters/lokiSink.ts
 * description: YYC³ 适配器层 — Loki 结构化日志推送出口（显式启用，默认关闭保零公网）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[loki],[logs],[export],[local-first],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-2 可观测出口（日志通道）——把结构化 LogEntry（含 traceId）经
 *        Loki push API 推送至本地 Loki 实例：
 *   - 默认 enabled=false（零公网守卫不破坏：无显式端点配置绝不发网络请求）
 *   - endpoint 仅接受本地回环（主机名 127.0.0.1 / localhost / ::1 含方括号写法），
 *     非回环端点构造期即拒绝（与 06 §1.1 本地回环 only 同口径）
 *   - fetch 可注入（测试替身）；网络失败向上返回错误结果，不静默吞（调用方决定降级）
 *
 * dependencies: ../domains/platform/observability/export, ../types
 * exports: LokiSinkOptions, LokiPushResult, createLokiSink
 */
import type { LokiLabels, LokiPushPayload } from "../domains/platform/observability/export";
import { toLokiPushPayload } from "../domains/platform/observability/export";
import type { LogEntry } from "../types";

/** Loki sink 配置（enabled 默认 false：显式配置本地端点后才产生网络行为） */
export interface LokiSinkOptions {
  /** 是否启用推送（默认 false） */
  enabled?: boolean;
  /** Loki push 端点（必须为本地回环，如 http://127.0.0.1:3100/loki/api/v1/push） */
  endpoint: string;
  /** 流标签（app 标识 + source 通道） */
  labels: LokiLabels;
  /** fetch 注入点（测试替身；缺省用全局 fetch） */
  fetchImpl?: typeof fetch;
}

/** 推送结果（pushed=成功条数；失败时 ok=false + reason） */
export interface LokiPushResult {
  ok: boolean;
  pushed: number;
  reason?: string;
}

/** 回环端点校验（http(s) 协议 + 回环主机名；06 §1.1 同口径） */
function isLoopbackEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname;
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

/** Loki 结构化日志推送 sink */
export interface LokiSink {
  /** 批量推送日志（空批次 no-op 直接成功） */
  push(entries: readonly LogEntry[]): Promise<LokiPushResult>;
  /** 直接推送既有载荷（指标即日志等非 LogEntry 来源复用同一传输/守卫） */
  pushPayload(payload: LokiPushPayload): Promise<LokiPushResult>;
  /** 端点/启用状态探针（组合根装配诊断用） */
  describe(): { enabled: boolean; endpoint: string };
}

/**
 * 创建 Loki push sink。
 * @throws 非回环端点在**构造期**即抛错（配置错误尽早暴露，不带病运行）
 */
export function createLokiSink(options: LokiSinkOptions): LokiSink {
  if (!isLoopbackEndpoint(options.endpoint)) {
    throw new Error(`Loki endpoint 必须为本地回环 HTTP(S) 地址（零公网守卫）：${options.endpoint}`);
  }
  const enabled = options.enabled ?? false;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function sendPayload(payload: LokiPushPayload): Promise<LokiPushResult> {
    const total = payload.streams.reduce(
      (sum: number, stream: LokiPushPayload["streams"][number]) => sum + stream.values.length,
      0,
    );
    if (total === 0) return { ok: true, pushed: 0 };
    if (!enabled) return { ok: true, pushed: 0, reason: "disabled" };
    try {
      const response = await fetchImpl(options.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return { ok: false, pushed: 0, reason: `loki http ${response.status}` };
      }
      return { ok: true, pushed: total };
    } catch (error) {
      return { ok: false, pushed: 0, reason: error instanceof Error ? error.message : "loki push failed" };
    }
  }

  return {
    async push(entries) {
      if (!enabled || entries.length === 0) {
        return { ok: true, pushed: 0, reason: enabled ? undefined : "disabled" };
      }
      return sendPayload(toLokiPushPayload(entries, options.labels));
    },
    async pushPayload(payload) {
      return sendPayload(payload);
    },
    describe() {
      return { enabled, endpoint: options.endpoint };
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
