---
file: docs/05-监控告警与Runbook.md
description: MiniMax-H3 本地生产线监控告警字段字典与应急响应手册（逆向沉淀版）
author: YanYuCloudCube Team <admin@0379.email>
version: v1.2.0
created: 2026-10-11
updated: 2026-10-12
status: active
tags: [YYC3],[契约],[监控],[Runbook]
category: policy
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 🚨 监控告警与 Runbook

## 0. 文档性质与数据来源声明

> **本契约由现有代码逆向沉淀，字段以代码为准，未新增任何虚构字段。**

| 项 | 值 |
| -- | -- |
| 类型定义唯一来源 | [src/types/index.ts](../src/types/index.ts)（`AlarmItem` / `ServiceStatus` / `OpsMetric` / `LogEntry` / `NotificationItem`） |
| 当前数据源 | [src/data/ops.ts](../src/data/ops.ts)（`SYSTEM_ALARMS` / `SERVICES_LIST` / `OPS_METRICS` / `INITIAL_LOGS`）· **内存演示快照，非真实采集** |
| 采集实现状态 | ❌ 未实现（无 agent、无 BFF、无网络调用；全库零 `fetch`）。PR-9 已落地 `TelemetryPort` 出站端口（[src/domains/ops/ports.ts](../src/domains/ops/ports.ts)）+ memory 适配器供数（[src/adapters/memory/telemetryRepository.ts](../src/adapters/memory/telemetryRepository.ts)），async 签名为真实采集适配器预留 |
| 展示视图 | OpsMonitorView / Topbar 通知中心 / Workbench 终端日志面板（经 `useOpsTelemetry` 端口水合消费，视图零数据 import） |

**红线**：本文档字段与 `src/types/index.ts` 不一致时，**以代码为准并立即修订本文档**；新增字段必须先改本文档、再改类型、最后改实现（文档闭环）。

## 1. 告警字段字典（AlarmItem）

来源：[src/types/index.ts](../src/types/index.ts) `AlarmItem`

| 字段 | 类型 | 必填 | 语义 |
| ---- | ---- | ---- | ---- |
| `id` | string | ✅ | 告警唯一标识，现行格式 `ALARM-{MMDD}-{序号}`（如 `ALARM-0412-01`） |
| `level` | `"critical" \| "warning" \| "info"` | ✅ | 告警级别，三档，语义见 §2 |
| `title` | string | ✅ | 单行摘要（现行样例含触发值与阈值，如「瞬时 VRAM 达到 22.8 GB (阈值 22.0 GB)」） |
| `description` | string | ✅ | 上下文详情（涉及批次、发生场景） |
| `timestamp` | string | ✅ | 时间戳（现行 mock 为 `HH:mm:ss`） |
| `resolved` | boolean | ✅ | 处置状态 |
| `recommendation` | string | ✅ | 处置建议文案（Runbook §3 的快速建议入口） |
| `actionLabel?` | string | ❌ | 一键处置动作的按钮文案（如「一键整理显存碎片」），无值则仅展示建议 |

## 2. 告警级别语义

| 级别 | 语义 | 响应时限（约定） | 通知渠道 |
| ---- | ---- | ---- | ---- |
| `critical` | 生产中断或数据风险：推理失败、显存溢出崩溃、种子库损坏 | 立即 | Topbar 通知中心（`NotificationItem.type="alarm"`）+ 终端日志 `level="error"` |
| `warning` | 逼近阈值但未中断：显存峰值预警、缓存容量警戒 | 当批次结束内 | Topbar 通知中心 + 日志 `level="warn"` |
| `info` | 提示性维护事项：临时缓存清理建议、快照完成 | 例行巡检 | 通知中心 + 日志 `level="info"` |

> 时限为本 Runbook 约定（当前无自动升级/值班系统），采集实现落地后应转化为告警规则配置。

## 3. 应急处置 Runbook

处置入口统一为告警卡片的 `recommendation` 文案与 `actionLabel` 动作按钮。现行演示快照中的两例（源自 `SYSTEM_ALARMS`）：

### 3.1 显存峰值预警（level=warning）

- **现象**：`title` 报告瞬时 VRAM 超阈值（样例 22.8 GB / 阈值 22.0 GB，RTX 4090 24GB）
- **风险**：后续批次 OOM 崩溃（`critical` 升级）
- **处置**：① 降低 Batch Concurrent 至 1；② 开启 FP8 权重缓存；③ 点击 `actionLabel`「一键整理显存碎片」
- **验证**：OpsMonitorView `OpsMetric.gpuVram` 回落至阈值内；`gpuUtil` 无持续 100%

### 3.2 NVMe 临时缓存容量警戒（level=info）

- **现象**：缓存目录逼近容量警戒线（样例 142 GB / 警戒 160 GB）
- **处置**：执行 `actionLabel`「一键清理临时缓存」，清理超过 24h 的中间评估缓存
- **验证**：`OpsMetric.diskIops` 恢复常态；`NotificationItem` 对告警标记 `resolved=true`

### 3.3 通用流程（所有级别）

```
发现告警（通知中心/运维视图）
  → 读 level 定级（§2 响应时限）
  → 读 description 定位批次/场景
  → 按 recommendation 处置，优先使用 actionLabel 一键动作
  → 验证 OpsMetric 指标回落
  → 置 resolved=true，LogEntry 留痕（stage + suggestion）
```

> PR-9 交付后，上表「LogEntry 留痕」环节已具备端口承载：`TelemetryPort.appendLog(entry)` 为降级/恢复事件的写入口（memory 适配器前置写入演示快照），真实采集适配器落地后映射至日志管道。

## 4. 服务状态字段字典（ServiceStatus）

来源：[src/types/index.ts](../src/types/index.ts) `ServiceStatus`

| 字段 | 类型 | 语义 |
| ---- | ---- | ---- |
| `name` / `serviceId` | string | 展示名 / 稳定标识（`srv-*`） |
| `port?` | number | 本地监听端口（❗现行 `SERVICES_LIST` 含「本地遥测聚合服务 :8443」等条目为**演示快照，非真实探测结果**，真实服务注册待 Registry API 落地，见 [06](06-Registry-API-契约.md)） |
| `status` | `"online" \| "warning" \| "offline"` | 三态健康 |
| `uptime` / `pids` / `memory` | string / number / string | 运行时长 / 进程数 / 内存占用 |
| `stabilityHistory?` | number[] | 近 7 天稳定率（%） |

## 5. 资源指标字段字典（OpsMetric）

来源：[src/types/index.ts](../src/types/index.ts) `OpsMetric`（时序采样，现行 `OPS_METRICS` 为演示曲线）

| 字段 | 单位 | 语义 |
| ---- | ---- | ---- |
| `time` | — | 采样时间 |
| `gpuVram` | GB | 显存占用（峰值告警来源，§3.1） |
| `gpuUtil` / `cpuUtil` | % | GPU / CPU 利用率 |
| `memUtil` | GB | 系统内存占用 |
| `diskIops` | MB/s | 磁盘吞吐 |
| `temp` | °C | 温度 |

## 6. 日志与通知契约（LogEntry / NotificationItem）

- `LogEntry`：`level`(info|warn|error|success) + `stage` + `message` + `suggestion?` + `actionable?{actionLabel, actionType}` —— 处置留痕与工作台终端面板的数据源
- `NotificationItem`：`type`(alarm|completed|system) + `read` + `targetTab?`/`targetId?` —— 通知中心跳转契约（运行时 UI 态，不纳入 `TelemetryPort`）

## 7. 演进路线（与迁移计划对齐）

| 里程碑 | 内容 |
| ------ | ---- |
| 现状 | 类型契约 ✅ / 演示快照 ✅ / 真实采集 ❌ |
| PR-9（TelemetryPort） | ✅ 已交付（2026-10-12）：[src/domains/ops/ports.ts](../src/domains/ops/ports.ts) 定义 `TelemetryPort`（services/metrics/alarms/logs 四读 + `appendLog` 处置留痕，承接 §3.3）；memory 适配器消费本文档事件表快照（深拷贝出借）；UI 经 `useOpsTelemetry` 端口水合，OpsMonitorView/WorkbenchView/DesignSystemView 零数据 import |
| PR-10~12（Registry API 本地 BFF） | ✅ 已交付（2026-10-12）：BFF 八端点（[06 契约 v1.1.0 active](06-Registry-API-契约.md)）+ `adapters/local` 接入（三读供数 + 三触发降级回退 memory + 降级/恢复留痕）+ `resolveAlarm` 处置写路径贯通（OpsMonitorView `handleFixAlarm` 经端口消费，成功翻转 / 空值 warning / 异常 error toast）；[06 §6](06-Registry-API-契约.md) 五项验收全勾（M7） |
| Registry API 已落地 | `ServiceStatus`/`OpsMetric`/`AlarmItem` 已由 [06 契约](06-Registry-API-契约.md) 端点供数（dev 经 local 适配器，断网自动回退 memory；适配器替换仅组合根 [src/app/composition.ts](../src/app/composition.ts) 单点），本文档降为语义与处置手册；真实采集（服务探测/指标采样接入实际进程）为后续演进 |

## 变更历史

| 版本   | 日期       | 变更内容                                                                                                     | 作者                |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| v1.2.0 | 2026-10-12 | PR-12 收口：§7 演进路线更新（PR-10~12 Registry BFF 全交付 + Registry API 已落地降为语义与处置手册，真实采集为后续演进） | YanYuCloudCube Team |
| v1.1.0 | 2026-10-12 | PR-9 收官：§0 数据源勘误（mockData.ts→ops.ts，修 PR-5 文档债）+ §3.3/§7 appendLog 留痕与里程碑标✅ + §4/§6 服务名与端口边界真实化 | YanYuCloudCube Team |
| v1.0.0 | 2026-10-11 | 由 src/types/index.ts 逆向沉淀创建                                                                           | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

**© 2025-2026 YanYuCloudCube™. All Rights Reserved.**

</div>
