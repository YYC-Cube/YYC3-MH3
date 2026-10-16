/**
 * file: src/adapters/memory/telemetryRepository.ts
 * description: YYC³ 适配器层 — 遥测 memory 实现（演示快照 + 导入批量追加，断网默认）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[memory],[telemetry]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测 memory 适配器 — 消费 05 Runbook 事件表快照，拷贝出借 + 留痕写入；
 *        实现 TelemetryImportPort 导入扩展（T2）：appendAlarms/appendServices/
 *        appendMetrics 批量追加，按 id upsert（同 id 原位替换，重复导入幂等，
 *        与 IDB 信封 upsert 语义对齐），新记录前置（最新在前）。
 *
 * dependencies: ../../types, ../../domains/platform/telemetry/ports, ./fixtures/ops
 * exports: createMemoryTelemetry
 */
import { TelemetryPort } from "../../domains/platform/telemetry/ports";
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../../types";
import { INITIAL_LOGS, OPS_METRICS, SERVICES_LIST, SYSTEM_ALARMS } from "./fixtures/ops";

/** 深拷贝 — 四事件表均为 JSON 纯结构（无函数/循环引用），安全 */
function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * 导入扩展结构（与 app/composition 的 TelemetryImportPort 结构同构；
 * 适配器不反向依赖 app 层，经结构化类型兼容装配）。
 */
interface TelemetryImportShape {
  appendAlarms(items: AlarmItem[]): Promise<void>;
  appendServices(items: ServiceStatus[]): Promise<void>;
  appendMetrics(items: OpsMetric[]): Promise<void>;
}

/** 按 id upsert 前置插入：同 id 原位替换（幂等），否则前置（最新在前） */
function upsertFront<T>(list: T[], item: T, idOf: (item: T) => string): T[] {
  const index = list.findIndex((x) => idOf(x) === idOf(item));
  if (index >= 0) {
    const next = [...list];
    next[index] = item;
    return next;
  }
  return [item, ...list];
}

/**
 * 内存快照版遥测适配器（断网默认数据通道）。
 * 夹具顶层冻结：可变三表（日志/告警 + T2 服务/指标导入态）初始化时逐项浅拷贝
 * 出可变副本（数组新建，冻结层不被触达）；服务/指标读路径保持快照语义，
 * 出借时逐项拷贝。告警表持可变处置状态（resolveAlarm 翻转 resolved）；
 * 日志表持可变留痕状态（appendLog 前置写入）；导入扩展三表按 id upsert
 * （重复导入幂等，行数不增）。全部出借均为深拷贝，外部篡改不污染适配器状态。
 */
export function createMemoryTelemetry(): TelemetryPort & TelemetryImportShape {
  let logs: LogEntry[] = INITIAL_LOGS.map((l) => ({ ...l }));
  let alarms: AlarmItem[] = SYSTEM_ALARMS.map((a) => ({ ...a }));
  let services: ServiceStatus[] = SERVICES_LIST.map((s) => ({ ...s }));
  let metrics: OpsMetric[] = OPS_METRICS.map((m) => ({ ...m }));

  return {
    async listServices() {
      return deepCopy(services);
    },
    async listMetrics() {
      return deepCopy(metrics);
    },
    async listAlarms() {
      return deepCopy(alarms);
    },
    async listLogs() {
      return deepCopy(logs);
    },
    async appendLog(entry) {
      const record = deepCopy(entry);
      logs = [record, ...logs];
      return deepCopy(record);
    },
    async resolveAlarm(id) {
      const target = alarms.find((a) => a.id === id);
      if (!target) return null;
      target.resolved = true;
      return deepCopy(target);
    },
    async appendAlarms(items) {
      for (const item of deepCopy(items)) {
        alarms = upsertFront(alarms, item, (a) => a.id);
      }
    },
    async appendServices(items) {
      for (const item of deepCopy(items)) {
        services = upsertFront(services, item, (s) => s.serviceId);
      }
    },
    async appendMetrics(items) {
      for (const item of deepCopy(items)) {
        metrics = upsertFront(metrics, item, (m) => `metric-${m.time}`);
      }
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
