/**
 * file: src/__tests__/adapters.indexeddb.test.ts
 * description: indexeddb 适配器单元测试 — 内存后端替身驱动 CRUD/播种/持久化语义 + 内存队列
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[adapter],[indexeddb],[queue]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P4-1/2 验收测试（jsdom 无 IndexedDB，经 createInMemoryDbBackend 同接口
 *        替身驱动）：db 后端语义 / 三仓库完整 CRUD 与空库播种 / 持久化语义
 *        （新实例读前实例写入）/ kv 存储端口 / 内存队列 FIFO 与事件 / 组合根
 *        auto 回退。IDB 真实路径由 pnpm build + 浏览器冒烟覆盖。
 *
 * dependencies: vitest, ../adapters/indexeddb/*, ../adapters/memory/*, ../app/composition, ../domains/production/*, ../adapters/memory/fixtures/*
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { createIndexeddbBatchRepository } from "../adapters/indexeddb/batchRepository";
import { createInMemoryDbBackend } from "../adapters/indexeddb/db";
import { createIndexeddbStorage } from "../adapters/indexeddb/kv";
import { createIndexeddbSeedRepository } from "../adapters/indexeddb/seedRepository";
import { createIndexeddbTelemetry } from "../adapters/indexeddb/telemetryRepository";
import { INITIAL_BATCHES } from "../adapters/memory/fixtures/batch";
import {
  INITIAL_LOGS,
  OPS_METRICS,
  SERVICES_LIST,
  SYSTEM_ALARMS,
} from "../adapters/memory/fixtures/ops";
import { INITIAL_SEEDS } from "../adapters/memory/fixtures/seed";
import { createInMemoryQueue } from "../adapters/memory/queue";
import { createPorts } from "../app/composition";
import { QueueTask } from "../domains/platform/queue/ports";
import { createBatchItem } from "../domains/production/batch";
import { createSeedFromAdoption } from "../domains/production/seed";
import { LogEntry } from "../types";

/* ---------------- db：内存后端替身（DbBackend 最小句柄语义） ---------------- */

describe("adapters/indexeddb · db 内存后端", () => {
  it("put/get/getAll/delete/clear：主键 upsert 与全量读取", async () => {
    const db = createInMemoryDbBackend();
    await db.put("kv", { key: "a", value: 1 });
    await db.put("kv", { key: "a", value: 2 }); // 同主键 upsert
    await db.put("kv", { key: "b", value: 3 });
    expect(await db.get("kv", "a")).toEqual({ key: "a", value: 2 });
    expect(await db.getAll("kv")).toHaveLength(2);
    await db.delete("kv", "a");
    expect(await db.get("kv", "a")).toBeNull();
    await db.clear("kv");
    expect(await db.getAll("kv")).toHaveLength(0);
  });

  it("克隆隔离：put 后篡改原对象不影响后端，get 返回独立副本", async () => {
    const db = createInMemoryDbBackend();
    const record = { id: "X1", seq: 1, value: { n: 1 } };
    await db.put("batches", record);
    record.value.n = 999; // 篡改原对象
    const first = (await db.get("batches", "X1")) as { value: { n: number } };
    expect(first.value.n).toBe(1);
    first.value.n = 777; // 篡改返回副本
    const second = (await db.get("batches", "X1")) as { value: { n: number } };
    expect(second.value.n).toBe(1);
  });
});

/* ---------------- batch 仓储：播种 / 读模型 / save 写回持久化 ---------------- */

describe("adapters/indexeddb · batchRepository", () => {
  it("空库首启播种：listAll 返回夹具全量且顺序一致", async () => {
    const repo = createIndexeddbBatchRepository(createInMemoryDbBackend());
    const list = await repo.listAll();
    expect(list).toHaveLength(INITIAL_BATCHES.length);
    expect(list.map((b) => b.id)).toEqual(INITIAL_BATCHES.map((b) => b.id));
  });

  it("getById 命中返回副本 / 未命中返回 null（契约 404 约定）", async () => {
    const repo = createIndexeddbBatchRepository(createInMemoryDbBackend());
    const target = INITIAL_BATCHES[1]!;
    const found = await repo.getById(target.id);
    expect(found!.id).toBe(target.id);
    found!.name = "副本篡改";
    expect((await repo.getById(target.id))!.name).toBe(target.name);
    expect(await repo.getById("BATCH-NOT-EXIST")).toBeNull();
  });

  it("save 写回：新批次续号入仓且前置展示（对齐 App 回写序）", async () => {
    const db = createInMemoryDbBackend();
    const repo = createIndexeddbBatchRepository(db);
    await repo.listAll(); // 触发播种
    const batch = createBatchItem(
      { name: "P4 落盘批次", mode: "Ref2VA", seed: 24681012, prompt: "persistence smoke" },
      INITIAL_BATCHES.length,
    );
    await repo.save(batch);
    expect((await repo.listAll())[0]!.id).toBe(batch.id);
  });

  it("持久化语义：新实例可读前实例写入的数据（播种不重复执行）", async () => {
    const db = createInMemoryDbBackend();
    const first = createIndexeddbBatchRepository(db);
    await first.listAll(); // 首实例播种
    const batch = createBatchItem(
      { name: "跨实例批次", mode: "FL2VA", seed: 13579111, prompt: "survive reload" },
      INITIAL_BATCHES.length,
    );
    await first.save(batch);
    const second = createIndexeddbBatchRepository(db); // 模拟刷新后的新实例
    const list = await second.listAll();
    expect(list).toHaveLength(INITIAL_BATCHES.length + 1);
    expect(list[0]!.id).toBe(batch.id);
  });
});

/* ---------------- seed 仓储：播种 / 采纳回写 / 跨实例持久 ---------------- */

describe("adapters/indexeddb · seedRepository", () => {
  it("播种 + create 采纳回写：新种子前置并返回副本", async () => {
    const repo = createIndexeddbSeedRepository(createInMemoryDbBackend());
    expect(await repo.listAll()).toHaveLength(INITIAL_SEEDS.length);
    const adopted = createSeedFromAdoption({ seedNumber: 24681012, name: "IDB 验收种子" });
    const created = await repo.create(adopted);
    expect(created.id).toBe(adopted.id);
    const list = await repo.listAll();
    expect(list).toHaveLength(INITIAL_SEEDS.length + 1);
    expect(list[0]!.id).toBe(adopted.id);
  });

  it("持久化语义：新实例读到前实例采纳回写（含 getById）", async () => {
    const db = createInMemoryDbBackend();
    const first = createIndexeddbSeedRepository(db);
    const adopted = createSeedFromAdoption({ seedNumber: 13579111 });
    await first.create(adopted);
    const second = createIndexeddbSeedRepository(db);
    const list = await second.listAll();
    expect(list).toHaveLength(INITIAL_SEEDS.length + 1);
    expect(list[0]!.id).toBe(adopted.id);
    expect((await second.getById(adopted.id))!.name).toBe(adopted.name);
  });
});

/* ---------------- telemetry 适配器：四表播种 / 留痕 / 处置持久 ---------------- */

describe("adapters/indexeddb · telemetryRepository", () => {
  it("四事件表空库播种：数量与夹具一致", async () => {
    const telemetry = createIndexeddbTelemetry(createInMemoryDbBackend());
    expect(await telemetry.listServices()).toHaveLength(SERVICES_LIST.length);
    expect(await telemetry.listMetrics()).toHaveLength(OPS_METRICS.length);
    expect(await telemetry.listAlarms()).toHaveLength(SYSTEM_ALARMS.length);
    expect(await telemetry.listLogs()).toHaveLength(INITIAL_LOGS.length);
  });

  it("appendLog 前置留痕 + 跨实例可见（持久化语义）", async () => {
    const db = createInMemoryDbBackend();
    const telemetry = createIndexeddbTelemetry(db);
    const entry: LogEntry = {
      id: "LOG-P4-01",
      timestamp: "11:00:00.000",
      level: "info",
      stage: "持久化验收",
      message: "端口留痕写回测试",
    };
    const echoed = await telemetry.appendLog(entry);
    expect(echoed.id).toBe(entry.id);
    const logs = await telemetry.listLogs();
    expect(logs).toHaveLength(INITIAL_LOGS.length + 1);
    expect(logs[0]!.id).toBe(entry.id);
    const reopened = createIndexeddbTelemetry(db); // 模拟刷新后新实例
    const reopenedLogs = await reopened.listLogs();
    expect(reopenedLogs).toHaveLength(INITIAL_LOGS.length + 1);
    expect(reopenedLogs[0]!.id).toBe(entry.id);
  });

  it("resolveAlarm 翻转落盘 + 跨实例持久 + 未命中返回 null", async () => {
    const db = createInMemoryDbBackend();
    const telemetry = createIndexeddbTelemetry(db);
    const target = SYSTEM_ALARMS[0]!;
    const resolved = await telemetry.resolveAlarm(target.id);
    expect(resolved!.resolved).toBe(true);
    const reopened = createIndexeddbTelemetry(db);
    const persisted = (await reopened.listAlarms()).find((a) => a.id === target.id);
    expect(persisted!.resolved).toBe(true);
    expect(await telemetry.resolveAlarm("ALARM-NOT-EXIST")).toBeNull();
  });
});

/* ---------------- kv 存储端口：P4-3 导出导入的数据通道 ---------------- */

describe("adapters/indexeddb · storage（kv）", () => {
  it("save/load 往返 + 覆盖写 + remove 幂等 + 未命中 null", async () => {
    const storage = createIndexeddbStorage(createInMemoryDbBackend());
    expect(await storage.load("missing")).toBeNull();
    await storage.save("export-1", { rows: [1, 2, 3] });
    expect(await storage.load("export-1")).toEqual({ rows: [1, 2, 3] });
    await storage.save("export-1", { rows: [9] }); // 覆盖写
    expect(await storage.load("export-1")).toEqual({ rows: [9] });
    await storage.remove("export-1");
    expect(await storage.load("export-1")).toBeNull();
    await storage.remove("export-1"); // 幂等删除不抛错
  });
});

/* ---------------- 内存队列：FIFO / 事件 / drain ---------------- */

describe("adapters/memory · queue", () => {
  const task = (id: string): QueueTask<string> => ({ id, type: "render", payload: `p-${id}` });

  it("enqueue/dequeue 严格 FIFO，空队返回 null", async () => {
    const queue = createInMemoryQueue<string>();
    expect(await queue.dequeue()).toBeNull();
    await queue.enqueue(task("T1"));
    await queue.enqueue(task("T2"));
    expect((await queue.dequeue())!.id).toBe("T1");
    expect((await queue.dequeue())!.id).toBe("T2");
    expect(await queue.dequeue()).toBeNull();
  });

  it("size 跟踪积压量，drain 清空并返回被移除任务", async () => {
    const queue = createInMemoryQueue<string>();
    await queue.enqueue(task("T1"));
    await queue.enqueue(task("T2"));
    expect(queue.size()).toBe(2);
    expect(queue.drain().map((t) => t.id)).toEqual(["T1", "T2"]);
    expect(queue.size()).toBe(0);
    expect(await queue.dequeue()).toBeNull();
  });

  it("onEvent 收到 enqueued/dequeued 流转事件，退订后不再接收", async () => {
    const queue = createInMemoryQueue<string>();
    const events: string[] = [];
    const unsubscribe = queue.onEvent((event) => events.push(`${event.type}:${event.task.id}`));
    await queue.enqueue(task("T1"));
    await queue.dequeue();
    unsubscribe();
    await queue.enqueue(task("T2"));
    expect(events).toEqual(["enqueued:T1", "dequeued:T1"]);
  });

  it("实例间队列状态隔离（两实例互不可见任务）", async () => {
    const queueA = createInMemoryQueue<string>();
    const queueB = createInMemoryQueue<string>();
    await queueA.enqueue(task("T1"));
    expect(queueA.size()).toBe(1);
    expect(queueB.size()).toBe(0);
    expect(await queueB.dequeue()).toBeNull();
  });
});

/* ---------------- composition：模式切换与回退 ---------------- */

describe("app/composition · 运行时切换", () => {
  it('createPorts("memory") 显式装配 memory 三仓库 + storage/queue 在位', async () => {
    const ports = createPorts("memory");
    expect(await ports.batches.listAll()).toHaveLength(INITIAL_BATCHES.length);
    expect(await ports.seeds.listAll()).toHaveLength(INITIAL_SEEDS.length);
    expect(ports.batches.save).toBeUndefined(); // memory 读模型无写回扩展
    expect(typeof ports.storage.load).toBe("function");
    expect(typeof ports.queue.enqueue).toBe("function");
  });

  it('createPorts("auto") 无 indexedDB 环境（jsdom/SSR）自动回退 memory', async () => {
    const ports = createPorts("auto");
    expect(await ports.batches.getById(INITIAL_BATCHES[0]!.id)).not.toBeNull();
    expect(await ports.telemetry.listAlarms()).toHaveLength(SYSTEM_ALARMS.length);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
