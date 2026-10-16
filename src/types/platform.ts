/**
 * file: src/types/platform.ts
 * description: YYC³ 类型契约 — 基础设施域（指标 / 服务 / 告警 / 日志 / 数据主权信封）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[platform],[observability],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 基础设施域契约 — 运维指标 / 服务状态 / 告警项 / 结构化日志 /
 *        数据主权导出导入信封（P4-3：跨 app ↔ views 的契约由 types 层承载，
 *        views 禁触 app 层，经结构类型注入装配）
 *
 * dependencies: ./production（BatchItem / SeedItem 契约引用，同层 types 互引）
 * exports: OpsMetric, ServiceStatus, AlarmItem, LogEntry, ExportMeta, ExportEnvelope, ImportSkipped, ImportResult
 */

import { BatchItem, SeedItem } from "./production";

export interface OpsMetric {
  time: string;
  gpuVram: number; // GB
  gpuUtil: number; // %
  cpuUtil: number; // %
  memUtil: number; // GB
  diskIops: number; // MB/s
  temp: number; // deg C
}

export interface ServiceStatus {
  name: string;
  serviceId: string;
  port?: number;
  status: "online" | "warning" | "offline";
  uptime: string;
  pids: number;
  memory: string;
  stabilityHistory?: number[]; // last 7 days stability %
}

export interface AlarmItem {
  id: string;
  level: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  recommendation: string;
  actionLabel?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  stage: string;
  message: string;
  suggestion?: string;
  /** P0-2 全链路追踪：traceId（单次操作跨端口串联锚点；缺省 = 未纳入追踪） */
  traceId?: string;
  actionable?: {
    actionLabel: string;
    actionType: string;
  };
}

/** P4-3 数据主权 · 导出留痕元信息（storage 键 "last-export-meta"；count = 批次 + 种子 + 日志条数） */
export interface ExportMeta {
  count: number;
  at: string;
}

/** P4-3 数据主权 · 全量导出信封（format/version 为导入校验锚点；telemetry 四事件表聚合） */
export interface ExportEnvelope {
  format: "yyc3-mh3-export";
  version: 1;
  exportedAt: string;
  batches: BatchItem[];
  seeds: SeedItem[];
  telemetry: {
    services: ServiceStatus[];
    metrics: OpsMetric[];
    alarms: AlarmItem[];
    logs: LogEntry[];
  };
}

/** P4-3 数据主权 · 导入跳过明细（端口无对应写通道时诚实注明；键缺省 = 未跳过） */
export interface ImportSkipped {
  batches?: string;
  alarms?: string;
  services?: string;
  metrics?: string;
}

/** P4-3 数据主权 · 导入成功计数（批次/种子/日志 + T2 扩展的遥测三表：告警/服务/指标） */
export interface ImportedCounts {
  batches: number;
  seeds: number;
  logs: number;
  alarms: number;
  services: number;
  metrics: number;
}

/** P4-3 数据主权 · 导入结果（判别联合：ok=true 携带计数与跳过明细；ok=false 携带原因，不抛错） */
export type ImportResult =
  | { ok: true; imported: ImportedCounts; skipped: ImportSkipped }
  | { ok: false; error: string };

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
