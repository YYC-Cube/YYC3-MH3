/**
 * file: src/__tests__/data-portability.test.ts
 * description: 数据主权用例单元测试 — 导出信封 / 留痕 / 导入校验与端口写回往返（P4-3）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[usecase],[data-sovereignty],[roundtrip],[yyc3]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P4-3 验收测试（jsdom 无 IndexedDB，经 createInMemoryDbBackend 同接口
 *        替身装配 IDB 形态端口）：exportAllData 信封结构与 last-export-meta
 *        留痕；importAllData 合法往返（export → 新端口实例 import → listAll
 *        读回数量一致）、重复导入幂等、非法 JSON / 错误 format / 缺数组形状
 *        全部 ok=false 且不写库；memory 装配（无批次 save）跳过诚实注明。
 *        UI 交互由 build 装配类型覆盖（逻辑已用例化）。
 *
 * dependencies: vitest, ../adapters/indexeddb/*, ../adapters/memory/*, ../app/composition, ../app/usecases/dataPortability, ../domains/production/*, ../types
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { createIndexeddbBatchRepository } from "../adapters/indexeddb/batchRepository";
import { createInMemoryDbBackend } from "../adapters/indexeddb/db";
import { createIndexeddbStorage } from "../adapters/indexeddb/kv";
import { createIndexeddbSeedRepository } from "../adapters/indexeddb/seedRepository";
import { createIndexeddbTelemetry } from "../adapters/indexeddb/telemetryRepository";
import { createMemoryAgent } from "../adapters/memory/agent";
import { INITIAL_BATCHES } from "../adapters/memory/fixtures/batch";
import {
  INITIAL_LOGS,
  OPS_METRICS,
  SERVICES_LIST,
  SYSTEM_ALARMS,
} from "../adapters/memory/fixtures/ops";
import { INITIAL_SEEDS } from "../adapters/memory/fixtures/seed";
import { createInMemoryQueue } from "../adapters/memory/queue";
import { createTelemetryObservability } from "../adapters/observabilityBridge";
import { AppPorts, createPorts } from "../app/composition";
import {
  exportAllData,
  importAllData,
  LAST_EXPORT_META_KEY,
} from "../app/usecases/dataPortability";
import { createBatchItem } from "../domains/production/batch";
import { createSeedFromAdoption } from "../domains/production/seed";
import { ExportEnvelope, LogEntry } from "../types";

/** IDB 形态装配（内存后端替身，与 adapters.indexeddb 验收测试同型） */
function createIdbStylePorts(): AppPorts {
  const db = createInMemoryDbBackend();
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

describe("app/usecases/dataPortability · exportAllData", () => {
  it("信封结构：format/version/exportedAt 与各数组长度同端口快照一致（2 空格美化）", async () => {
    const json = await exportAllData(createIdbStylePorts());
    const envelope = JSON.parse(json) as ExportEnvelope;
    expect(envelope.format).toBe("yyc3-mh3-export");
    expect(envelope.version).toBe(1);
    expect(new Date(envelope.exportedAt).toString()).not.toBe("Invalid Date");
    expect(envelope.batches).toHaveLength(INITIAL_BATCHES.length);
    expect(envelope.seeds).toHaveLength(INITIAL_SEEDS.length);
    expect(envelope.telemetry.services).toHaveLength(SERVICES_LIST.length);
    expect(envelope.telemetry.metrics).toHaveLength(OPS_METRICS.length);
    expect(envelope.telemetry.alarms).toHaveLength(SYSTEM_ALARMS.length);
    expect(envelope.telemetry.logs).toHaveLength(INITIAL_LOGS.length);
    expect(json).toContain('\n  "format"'); // JSON.stringify(data, null, 2) 美化输出
  });

  it("导出留痕：last-export-meta 写入 storage（count=批次+种子+日志，at=导出时刻）", async () => {
    const ports = createIdbStylePorts();
    const json = await exportAllData(ports);
    const envelope = JSON.parse(json) as ExportEnvelope;
    const meta = await ports.storage.load<{ count: number; at: string }>(LAST_EXPORT_META_KEY);
    expect(meta).not.toBeNull();
    expect(meta!.count).toBe(INITIAL_BATCHES.length + INITIAL_SEEDS.length + INITIAL_LOGS.length);
    expect(meta!.at).toBe(envelope.exportedAt);
  });
});

describe("app/usecases/dataPortability · importAllData", () => {
  it("合法往返：export → 新端口实例 import → 读回数量一致且新数据在位", async () => {
    const source = createIdbStylePorts();
    const batch = createBatchItem(
      { name: "导出验收批次", mode: "Ref2VA", seed: 24681012, prompt: "roundtrip" },
      INITIAL_BATCHES.length,
    );
    await source.batches.save!(batch); // IDB 形态装配恒有 save 写回扩展
    const adopted = createSeedFromAdoption({ seedNumber: 24681012, name: "导出验收种子" });
    await source.seeds.create(adopted);
    const entry: LogEntry = {
      id: "LOG-EXPORT-01",
      timestamp: "12:00:00.000",
      level: "info",
      stage: "导出验收",
      message: "往返用例留痕",
    };
    await source.telemetry.appendLog(entry);
    const json = await exportAllData(source);

    const target = createIdbStylePorts(); // 新实例 = 模拟刷新后另一份本地库
    const result = await importAllData(target, json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.imported.batches).toBe(INITIAL_BATCHES.length + 1);
    expect(result.imported.seeds).toBe(1); // 夹具种子按 id 去重，仅新增 1 条
    expect(result.imported.logs).toBe(INITIAL_LOGS.length + 1);
    expect(result.imported.alarms).toBe(SYSTEM_ALARMS.length); // T2：三表全量写回
    expect(result.imported.services).toBe(SERVICES_LIST.length);
    expect(result.imported.metrics).toBe(OPS_METRICS.length);
    expect(await target.batches.listAll()).toHaveLength(INITIAL_BATCHES.length + 1);
    expect(await target.seeds.listAll()).toHaveLength(INITIAL_SEEDS.length + 1);
    expect(await target.telemetry.listLogs()).toHaveLength(INITIAL_LOGS.length + 1);
    expect(await target.telemetry.listAlarms()).toHaveLength(SYSTEM_ALARMS.length);
    expect(await target.telemetry.listServices()).toHaveLength(SERVICES_LIST.length);
    expect(await target.telemetry.listMetrics()).toHaveLength(OPS_METRICS.length);
    expect((await target.seeds.getById(adopted.id))!.name).toBe(adopted.name);
    expect((await target.batches.getById(batch.id))!.name).toBe(batch.name);
  });

  it("重复导入幂等：同信封二次导入种子 0 新增（id 去重）、日志/批次/遥测三表行数不增（按 id upsert）", async () => {
    const json = await exportAllData(createIdbStylePorts());
    const target = createIdbStylePorts();
    const first = await importAllData(target, json);
    const second = await importAllData(target, json);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.imported.seeds).toBe(0);
    expect(await target.seeds.listAll()).toHaveLength(INITIAL_SEEDS.length);
    expect(await target.telemetry.listLogs()).toHaveLength(INITIAL_LOGS.length);
    expect(await target.telemetry.listAlarms()).toHaveLength(SYSTEM_ALARMS.length);
    expect(await target.telemetry.listServices()).toHaveLength(SERVICES_LIST.length);
    expect(await target.telemetry.listMetrics()).toHaveLength(OPS_METRICS.length);
    expect(await target.batches.listAll()).toHaveLength(INITIAL_BATCHES.length);
  });

  it("非法 JSON：ok=false 不抛错且不写库", async () => {
    const target = createIdbStylePorts();
    const result = await importAllData(target, "{ definitely not json");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("JSON");
    expect(await target.seeds.listAll()).toHaveLength(INITIAL_SEEDS.length);
    expect(await target.telemetry.listLogs()).toHaveLength(INITIAL_LOGS.length);
  });

  it("错误 format / 版本：ok=false 且不写库", async () => {
    const target = createIdbStylePorts();
    const badFormat = await importAllData(
      target,
      JSON.stringify({
        format: "other-app-export",
        version: 1,
        batches: [],
        seeds: [],
        telemetry: { services: [], metrics: [], alarms: [], logs: [] },
      }),
    );
    const badVersion = await importAllData(
      target,
      JSON.stringify({
        format: "yyc3-mh3-export",
        version: 99,
        batches: [],
        seeds: [],
        telemetry: { services: [], metrics: [], alarms: [], logs: [] },
      }),
    );
    expect(badFormat.ok).toBe(false);
    expect(badVersion.ok).toBe(false);
    if (!badFormat.ok) expect(badFormat.error).toContain("format");
    if (!badVersion.ok) expect(badVersion.error).toContain("版本");
    expect(await target.seeds.listAll()).toHaveLength(INITIAL_SEEDS.length);
    expect(await target.telemetry.listLogs()).toHaveLength(INITIAL_LOGS.length);
  });

  it("缺数组形状（batches 非数组 / telemetry 缺 logs）：ok=false 且不写库", async () => {
    const target = createIdbStylePorts();
    const badBatches = await importAllData(
      target,
      JSON.stringify({
        format: "yyc3-mh3-export",
        version: 1,
        batches: "nope",
        seeds: [],
        telemetry: { services: [], metrics: [], alarms: [], logs: [] },
      }),
    );
    const missingLogs = await importAllData(
      target,
      JSON.stringify({
        format: "yyc3-mh3-export",
        version: 1,
        batches: [],
        seeds: [],
        telemetry: { services: [], metrics: [], alarms: [] },
      }),
    );
    expect(badBatches.ok).toBe(false);
    expect(missingLogs.ok).toBe(false);
    expect(await target.seeds.listAll()).toHaveLength(INITIAL_SEEDS.length);
    expect(await target.telemetry.listLogs()).toHaveLength(INITIAL_LOGS.length);
  });

  it("memory 装配（无批次 save 写回）：批次跳过并诚实注明，遥测三表经扩展通道全量写回", async () => {
    const json = await exportAllData(createPorts("memory"));
    const result = await importAllData(createPorts("memory"), json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.imported.batches).toBe(0);
    expect(result.skipped.batches).toContain("读模型");
    expect(result.skipped.alarms).toBeUndefined(); // T2：memory 适配器提供三表导入通道
    expect(result.skipped.services).toBeUndefined();
    expect(result.skipped.metrics).toBeUndefined();
    expect(result.imported.alarms).toBe(SYSTEM_ALARMS.length);
    expect(result.imported.services).toBe(SERVICES_LIST.length);
    expect(result.imported.metrics).toBe(OPS_METRICS.length);
    expect(result.imported.seeds).toBe(0); // memory 夹具同源，全部按 id 去重
  });

  it("无遥测导入扩展的装配（local BFF 读模型形态）：三表跳过并诚实注明，其余写回不受影响", async () => {
    const json = await exportAllData(createIdbStylePorts());
    const memoryPorts = createPorts("memory");
    // 剥离 T2 扩展通道，模拟 local BFF 读模型装配（仅 TelemetryPort 基础面）
    const bareTelemetry = memoryPorts.telemetry;
    const barePorts: AppPorts = {
      ...memoryPorts,
      telemetry: {
        listServices: () => bareTelemetry.listServices(),
        listMetrics: () => bareTelemetry.listMetrics(),
        listAlarms: () => bareTelemetry.listAlarms(),
        listLogs: () => bareTelemetry.listLogs(),
        appendLog: (entry) => bareTelemetry.appendLog(entry),
        resolveAlarm: (id) => bareTelemetry.resolveAlarm(id),
      },
    };
    const result = await importAllData(barePorts, json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.skipped.alarms).toContain("跳过");
    expect(result.skipped.services).toContain("跳过");
    expect(result.skipped.metrics).toContain("跳过");
    expect(result.imported.alarms).toBe(0);
    expect(result.imported.services).toBe(0);
    expect(result.imported.metrics).toBe(0);
    expect(result.imported.logs).toBe(INITIAL_LOGS.length); // 日志通道不受影响
    expect(result.imported.seeds).toBe(0); // memory 夹具同源去重
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
