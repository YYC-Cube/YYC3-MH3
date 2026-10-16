/**
 * file: src/adapters/indexeddb/records.ts
 * description: YYC³ 适配器层 — IDB 仓库共用记录包装与播种助手（内部模块）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[indexeddb],[records],[seed]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 记录包装信封（id + seq + value）与空库播种 — seq 保证 getAll 主键序
 *        之外的业务插入序（夹具原序 + 新记录前置），语义与 memory 适配器对齐；
 *        信封仅在适配器内部流转，出借前解包，业务值不携带 seq/id 冗余字段。
 *
 * dependencies: ./db
 * exports: RecordEnvelope, SEQ_SEED_BASE, envelope, isEnvelope, unwrap, unwrapAll, seedIfEmpty
 */
import { DbBackend, StoreName } from "./db";

/** 包装信封：id = store 主键；seq = 业务插入序号（升序即展示序） */
export interface RecordEnvelope<T> {
  id: string;
  seq: number;
  value: T;
}

/** 播种序号基线（高位段；夹具升序赋号，新记录自基线递减 → 升序读取 = 新记录前置） */
export const SEQ_SEED_BASE = 1_000_000;

/** 构造信封 */
export function envelope<T>(id: string, seq: number, value: T): RecordEnvelope<T> {
  return { id, seq, value };
}

/** 信封形状守卫（防外部写入的异形记录混入读取路径） */
export function isEnvelope(row: unknown): row is RecordEnvelope<unknown> {
  return (
    typeof row === "object" &&
    row !== null &&
    typeof (row as Record<string, unknown>).id === "string" &&
    typeof (row as Record<string, unknown>).seq === "number" &&
    "value" in row
  );
}

/** 单条解包：命中返回业务值副本位（结构化克隆已隔离），异形/未命中返回 null */
export function unwrap<T>(row: unknown): T | null {
  return isEnvelope(row) ? (row.value as T) : null;
}

/**
 * 批量解包：过滤异形记录后按 seq 升序返回业务值（升序 = 夹具原序 + 新记录前置，
 * 与 memory 适配器「夹具快照 + 回写前置」展示序完全对齐）。
 */
export function unwrapAll<T>(rows: readonly unknown[]): T[] {
  return rows
    .filter(isEnvelope)
    .sort((a, b) => a.seq - b.seq)
    .map((row) => row.value as T);
}

/**
 * 空库播种：store 为空时逐条写入信封（夹具升序赋号：fixture[i] = 基线 + i，
 * 升序读取即夹具原序；新记录自基线递减续号 → 恒排最前）；非空即跳过（幂等，
 * 二次启动不再回写夹具，之后一切读写走 IDB）。顺序写入保证真实 IDB 下
 * 事务时序确定（演示数据量级个位/十位，无性能顾虑）。
 */
export async function seedIfEmpty<T>(
  db: DbBackend,
  store: StoreName,
  items: readonly T[],
  idOf: (item: T) => string,
): Promise<void> {
  const rows = await db.getAll(store);
  if (rows.length > 0) return;
  for (const [index, item] of items.entries()) {
    await db.put(store, envelope(idOf(item), SEQ_SEED_BASE + index, item));
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
