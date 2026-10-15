---
file: 04-Registry真实采集可行性预研.md
description: YYC3-MH3 Registry 真实采集可行性预研 - 智能应用落地专家 - 2026-10-12
author: "AI Tutor <Intelligent Implementation Expert>"
version: v1.0.0
created: 2026-10-12
updated: 2026-10-12
status: active
tags: [research, registry, collector, feasibility]
category: report
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 🔬 Registry 真实采集可行性预研报告

## 一、预研背景与目标

| 项 | 值 |
| -- | -- |
| 触发 | 03 总结 v2.8.0 TOP3 P1（阶段三 PR-12 收官后的后续候选） |
| 目标 | 论证 [server/registryApi.ts](../../server/registryApi.ts) 从「演示快照语义」升级为「真实采集语义」的可行性边界，产出数据源矩阵、架构设计与排期建议 |
| 约束 | **零新增 npm 依赖**（D 系决策延续）；宿主 macOS（Apple Silicon）免 sudo；前端端口-适配器**零改动** |
| 方法 | 取证（处理器/数据形状）+ Node 内置能力分组实证（不盲猜，逐项跑通） |

## 二、现状取证

- **处理器数据流**：`createRegistryApi()` 以 `src/data/ops.ts` 演示快照为引导态（D3 演示语义），`GET /services`、`GET /metrics`、`GET /logs` 直出静态快照；alarms/seeds 闭包可变
- **探测目标形状**（05 Runbook §4/§5 字段语义）：
  - `ServiceStatus`：serviceId / name / **port** / status / uptime / pids / memory / stabilityHistory
  - `OpsMetric`：time / **gpuVram / gpuUtil** / cpuUtil / memUtil / **diskIops** / temp
- **宿主环境实证**：darwin / arm64 / Apple M4 Max / 16 核 / Node v22.22.3

## 三、数据源矩阵（实证结论）

### 3.1 OpsMetric 字段

| 字段 | 数据源（零依赖） | 实证结果 | 可行性 |
| ---- | ---- | ---- | ---- |
| cpuUtil | `os.cpus()` 双采样差分（busy delta / total delta） | 16 核 model 可得 | ✅ 可采 |
| memUtil | `(os.totalmem() - os.freemem()) / os.totalmem()` | 128GB total / free 实时可得 | ✅ 可采 |
| gpuUtil | `ioreg -r -d 1 -w 0 -c IOAccelerator` → PerformanceStatistics `"Device Utilization %"` | **免 sudo 实证可得**（空闲时 0） | ✅ 可采（关键发现） |
| gpuVram | 同上 → `"In use system memory"`（字节） | 实证 1.9GB（Apple Silicon 统一内存 GPU 占用语义，换算 GB） | ✅ 可采 |
| diskIops | `iostat -c 2 disk0` 第二行 `tps` | 实证 609/15 tps，免 sudo | ✅ 可采 |
| temp | `powermetrics`（macOS 唯一官方传感器通道） | **实证：must be invoked as the superuser** | ❌ 保留演示语义（零依赖约束下无免 sudo 替代） |

> **GPU 免 sudo 可采为本预研关键发现**：`ioreg` 用户空间即可读取 IOAccelerator 的 GPU 利用率与统一内存占用，突破「GPU 指标必须 sudo」的预设。

### 3.2 ServiceStatus 探测

| 能力 | 数据源 | 实证结果 | 可行性 |
| ---- | ---- | ---- | ---- |
| 端口存活 | `node:net` connect + 800ms 超时 | `8443:OPEN`（Vite 自身）/ `9100:closed`（演示服务） | ✅ 探测机制可行 |
| 进程详情（pids/RSS） | `ps -Ao pcpu,rss,etime,comm` 按 comm 匹配 | node 进程可得（RSS 列在部分场景显示 0，SIP 相关） | ⚠️ 可用但建议 `lsof -i :PORT` 增强 |
| uptime / stabilityHistory | 采样环累积（进程内持久） | 探测开启时刻起算 | ✅ 可采（冷启动归零，如实标注） |
| **目标服务存在性** | — | 本机并无 DiffSynth/存储网关等真实服务 | ⚠️ **探测结果将为全 offline**（语义影响见 §四） |

### 3.3 LogEntry

| 能力 | 结论 |
| ---- | ---- |
| 真实日志流 | ❌ 当前无产生源（无真实生成进程可订阅）；`GET /logs` 保留演示快照 + 前端本地留痕通道（06 §4 v1.0.1 既定），不在本预研范围 |

## 四、语义设计：混合模式（真实可采 + 演示保底）

直接切换真实采集会导致：服务全 offline / temp 空 / 演示叙事断裂。预研结论为**混合语义**（按字段分级）：

| 级别 | 字段 | 语义 |
| ---- | ---- | ---- |
| L1 真实 | cpuUtil / memUtil / gpuUtil / gpuVram / diskIops | 真实采样值直出 |
| L2 演示保底 | temp / 服务表 | 探测全 offline 时回退演示快照（保持 UI 演示完整性）；探测到真实服务则真实值优先 |
| L3 不变 | alarms / logs / batches / seeds | 维持 D3 演示 + 留痕语义 |

## 五、架构设计建议（PR-13/14 预排）

```
server/
├── registryApi.ts        ← createRegistryApi(options?: { collector?: Collector })
└── collector.ts          ← 新增：createCollector(config) 框架无关采集器
    ├── sampleMetrics()   os.cpus 差分 / ioreg GPU / iostat tps（懒采样）
    ├── probeServices()   net.connect 并发探测 + lsof 增强（可选）
    └── snapshot()        环形缓冲（metrics 默认保留 24h×5min 粒度）
vite.config.ts            ← dev 场景 createCollector() 注入 + 可选 10s 刷新（或端点拉取时懒采样）
```

- **懒采样优先**（推荐）：`GET /metrics` 被拉取时按需采样（iostat ~100ms / ioreg ~50ms），避免后台循环常驻开销；环形缓冲跨拉取累积
- **守卫回退**：ioreg 键面随 macOS 版本可能漂移 → 解析守卫 + 回退演示值（L2 口径），绝不让采集失败冒泡到前端（前端降级机制之外的服务端第一道防线）
- **前端零改动**：local 适配器无感供数，端口-适配器架构红利直接兑现

## 六、风险登记

| 风险 | 等级 | 缓解 |
| ---- | ---- | ---- |
| ioreg 键面随 macOS 版本漂移 | 中 | 解析守卫 + L2 演示回退 + 契约测试锁字段形状 |
| 子进程 spawn 开销（高频拉取） | 低 | 懒采样 + 环形缓冲去重（同分钟窗口复用） |
| darwin-only（Windows/Linux 不支持） | 中 | 预研范围如实标注；collector 以 platform 守卫，非 darwin 回退演示语义 |
| 探测全 offline 影响演示叙事 | 低 | L2 混合语义（演示保底）+ env 开关（REGISTRY_COLLECTOR=off） |

## 七、排期建议

| PR | 内容 | 验收 |
| -- | ---- | ---- |
| PR-13 | `server/collector.ts` 采集器（L1 五字段真实采样 + L2 回退守卫 + 环形缓冲）+ `createRegistryApi` options 消费 + 测试先行（真实值断言 / 守卫回退断言 / 键面漂移模拟） | metrics 端点实测真实值 / 采集失败回退演示值不冒泡 |
| PR-14 | 06 契约 v1.2.0（§3 数据源声明：L1/L2/L3 分级 + darwin-only 标注）+ 05 Runbook 真实采集章节 + vite 注入 + 文档收口 | 契约先行落盘 / 前端零改动验证 / 门禁全绿 |

**依赖**：无（零新增 npm 依赖，Node 22 内置 + darwin 系统命令）。

## 八、预研结论

> **可行，且优于预期**：L1 五字段（含 GPU 利用率与显存——免 sudo ioreg 路径）可零依赖真实采集；temp 与真实日志流受系统权限/产生源限制保留演示语义；以混合语义 + 懒采样 + 守卫回退落地，前端零改动。建议按 PR-13/14 排入阶段四。

---

## 变更历史

| 版本   | 日期       | 变更内容                               | 作者                |
| ------ | ---------- | -------------------------------------- | ------------------- |
| v1.0.0 | 2026-10-12 | 预研报告创建（四组实证 + 数据源矩阵 + 混合语义架构 + PR-13/14 排期建议） | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

**© 2025-2026 YanYuCloudCube™. All Rights Reserved.**

</div>
