/**
 * file: src/adapters/memory/fixtures/ops.ts
 * description: YYC³ memory 适配器夹具 — 运维遥测演示快照（日志/指标/服务/告警，顶层冻结）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-12
 * updated: 2026-10-16
 * status: active
 * tags: [adapter],[memory],[fixtures],[ops]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 运维遥测演示快照 — 声明性演示数据，非真实采集（语义见 05-监控告警与Runbook）。
 *        四事件表均顶层 Object.freeze + 逐项浅拷贝派生（审计 G-2）：
 *        消费方（memory 适配器 / App Hook / BFF）初始化时必须再逐项浅拷贝出新数组，
 *        之后的一切变更只作用于副本，禁止回写本模块。
 *
 * dependencies: ../../../types
 * exports: INITIAL_LOGS, OPS_METRICS, SERVICES_LIST, SYSTEM_ALARMS
 */
import { AlarmItem, LogEntry, OpsMetric, ServiceStatus } from "../../../types";

/** 原始日志行（模块私有；冻结导出由其浅拷贝派生） */
const RAW_LOGS: LogEntry[] = [
  {
    id: "LOG-001",
    timestamp: "10:24:18.102",
    level: "info",
    stage: "生成引擎",
    message:
      "[DiffSynth] 初始化模型权重 DiffSynth-MiniMax-H3-v2.1-HQ (FP8 量化已启用，显存占用 8.2GB)",
  },
  {
    id: "LOG-002",
    timestamp: "10:24:20.441",
    level: "info",
    stage: "生成引擎",
    message: "[Ref2VA] 加载参考人脸特征向量并注入 Cross-Attention Key/Value 缓存，特征置信度 99.4%",
  },
  {
    id: "LOG-003",
    timestamp: "10:24:45.890",
    level: "info",
    stage: "生成引擎",
    message: "[DDIM Sampler] 30/30 扩散步数完成，平均耗时 0.82s/step，生成 300 帧 (10.0s 4K 视频)",
  },
  {
    id: "LOG-004",
    timestamp: "10:25:02.124",
    level: "success",
    stage: "初评流水线",
    message:
      "[SyncNet-v3] 口型吻合度初评完成：平均帧误差 0.042s，基准口型得分 95.8 (远超 85分阈值)",
  },
  {
    id: "LOG-005",
    timestamp: "10:25:12.780",
    level: "warn",
    stage: "精评阶段",
    message:
      "[MicroExpression] 检测到第 142-156 帧眨眼间隔微小迟滞 (380ms vs 基线 250ms)，未触发严重缺陷",
  },
  {
    id: "LOG-006",
    timestamp: "10:25:28.910",
    level: "info",
    stage: "精评阶段",
    message:
      "[Temporal Stability] 时序连续性打分 93.5，下颌线轮廓无跳帧伪影，正在进行 5 维雷达投影聚合...",
  },
];

/** 原始指标行（模块私有；冻结导出由其浅拷贝派生） */
const RAW_METRICS: OpsMetric[] = [
  {
    time: "09:00",
    gpuVram: 14.2,
    gpuUtil: 62,
    cpuUtil: 34,
    memUtil: 22.4,
    diskIops: 120,
    temp: 58,
  },
  {
    time: "09:15",
    gpuVram: 18.6,
    gpuUtil: 94,
    cpuUtil: 52,
    memUtil: 25.1,
    diskIops: 380,
    temp: 66,
  },
  {
    time: "09:30",
    gpuVram: 22.8,
    gpuUtil: 98,
    cpuUtil: 68,
    memUtil: 28.4,
    diskIops: 540,
    temp: 74,
  },
  {
    time: "09:45",
    gpuVram: 16.8,
    gpuUtil: 78,
    cpuUtil: 44,
    memUtil: 24.2,
    diskIops: 210,
    temp: 64,
  },
  {
    time: "10:00",
    gpuVram: 21.2,
    gpuUtil: 95,
    cpuUtil: 61,
    memUtil: 27.6,
    diskIops: 490,
    temp: 71,
  },
  {
    time: "10:15",
    gpuVram: 17.5,
    gpuUtil: 82,
    cpuUtil: 48,
    memUtil: 23.8,
    diskIops: 260,
    temp: 63,
  },
  {
    time: "10:30",
    gpuVram: 19.4,
    gpuUtil: 91,
    cpuUtil: 56,
    memUtil: 26.2,
    diskIops: 420,
    temp: 68,
  },
];

/** 原始服务行（模块私有；冻结导出由其浅拷贝派生） */
const RAW_SERVICES: ServiceStatus[] = [
  {
    name: "本地遥测聚合服务",
    serviceId: "srv-hono-gate",
    port: 3031,
    status: "online",
    uptime: "14天 06:22",
    pids: 1,
    memory: "148 MB",
  },
  {
    name: "DiffSynth 推理引擎 (CUDA:0)",
    serviceId: "srv-diffsynth-worker",
    port: 9100,
    status: "online",
    uptime: "14天 06:22",
    pids: 4,
    memory: "18.4 GB",
  },
  {
    name: "SyncNet 音视频对齐评分服务",
    serviceId: "srv-syncnet-eval",
    port: 9101,
    status: "online",
    uptime: "14天 06:20",
    pids: 2,
    memory: "2.1 GB",
  },
  {
    name: "Seed 种子库本地持久化守护进程",
    serviceId: "srv-seed-vault",
    port: 9102,
    status: "online",
    uptime: "14天 06:22",
    pids: 1,
    memory: "86 MB",
  },
  {
    name: "看门狗异常自愈监控服务",
    serviceId: "srv-watchdog",
    port: 9105,
    status: "online",
    uptime: "14天 06:22",
    pids: 1,
    memory: "42 MB",
  },
];

/** 原始告警行（模块私有；冻结导出由其浅拷贝派生） */
const RAW_ALARMS: AlarmItem[] = [
  {
    id: "ALARM-0412-01",
    level: "warning",
    title: "显存预警：瞬时 VRAM 达到 22.8 GB (阈值 22.0 GB)",
    description: "批次 BATCH-20250412-086 在执行 1080x1920 60FPS 双参考帧扩散时发生显存峰值告警。",
    timestamp: "09:30:15",
    resolved: false,
    recommendation: "建议开启 FP8 权重缓存或降低 Batch Concurrent 并发数至 1。",
    actionLabel: "一键整理显存碎片",
  },
  {
    id: "ALARM-0412-02",
    level: "info",
    title: "NVMe 临时缓存目录达到 142 GB (容量警戒线 160 GB)",
    description: "历史生成临时帧切片与音频特征缓存累计较多，建议执行清理。",
    timestamp: "08:45:00",
    resolved: false,
    recommendation: "点击一键清空超过 24h 的中间评估缓存，预计释放 98 GB。",
    actionLabel: "一键清理临时缓存",
  },
];

/** 演示快照（四表均顶层冻结 + 逐项浅拷贝；嵌套引用与 RAW 共享，禁止就地修改） */
export const INITIAL_LOGS: readonly LogEntry[] = Object.freeze(RAW_LOGS.map((l) => ({ ...l })));

export const OPS_METRICS: readonly OpsMetric[] = Object.freeze(RAW_METRICS.map((m) => ({ ...m })));

export const SERVICES_LIST: readonly ServiceStatus[] = Object.freeze(
  RAW_SERVICES.map((s) => ({ ...s })),
);

export const SYSTEM_ALARMS: readonly AlarmItem[] = Object.freeze(RAW_ALARMS.map((a) => ({ ...a })));

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
