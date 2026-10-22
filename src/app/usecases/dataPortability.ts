/**
 * file: src/app/usecases/dataPortability.ts
 * description: YYC³ 应用层 — 数据主权用例（全量 JSON 导出 / 导入，P4-3）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [app],[usecase],[data-sovereignty],[export],[import]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 数据主权闭环（P4-3，跨域流程收敛 app/usecases）——
 *        exportAllData：聚合批次/种子/遥测四事件表为带版本校验信封的 JSON
 *        字符串（2 空格美化），并经 storage "last-export-meta" 留痕；
 *        importAllData：解析 + 形状校验（format/version/数组类型，非法返回
 *        ok=false 不抛错不写库），合法则经端口写回 —— 批次走 save 写回扩展
 *        （memory 读模型无 save 时跳过并注明）、种子先按 id 去重再逐条 create
 *        （端口无 upsert 语义）、日志经 appendLog 逐条导入（存储层按 id
 *        upsert，重复导入幂等）、告警/服务/指标经 T2 导入扩展三通道批量
 *        追加（按 id upsert 幂等；local BFF 读模型无通道时诚实注明跳过）。
 *        零 React 依赖（纯 app 用例函数，可直接单测）。
 *
 * dependencies: ../../types, ../composition
 * exports: LAST_EXPORT_META_KEY, exportAllData, importAllData, ImportResult (re-export)
 */

import {
  AlarmItem,
  BatchItem,
  ExportEnvelope,
  ExportMeta,
  ImportResult,
  ImportSkipped,
  LogEntry,
  OpsMetric,
  SeedItem,
  ServiceStatus,
} from "../../types";
import { AppPorts } from "../composition";

/** 导出留痕 storage 键（导出时间 + 条数，供「上次导出」回显） */
export const LAST_EXPORT_META_KEY = "last-export-meta";

/** 导出信封格式标识与版本（导入校验锚点，与 ExportEnvelope 契约一致） */
const ENVELOPE_FORMAT = "yyc3-mh3-export";
const ENVELOPE_VERSION = 1;

/** re-export：导入结果契约（app 装配层与测试就近消费；类型权威定义在 types） */
export type { ImportResult };

/**
 * 全量导出：聚合端口读侧数据为信封 JSON 字符串。
 *
 * - 六路读并行（batches / seeds / telemetry 四事件表）；
 * - 导出即留痕：storage 写入 last-export-meta（count = 批次 + 种子 + 日志条数）；
 * - 端口读失败向上抛出（UI 侧捕获降级），本函数不做静默兜底。
 */
export async function exportAllData(ports: AppPorts): Promise<string> {
  const [batches, seeds, services, metrics, alarms, logs] = await Promise.all([
    ports.batches.listAll(),
    ports.seeds.listAll(),
    ports.telemetry.listServices(),
    ports.telemetry.listMetrics(),
    ports.telemetry.listAlarms(),
    ports.telemetry.listLogs(),
  ]);
  const envelope: ExportEnvelope = {
    format: ENVELOPE_FORMAT,
    version: ENVELOPE_VERSION,
    exportedAt: new Date().toISOString(),
    batches,
    seeds,
    telemetry: { services, metrics, alarms, logs },
  };
  const meta: ExportMeta = {
    count: batches.length + seeds.length + logs.length,
    at: envelope.exportedAt,
  };
  await ports.storage.save(LAST_EXPORT_META_KEY, meta);
  return JSON.stringify(envelope, null, 2);
}

/** 信封节点判定：非数组普通对象（narrowing 辅助，禁 any） */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 全量导入：解析 + 形状校验 + 端口写回。
 *
 * 校验失败（非法 JSON / format 不符 / 版本不支持 / 数组形状缺失）一律返回
 * `{ ok: false, error }`，不抛错、不触碰任何端口写路径；校验通过后：
 *
 * - 批次：经 `batches.save` 写回扩展逐条落盘；memory 读模型装配无 save
 *   时整体跳过，`skipped.batches` 注明原因；
 * - 种子：先 listAll 取现存 id 集合去重，再逐条 `seeds.create`（端口无
 *   upsert 语义，防重复导入制造重份）；
 * - 日志：逐条 `telemetry.appendLog`（IDB 存储层按 id upsert，重复导入
 *   幂等不增行）；
 * - 告警 / 观测表（services/metrics）：端口无批量写通道，跳过并在
 *   skipped 中诚实注明（信封仍导出其内容供人工查阅）。
 */
export async function importAllData(ports: AppPorts, json: string): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return { ok: false, error: "JSON 解析失败：文件内容不是合法的 JSON 文本" };
  }
  if (!isPlainObject(parsed)) {
    return { ok: false, error: "信封校验失败：根节点必须为 JSON 对象" };
  }
  if (parsed.format !== ENVELOPE_FORMAT) {
    return {
      ok: false,
      error: `信封校验失败：format 必须为 "${ENVELOPE_FORMAT}"（非本应用导出文件）`,
    };
  }
  if (parsed.version !== ENVELOPE_VERSION) {
    return { ok: false, error: `信封校验失败：不支持的信封版本（${String(parsed.version)}）` };
  }
  if (!Array.isArray(parsed.batches) || !Array.isArray(parsed.seeds) || !isPlainObject(parsed.telemetry)) {
    return { ok: false, error: "信封校验失败：batches / seeds 必须为数组且 telemetry 必须为对象" };
  }
  const telemetry = parsed.telemetry;
  if (
    !Array.isArray(telemetry.services) ||
    !Array.isArray(telemetry.metrics) ||
    !Array.isArray(telemetry.alarms) ||
    !Array.isArray(telemetry.logs)
  ) {
    return {
      ok: false,
      error: "信封校验失败：telemetry.services / metrics / alarms / logs 必须为数组",
    };
  }

  const skipped: ImportSkipped = {};

  // 批次写回：仅在装配提供 save 写回扩展时执行（memory 读模型整体跳过并注明）
  let importedBatches = 0;
  if (typeof ports.batches.save === "function") {
    for (const batch of parsed.batches as BatchItem[]) {
      await ports.batches.save(batch);
      importedBatches += 1;
    }
  } else {
    skipped.batches = "当前装配为读模型（无批次写回通道），批次数据跳过写回";
  }

  // 种子写回：现存 id 去重后逐条 create（端口无 upsert，防重复导入重份）
  const existingSeedIds = new Set((await ports.seeds.listAll()).map((s) => s.id));
  let importedSeeds = 0;
  for (const seed of parsed.seeds as SeedItem[]) {
    if (existingSeedIds.has(seed.id)) continue;
    await ports.seeds.create(seed);
    importedSeeds += 1;
  }

  // 日志留痕：逐条 appendLog（IDB 按 id upsert，重复导入幂等；memory 前置追加）
  let importedLogs = 0;
  for (const entry of telemetry.logs as LogEntry[]) {
    await ports.telemetry.appendLog(entry);
    importedLogs += 1;
  }

  // 遥测三表写回（T2 扩展）：装配提供批量追加通道时逐表导入（按 id upsert 幂等）；
  // local BFF 读模型无通道时跳过并诚实注明（信封内容仍导出供人工查阅）
  let importedAlarms = 0;
  let importedServices = 0;
  let importedMetrics = 0;
  if (typeof ports.telemetry.appendAlarms === "function") {
    const items = telemetry.alarms as AlarmItem[];
    await ports.telemetry.appendAlarms(items);
    importedAlarms = items.length;
  } else {
    skipped.alarms = "遥测端口无告警批量写回通道（仅处置翻转），alarms 跳过导入";
  }
  if (typeof ports.telemetry.appendServices === "function") {
    const items = telemetry.services as ServiceStatus[];
    await ports.telemetry.appendServices(items);
    importedServices = items.length;
  } else {
    skipped.services = "遥测端口无服务观测批量写回通道，services 跳过导入";
  }
  if (typeof ports.telemetry.appendMetrics === "function") {
    const items = telemetry.metrics as OpsMetric[];
    await ports.telemetry.appendMetrics(items);
    importedMetrics = items.length;
  } else {
    skipped.metrics = "遥测端口无指标观测批量写回通道，metrics 跳过导入";
  }

  return {
    ok: true,
    imported: {
      batches: importedBatches,
      seeds: importedSeeds,
      logs: importedLogs,
      alarms: importedAlarms,
      services: importedServices,
      metrics: importedMetrics,
    },
    skipped,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
