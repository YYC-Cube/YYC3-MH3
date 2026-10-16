/**
 * file: server/prometheus.ts
 * description: Registry BFF — 平台指标 Prometheus 文本暴露渲染（/api/metrics/prometheus）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [server],[bff],[prometheus],[scrape],[p2]
 * category: server
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-2 可观测出口（服务侧）——把 BFF 内存中的平台采集快照（OpsMetric，
 *        06 契约 §2 /api/metrics 同源数据）渲染为 Prometheus 文本暴露格式，
 *        供 Prometheus 以 pull 模式 scrape（Track A 回环轨）。
 *   - 指标族：yyc3_platform_{gpu_vram_gb|gpu_util_percent|cpu_util_percent|
 *     mem_util_gb|disk_iops_mbps|temp_celsius}，以 time="HH:mm" 为样本标签
 *   - 纯函数零副作用：registryApi 不感知线格式，routeHandler 薄壳拦截转发
 *
 * dependencies: ../src/types
 * exports: renderOpsPrometheus, PROMETHEUS_CONTENT_TYPE
 */
import type { OpsMetric } from "../src/types";

/** Prometheus 文本暴露格式 Content-Type（版本 0.0.4） */
export const PROMETHEUS_CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8";

/** 指标族描述（与 OpsMetric 字段一一对应，单位入名） */
const OPS_FAMILIES: Array<{ key: keyof OpsMetric; name: string; help: string }> = [
  { key: "gpuVram", name: "yyc3_platform_gpu_vram_gb", help: "GPU 显存占用（GB）" },
  { key: "gpuUtil", name: "yyc3_platform_gpu_util_percent", help: "GPU 利用率（%）" },
  { key: "cpuUtil", name: "yyc3_platform_cpu_util_percent", help: "CPU 利用率（%）" },
  { key: "memUtil", name: "yyc3_platform_mem_util_gb", help: "内存占用（GB）" },
  { key: "diskIops", name: "yyc3_platform_disk_iops_mbps", help: "磁盘吞吐（MB/s）" },
  { key: "temp", name: "yyc3_platform_temp_celsius", help: "设备温度（°C）" },
];

/** label 值转义（反斜杠/双引号/换行） */
function escapeLabelValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/**
 * 平台指标列表 → Prometheus 文本暴露格式。
 * 每个样本以 time（HH:mm 采集时点）为 label；空列表仍输出 HELP/TYPE 头
 * （scrape 面稳定，Prometheus 不会因空样本摘除指标族）。
 */
export function renderOpsPrometheus(metrics: readonly OpsMetric[]): string {
  const lines: string[] = [];
  for (const family of OPS_FAMILIES) {
    lines.push(`# HELP ${family.name} ${family.help}`);
    lines.push(`# TYPE ${family.name} gauge`);
    for (const metric of metrics) {
      const raw = metric[family.key];
      if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
      lines.push(`${family.name}{time="${escapeLabelValue(metric.time)}"} ${String(raw)}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
