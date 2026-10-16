/**
 * file: src/kernel/trace.ts
 * description: YYC³ 叶层 — 全链路 traceId 工厂与环境 trace 作用域（零内部依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [kernel],[trace],[observability],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 可观测最小闭环 P0-2 — 全链路追踪原语：
 *   - newTraceId：crypto.randomUUID 优先，非安全上下文回退时间戳+随机
 *   - runWithTrace / runWithTraceAsync：设置环境 traceId，执行后恢复（try/finally）
 *   - currentTraceId：读取当前环境 traceId（未处于作用域时 undefined）
 *   环境 traceId 为模块级作用域；并发异步交错时以最后一次进入为准（Web 单线程
 *   UI 足够；如需严格隔离可后续经 AsyncLocalStorage 演进）。
 *
 * dependencies: —（零内部依赖，叶层）
 * exports: newTraceId, currentTraceId, runWithTrace, runWithTraceAsync
 */

/** 环境 traceId（模块级；undefined = 未处于任何 trace 作用域） */
let ambientTraceId: string | undefined;

/** 具备 randomUUID 能力的 crypto 结构（避免依赖具体 lib 的 Crypto 形状） */
interface UuidCapable {
  randomUUID?: () => string;
}

/** 经 globalThis 取 crypto 句柄（SSR/测试/浏览器统一，避免裸引用抛错） */
function cryptoHandle(): UuidCapable | undefined {
  const c: unknown = (globalThis as { crypto?: unknown }).crypto;
  if (typeof c !== "object" || c === null) return undefined;
  return c as UuidCapable;
}

/**
 * 生成全链路 traceId：crypto.randomUUID 优先（安全上下文）；
 * 不可用时回退「时间戳(base36)-随机(base36)」形态（结构稳定、无外部依赖）。
 */
export function newTraceId(): string {
  const c = cryptoHandle();
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 当前环境 traceId（未处于 trace 作用域时返回 undefined） */
export function currentTraceId(): string | undefined {
  return ambientTraceId;
}

/** 同步作用域：设置 traceId 执行 fn，执行后恢复前值（异常亦恢复） */
export function runWithTrace<T>(traceId: string, fn: () => T): T {
  const prev = ambientTraceId;
  ambientTraceId = traceId;
  try {
    return fn();
  } finally {
    ambientTraceId = prev;
  }
}

/** 异步作用域：设置 traceId 执行 fn，结算后恢复前值（成功/失败均恢复） */
export async function runWithTraceAsync<T>(traceId: string, fn: () => Promise<T>): Promise<T> {
  const prev = ambientTraceId;
  ambientTraceId = traceId;
  try {
    return await fn();
  } finally {
    ambientTraceId = prev;
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
