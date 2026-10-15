/**
 * file: src/__tests__/adapters.telemetry.test.ts
 * description: 遥测端口/适配器基线测试（快照出借 + 深拷贝隔离 + 留痕写入 + 组合根装配）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[adapter],[telemetry],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: TelemetryPort 契约基线 — 05 Runbook 事件表消费语义逐项验证
 *
 * dependencies: vitest, ../app/composition, ../adapters/memory/telemetryRepository, ../data/ops, ../types
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { createMemoryTelemetry } from "../adapters/memory/telemetryRepository";
import { createPorts } from "../app/composition";
import { INITIAL_LOGS, OPS_METRICS, SERVICES_LIST, SYSTEM_ALARMS } from "../data/ops";
import { LogEntry } from "../types";

describe("TelemetryPort · memory 适配器", () => {
  it("四事件表全量出借且与 05 Runbook 源快照一致", async () => {
    const t = createMemoryTelemetry();
    const [services, metrics, alarms, logs] = await Promise.all([
      t.listServices(),
      t.listMetrics(),
      t.listAlarms(),
      t.listLogs(),
    ]);
    expect(services).toEqual(SERVICES_LIST);
    expect(metrics).toEqual(OPS_METRICS);
    expect(alarms).toEqual(SYSTEM_ALARMS);
    expect(logs).toEqual(INITIAL_LOGS);
  });

  it("告警表深拷贝隔离：篡改返回值不污染适配器状态", async () => {
    const t = createMemoryTelemetry();
    const alarms = await t.listAlarms();
    alarms[0]!.resolved = true; // 测试内对出借副本写入，验证隔离
    const again = await t.listAlarms();
    expect(again[0]!.resolved).toBe(SYSTEM_ALARMS[0]!.resolved);
  });

  it("服务表深拷贝隔离：两次出借同值异引用", async () => {
    const t = createMemoryTelemetry();
    const a = await t.listServices();
    const b = await t.listServices();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a[0]).not.toBe(b[0]);
  });

  it("resolveAlarm 命中 → 翻转 resolved 并返回副本（06 契约 §2 #5 端口面）", async () => {
    const t = createMemoryTelemetry();
    const id = SYSTEM_ALARMS[0]!.id;
    const before = SYSTEM_ALARMS.find((a) => a.id === id)!.resolved;
    const resolved = await t.resolveAlarm(id);
    expect(resolved).not.toBeNull();
    expect(resolved!.id).toBe(id);
    expect(resolved!.resolved).toBe(true);
    // 适配器闭包态持久（同实例内再列出保持翻转）
    const alarms = await t.listAlarms();
    expect(alarms.find((a) => a.id === id)!.resolved).toBe(true);
    // 源快照不被污染
    expect(SYSTEM_ALARMS.find((a) => a.id === id)!.resolved).toBe(before);
  });

  it("resolveAlarm 未命中 → null（业务空值，06 §2 v1.0.1 细化）", async () => {
    const t = createMemoryTelemetry();
    expect(await t.resolveAlarm("ALARM-NOT-EXIST")).toBeNull();
  });

  it("resolveAlarm 返回副本与仓库状态隔离（深拷贝出借）", async () => {
    const t = createMemoryTelemetry();
    const id = SYSTEM_ALARMS[0]!.id;
    const resolved = await t.resolveAlarm(id);
    resolved!.resolved = false;
    expect((await t.listAlarms()).find((a) => a.id === id)!.resolved).toBe(true);
  });

  it("appendLog 留痕前置写入并返回副本（05 §3.3 留痕语义）", async () => {
    const t = createMemoryTelemetry();
    const entry: LogEntry = {
      id: "log-test-001",
      level: "warn",
      stage: "telemetry",
      message: "降级事件留痕测试",
      suggestion: "回退 memory 快照",
      timestamp: "00:00:00",
    };
    const returned = await t.appendLog(entry);
    expect(returned).toEqual(entry);
    const logs = await t.listLogs();
    expect(logs[0]!.id).toBe("log-test-001");
    expect(logs).toHaveLength(INITIAL_LOGS.length + 1);
    // 返回副本与仓库状态隔离
    returned.level = "error";
    expect((await t.listLogs())[0]!.level).toBe("warn");
  });
});

describe("组合根装配 · telemetry 端口", () => {
  it("createPorts 暴露 telemetry 端口且数据可用", async () => {
    const { telemetry } = createPorts();
    const alarms = await telemetry.listAlarms();
    expect(alarms.length).toBeGreaterThan(0);
    expect(alarms[0]!.id).toBe(SYSTEM_ALARMS[0]!.id);
  });

  it("防空转：四事件表均非空（守卫有效性）", async () => {
    const t = createMemoryTelemetry();
    expect((await t.listServices()).length).toBeGreaterThan(0);
    expect((await t.listMetrics()).length).toBeGreaterThan(0);
    expect((await t.listAlarms()).length).toBeGreaterThan(0);
    expect((await t.listLogs()).length).toBeGreaterThan(0);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
