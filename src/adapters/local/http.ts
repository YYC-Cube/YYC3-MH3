/**
 * file: src/adapters/local/http.ts
 * description: local 适配器基座 — 回环 API 解析 + 超时 fetch + 韧性网关（降级状态机）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[local],[http],[resilience]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: local 适配器公共基座 — URL env 注入、3s 超时、404 业务空值、状态翻转留痕
 *
 * dependencies: ../../kernel/config, ../../types
 * exports: RegistryError, LocalAdapterOptions, resolveBaseUrl, createResilientGateway
 */
import { APP_PORT } from "../../kernel/config";
import type { LogEntry } from "../../types";

/** Registry 调用失败分类（06 契约 §2/§4） */
export type RegistryFailureKind = "network" | "http" | "timeout" | "not_found";

export class RegistryError extends Error {
  readonly kind: RegistryFailureKind;
  readonly status?: number;

  constructor(kind: RegistryFailureKind, status?: number) {
    super(
      kind === "http"
        ? `Registry API HTTP ${status ?? "?"}`
        : kind === "timeout"
          ? "Registry API 超时"
          : kind === "not_found"
            ? "Registry API 404"
            : "Registry API 网络错误",
    );
    this.name = "RegistryError";
    this.kind = kind;
    this.status = status;
  }
}

/** local 适配器公共选项（fetchImpl/timeoutMs 供测试注入） */
export interface LocalAdapterOptions {
  /** 缺省时依序解析 NEXT_PUBLIC_REGISTRY_BASE_URL → http://127.0.0.1:${APP_PORT}/api */
  baseUrl?: string;
  /** 超时阈值（06 §4 默认 >3s 触发降级） */
  timeoutMs?: number;
  /** fetch 实现（测试注入；缺省全局 fetch） */
  fetchImpl?: (url: string, init?: RequestInit) => Promise<Response>;
}

/** URL 解析（06 §5：零硬编码端点，env 注入优先，APP_PORT 兜底） */
export function resolveBaseUrl(explicit?: string): string {
  if (explicit) return explicit;
  const injected = process.env.NEXT_PUBLIC_REGISTRY_BASE_URL;
  if (typeof injected === "string" && injected.length > 0) return injected;
  return `http://127.0.0.1:${APP_PORT}/api`;
}

const DEFAULT_TIMEOUT_MS = 3000;

/** 超时标记（race 内部用，不出网关） */
class TimeoutMarker extends Error {}

/**
 * 单次 JSON fetch：404 → not_found（业务空值，06 §2 v1.0.1）；
 * 其余非 2xx → http；超时（race + signal 双保险，不依赖 fetch 实现遵守
 * AbortSignal）→ timeout；其余 → network。
 */
async function fetchJson<T>(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number,
  fetchImpl: (url: string, init?: RequestInit) => Promise<Response>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let raceReject: ((err: unknown) => void) | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    raceReject = reject;
  });
  const raceTimer = setTimeout(() => raceReject?.(new TimeoutMarker()), timeoutMs);
  try {
    const res = await Promise.race([fetchImpl(url, { ...init, signal: controller.signal }), timeoutPromise]);
    if (res.status === 404) throw new RegistryError("not_found", 404);
    if (!res.ok) throw new RegistryError("http", res.status);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof RegistryError) throw err;
    if (err instanceof TimeoutMarker || controller.signal.aborted) {
      throw new RegistryError("timeout");
    }
    throw new RegistryError("network");
  } finally {
    clearTimeout(timer);
    clearTimeout(raceTimer);
  }
}

/** 状态翻转回调（healthy ↔ degraded 各触发一次） */
export interface GatewayTransition {
  degraded: boolean;
  detail: string;
  kind: RegistryFailureKind;
  status?: number;
}

/** 失败分类的可读描述（留痕 message 用） */
function failureDetail(kind: RegistryFailureKind, status?: number): string {
  if (kind === "timeout") return "超时";
  if (kind === "http") return `HTTP ${status ?? "?"}`;
  if (kind === "not_found") return "404";
  return "网络错误";
}

/**
 * 韧性网关（06 §4）：per-call 尝试 fetch；失败（非 not_found）时若此前
 * 健康则触发一次降级留痕并进入 degraded 态；degraded 态下某次成功则触发
 * 一次恢复留痕并回到 healthy 态。not_found 原样抛出（业务空值，不改变状态）。
 */
export function createResilientGateway(
  options: LocalAdapterOptions,
  onTransition: (transition: GatewayTransition) => void,
): <T>(path: string, init?: RequestInit) => Promise<T> {
  const base = resolveBaseUrl(options.baseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
  let degraded = false;

  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    try {
      const data = await fetchJson<T>(`${base}${path}`, init, timeoutMs, fetchImpl);
      if (degraded) {
        degraded = false;
        onTransition({ degraded: false, detail: "恢复", kind: "network" });
      }
      return data;
    } catch (err) {
      if (err instanceof RegistryError && err.kind === "not_found") throw err;
      if (!degraded) {
        degraded = true;
        const failure = err instanceof RegistryError ? err : new RegistryError("network");
        onTransition({
          degraded: true,
          detail: failureDetail(failure.kind, failure.status),
          kind: failure.kind,
          status: failure.status,
        });
      }
      throw err;
    }
  };
}

/** 留痕条目构造（Runbook §3.3：stage + suggestion；id 前缀 TRACE- 供测试/展示区分） */
export function makeTraceEntry(stage: string, degraded: boolean, detail: string): LogEntry {
  return {
    id: `TRACE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toTimeString().slice(0, 8),
    level: degraded ? "warn" : "info",
    stage,
    message: degraded
      ? `Registry API 不可达（${detail}），已降级 memory 快照供数`
      : `Registry API 恢复（${detail}），已切回本地供数`,
    suggestion: degraded ? "确认本地 dev server 运行状态后将自动恢复" : undefined,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
