/**
 * file: src/app/composition.ts
 * description: YYC³ 应用层 — 组合根（端口-适配器装配，唯一依赖注入点）
 * author: YanYuCloudCube Team
 * version: v2.1.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [app],[composition],[di]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 组合根 — P4 运行时切换：createPorts(mode) 支持 memory / indexeddb /
 *        auto 三态装配（auto 默认：浏览器且有 indexedDB → IDB 持久化仓库，
 *        SSR/测试/旧浏览器 → memory 自动回退）；平台端口（storage/queue）随装配
 *        一并供给；P0-5 可观测端口（observability）随装配供给 —— 以同路径遥测
 *        适配器为落盘 sink（emitLog 直写 / emitMetric 攒批 flush）；
 *        Next 16 P2 单例化（getPorts：模块级缓存，跨组件共享装配实例）
 *
 * dependencies: ../adapters/observabilityBridge, ../domains/platform/observability/ports, ../domains/platform/queue/ports, ../domains/platform/storage/ports, ../domains/platform/telemetry/ports, ../domains/production/batch/ports, ../domains/production/seed/ports, ../types, ../adapters/indexeddb/*, ../adapters/memory/*
 * exports: PortsMode, BatchWritePort, AppPorts, createPorts, getPorts
 */
import { createIndexeddbBatchRepository } from "../adapters/indexeddb/batchRepository";
import { openDatabase } from "../adapters/indexeddb/db";
import { createIndexeddbStorage } from "../adapters/indexeddb/kv";
import { createIndexeddbSeedRepository } from "../adapters/indexeddb/seedRepository";
import { createIndexeddbTelemetry } from "../adapters/indexeddb/telemetryRepository";
import { createMemoryAgent } from "../adapters/memory/agent";
import { createMemoryBatchRepository } from "../adapters/memory/batchRepository";
import { createInMemoryQueue } from "../adapters/memory/queue";
import { createMemorySeedRepository } from "../adapters/memory/seedRepository";
import { createMemoryStorage } from "../adapters/memory/storage";
import { createMemoryTelemetry } from "../adapters/memory/telemetryRepository";
import { createTelemetryObservability } from "../adapters/observabilityBridge";
import { AgentPort } from "../domains/ai/ports";
import { ObservabilityPort } from "../domains/platform/observability/ports";
import { TaskQueuePort } from "../domains/platform/queue/ports";
import { StoragePort } from "../domains/platform/storage/ports";
import { TelemetryPort } from "../domains/platform/telemetry/ports";
import { BatchRepository } from "../domains/production/batch/ports";
import { SeedRepository } from "../domains/production/seed/ports";
import { AlarmItem, BatchItem, OpsMetric, ServiceStatus } from "../types";

/** 装配模式：显式 memory / 显式 indexeddb / auto（运行时探测，默认） */
export type PortsMode = "memory" | "indexeddb" | "auto";

/**
 * 批次写回扩展端口（P4-2 Hook 写回通道）：批次创建落盘。
 * IDB 仓库提供实现；memory/local 读模型不提供（Partial 可选消费，
 * Hook 侧 `save?.()` 调用，memory 路径天然跳过，行为零漂移）。
 */
export interface BatchWritePort {
  save(batch: BatchItem): Promise<void>;
}

/**
 * 遥测导入扩展端口（T2 数据主权导入通道）：告警/服务/指标三表批量追加。
 * memory 与 IDB 适配器均提供（按 id upsert，重复导入幂等）；local BFF 读模型
 * 不提供（Partial 可选消费，导入用例侧诚实注明跳过）。
 */
export interface TelemetryImportPort {
  appendAlarms(items: AlarmItem[]): Promise<void>;
  appendServices(items: ServiceStatus[]): Promise<void>;
  appendMetrics(items: OpsMetric[]): Promise<void>;
}

/** 应用装配的全部出站端口（领域三仓库 + 平台 storage/queue） */
export interface AppPorts {
  batches: BatchRepository & Partial<BatchWritePort>;
  seeds: SeedRepository;
  telemetry: TelemetryPort & Partial<TelemetryImportPort>;
  /** 本地键值持久化（IDB 落盘 / memory 兜底；P4-3 导出导入消费） */
  storage: StoragePort;
  /** 任务队列（内存实现；真实引擎通道见 adapters/local/queueSse + server/taskQueueApi） */
  queue: TaskQueuePort;
  /** 可观测端口（指标/日志发射；P0-5 接线，遥测端口为落盘通道） */
  observability: ObservabilityPort;
  /** AI Agent 端口 v2（八员目录 + 单步步进；九步编排在 orchestrator，内存桩断网默认） */
  ai: AgentPort;
}

/** 运行时探测 indexedDB 可用性（SSR/node/测试 jsdom 恒为 false → 自动回退 memory） */
function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

/**
 * 组合根（P4 运行时切换）：
 *
 * - indexeddb / auto（浏览器且 indexedDB 可用）：装配 IDB 三仓库（离线落盘
 *   持久化，首启自夹具播种）+ IDB 键值存储 + 内存队列
 * - memory / auto（SSR、vitest/jsdom、旧浏览器）：memory 快照直连 + 内存
 *   键值存储（避免无 IDB 环境必然失败，测试零改动即通过）
 * - 显式 indexeddb 但运行时不可用：安全回退 memory 并 warn 留痕（不白屏）
 * - openDatabase 同步返回句柄（内部惰性等待 IDB open），组合根保持同步装配
 */
export function createPorts(mode: PortsMode = "auto"): AppPorts {
  const wantIdb = mode === "indexeddb" || (mode === "auto" && hasIndexedDb());
  if (wantIdb && hasIndexedDb()) {
    const db = openDatabase();
    const telemetry = createIndexeddbTelemetry(db);
    return {
      batches: createIndexeddbBatchRepository(db),
      seeds: createIndexeddbSeedRepository(db),
      telemetry,
      storage: createIndexeddbStorage(db),
      queue: createInMemoryQueue(),
      observability: createTelemetryObservability({
        appendLog: telemetry.appendLog,
        appendMetrics: telemetry.appendMetrics,
      }),
      ai: createMemoryAgent(),
    };
  }
  if (mode === "indexeddb") {
    console.warn("[composition] 运行时无 indexedDB，显式 indexeddb 装配回退 memory");
  }
  const telemetry = createMemoryTelemetry();
  return {
    batches: createMemoryBatchRepository(),
    seeds: createMemorySeedRepository(),
    telemetry,
    storage: createMemoryStorage(),
    queue: createInMemoryQueue(),
    observability: createTelemetryObservability({
      appendLog: telemetry.appendLog,
      appendMetrics: telemetry.appendMetrics,
    }),
    ai: createMemoryAgent(),
  };
}

/** 模块级单例缓存（Next 16 P2：多组件消费端口共享同一装配，防重复初始化） */
let portsSingleton: AppPorts | null = null;

/**
 * 组合根单例入口（P2 起 UI/Provider 层统一经此取端口，默认 auto 装配）：
 *
 * - 同一 JS 上下文内装配唯一 —— IDB 播种/留痕状态机与内存队列全局一份；
 *   静态/测试 memory 快照同理
 * - createPorts 保留「每次新实例」语义，供测试隔离与显式模式注入使用
 */
export function getPorts(): AppPorts {
  if (portsSingleton === null) {
    portsSingleton = createPorts();
  }
  return portsSingleton;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
