/**
 * file: src/adapters/memory/telemetryRepository.ts
 * description: YYC³ 适配器层 — 遥测 memory 实现（演示快照，断网默认）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [adapter],[memory],[telemetry]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测 memory 适配器 — 消费 05 Runbook 事件表快照，深拷贝出借 + 留痕写入
 *
 * dependencies: ../../types, ../../domains/ops/ports, ../../data/ops
 * exports: createMemoryTelemetry
 */
import { INITIAL_LOGS, OPS_METRICS, SERVICES_LIST, SYSTEM_ALARMS } from "../../data/ops";
import { TelemetryPort } from "../../domains/ops/ports";
import { AlarmItem, LogEntry } from "../../types";

/** 深拷贝 — 四事件表均为 JSON 纯结构（无函数/循环引用），安全 */
function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * 内存快照版遥测适配器（断网默认数据通道）。
 *
 * 服务/指标两表为无副作用只读快照；告警表持可变处置状态
 * （resolveAlarm 翻转 resolved，进程内持久）；日志表持可变留痕状态
 * （appendLog 前置写入，最新在前），全部出借均为深拷贝，
 * 外部篡改不污染适配器状态。
 */
export function createMemoryTelemetry(): TelemetryPort {
  let logs: LogEntry[] = deepCopy(INITIAL_LOGS);
  let alarms: AlarmItem[] = deepCopy(SYSTEM_ALARMS);

  return {
    async listServices() {
      return deepCopy(SERVICES_LIST);
    },
    async listMetrics() {
      return deepCopy(OPS_METRICS);
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
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
