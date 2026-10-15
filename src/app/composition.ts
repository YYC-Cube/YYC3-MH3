/**
 * file: src/app/composition.ts
 * description: YYC³ 应用层 — 组合根（端口-适配器装配，唯一依赖注入点）
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [app],[composition],[di]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 组合根 — dev 装配 local（Registry API 供数，内置降级），静态/测试装配 memory 快照
 *        + Next 16 P2 单例化（getPorts：模块级缓存，跨组件共享装配实例）
 *
 * dependencies: ../domains/batch/ports, ../domains/seed/ports, ../domains/ops/ports, ../adapters/memory/*, ../adapters/local/*
 * exports: AppPorts, createPorts, getPorts
 */
import { createLocalBatchRepository } from "../adapters/local/batchRepository";
import { createLocalSeedRepository } from "../adapters/local/seedRepository";
import { createLocalTelemetry } from "../adapters/local/telemetryRepository";
import { createMemoryBatchRepository } from "../adapters/memory/batchRepository";
import { createMemorySeedRepository } from "../adapters/memory/seedRepository";
import { createMemoryTelemetry } from "../adapters/memory/telemetryRepository";
import { BatchRepository } from "../domains/batch/ports";
import { TelemetryPort } from "../domains/ops/ports";
import { SeedRepository } from "../domains/seed/ports";

/** 应用装配的全部出站端口 */
export interface AppPorts {
  batches: BatchRepository;
  seeds: SeedRepository;
  telemetry: TelemetryPort;
}

/**
 * 组合根（06 契约 §4 v1.0.1 装配细化）：
 *
 * - dev server（且非 vitest）：装配 local 适配器 — Registry API 供数
 *   （回环 only），失败自动回退 memory 快照（per-call 降级，无白屏）；
 *   降级/恢复事件经共享 telemetry.appendLog 留痕（Runbook §3.3），
 *   日志面板实时可见
 *   ※ BFF Route Handler 于 P4 落地前，dev 请求 404 → 优雅降级 memory（05 清单 P1 过渡态）
 * - 静态构建 / preview / 测试环境：memory 快照直连（避免必然失败的请求
 *   噪音；零公网出站红线不破坏）
 *
 * URL 经 env 注入（NEXT_PUBLIC_REGISTRY_BASE_URL → APP_PORT 兜底），零硬编码端点。
 */
export function createPorts(): AppPorts {
  if (process.env.NODE_ENV === "development" && !process.env.VITEST) {
    const telemetry = createLocalTelemetry();
    return {
      batches: createLocalBatchRepository({ telemetry }),
      seeds: createLocalSeedRepository({ telemetry }),
      telemetry,
    };
  }
  return {
    batches: createMemoryBatchRepository(),
    seeds: createMemorySeedRepository(),
    telemetry: createMemoryTelemetry(),
  };
}

/** 模块级单例缓存（Next 16 P2：多组件消费端口共享同一装配，防重复初始化） */
let portsSingleton: AppPorts | null = null;

/**
 * 组合根单例入口（P2 起 UI/Provider 层统一经此取端口）：
 *
 * - 同一 JS 上下文内装配唯一 —— dev local 适配器的降级状态机与 telemetry 留痕
 *   全局一份；静态/测试 memory 快照同理
 * - createPorts 保留原始「每次新实例」语义，供测试隔离使用
 */
export function getPorts(): AppPorts {
  if (portsSingleton === null) {
    portsSingleton = createPorts();
  }
  return portsSingleton;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
