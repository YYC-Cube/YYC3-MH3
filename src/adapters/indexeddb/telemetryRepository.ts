/**
 * file: src/adapters/indexeddb/telemetryRepository.ts
 * description: YYC³ 适配器层 — 遥测 IndexedDB 实现（四事件表离线落盘 + 导入批量追加，P4-1/T2）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[indexeddb],[telemetry],[repository]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 遥测 IDB 适配器 — 实现 TelemetryPort 端口（services/metrics/alarms/logs
 *        四读 + appendLog/resolveAlarm 两写）与 TelemetryImportPort 导入扩展
 *        （appendAlarms/appendServices/appendMetrics 批量追加，按信封 id upsert
 *        幂等）；四 store 空库时自 memory 夹具播种，之后一切读写走 IDB。
 *        处置/留痕/导入真实持久（刷新/重启后不丢），语义对齐 memory 基线：
 *        appendLog 前置（最新在前），resolveAlarm 未命中 null，导入记录自基线
 *        递减续号（升序读取即新记录前置，与 memory append* 前置语义对齐）。
 *
 * dependencies: ../../types, ../../domains/platform/telemetry/ports, ../memory/fixtures/ops, ./db, ./records
 * exports: createIndexeddbTelemetry
 */
import { TelemetryPort } from "../../domains/platform/telemetry/ports";
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../../types";
import { INITIAL_LOGS, OPS_METRICS, SERVICES_LIST, SYSTEM_ALARMS } from "../memory/fixtures/ops";
import { DbBackend } from "./db";
import { envelope, isEnvelope, seedIfEmpty, SEQ_SEED_BASE, unwrapAll } from "./records";

/** JSON 深拷贝 — 回执副本与存储状态隔离 */
function cloneJson<T>(value: T): T {
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

/**
 * IndexedDB 版遥测适配器（四事件表读 + 处置留痕写）：
 *
 * - 懒播种：services/metrics/alarms/logs 四 store 各自空库判定，互不影响
 * - listServices/listMetrics：只读表，播种后即稳定
 * - listAlarms/resolveAlarm：处置态翻转后按原信封 id/seq 回写（展示序不动）
 * - listLogs/appendLog：留痕自基线递减续号（最新在前）；seq 下界自读取持续同步
 */
export function createIndexeddbTelemetry(db: DbBackend): TelemetryPort & TelemetryImportShape {
  let seedPromise: Promise<void> | null = null;
  let logSeq = SEQ_SEED_BASE;
  let alarmSeq = SEQ_SEED_BASE;
  let serviceSeq = SEQ_SEED_BASE;
  let metricSeq = SEQ_SEED_BASE;

  /** 懒播种（失败重置允许重试；四表独立判定空库，互不阻塞） */
  const ensureSeeded = (): Promise<void> => {
    if (seedPromise === null) {
      seedPromise = Promise.all([
        seedIfEmpty(db, "services", SERVICES_LIST, (s) => s.serviceId),
        seedIfEmpty(db, "metrics", OPS_METRICS, (m) => `metric-${m.time}`),
        seedIfEmpty(db, "alarms", SYSTEM_ALARMS, (a) => a.id),
        seedIfEmpty(db, "logs", INITIAL_LOGS, (l) => l.id),
      ])
        .then(() => undefined)
        .catch((err: unknown) => {
          seedPromise = null;
          throw err;
        });
    }
    return seedPromise;
  };

  return {
    async listServices() {
      await ensureSeeded();
      return unwrapAll<ServiceStatus>(await db.getAll("services"));
    },
    async listMetrics() {
      await ensureSeeded();
      return unwrapAll<OpsMetric>(await db.getAll("metrics"));
    },
    async listAlarms() {
      await ensureSeeded();
      return unwrapAll<AlarmItem>(await db.getAll("alarms"));
    },
    async listLogs() {
      await ensureSeeded();
      const rows = await db.getAll("logs");
      for (const row of rows) {
        if (isEnvelope(row)) logSeq = Math.min(logSeq, row.seq);
      }
      return unwrapAll<LogEntry>(rows);
    },
    async appendLog(entry) {
      await ensureSeeded();
      const record = cloneJson(entry);
      logSeq -= 1;
      await db.put("logs", envelope(record.id, logSeq, record));
      return cloneJson(record);
    },
    async resolveAlarm(id) {
      await ensureSeeded();
      const row = await db.get("alarms", id);
      if (!isEnvelope(row)) return null;
      const alarm = { ...(row.value as AlarmItem), resolved: true };
      await db.put("alarms", envelope(row.id, row.seq, alarm));
      return cloneJson(alarm);
    },
    async appendAlarms(items) {
      await ensureSeeded();
      for (const item of items) {
        const record = cloneJson(item);
        alarmSeq -= 1;
        await db.put("alarms", envelope(record.id, alarmSeq, record));
      }
    },
    async appendServices(items) {
      await ensureSeeded();
      for (const item of items) {
        const record = cloneJson(item);
        serviceSeq -= 1;
        await db.put("services", envelope(record.serviceId, serviceSeq, record));
      }
    },
    async appendMetrics(items) {
      await ensureSeeded();
      for (const item of items) {
        const record = cloneJson(item);
        metricSeq -= 1;
        await db.put("metrics", envelope(`metric-${record.time}`, metricSeq, record));
      }
    },
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
