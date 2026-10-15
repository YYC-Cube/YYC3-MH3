---
file: docs/06-Registry-API-契约.md
description: 本地 Registry API 契约（active · 已实现）— 本地 BFF 最小面
author: "YanYuCloudCube Team <admin@0379.email>"
version: v1.1.0
created: 2026-10-11
updated: 2026-10-12
status: active
tags: [YYC3, 契约, Registry, API]
category: policy
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 📡 Registry API 契约（active）

## 0. 实现状态声明

> **本契约当前状态：active（已实现）—— PR-10 ~ PR-12 全部交付：BFF 服务端八端点（M5）+ adapters/local 前端接入（M6）+ 告警写路径贯通与验收收口（M7）。**

| 项 | 值 |
| -- | -- |
| 服务端实现 | ✅ PR-10（2026-10-12）：[server/registryApi.ts](../server/registryApi.ts) 纯函数处理器 + Vite dev server 中间件桥接（`yyc3-registry-api` 插件，apply:"serve" 构建零泄漏），23 例契约测试常驻 |
| 前端接入 | ✅ PR-11/12（2026-10-12）：[src/adapters/local](../src/adapters/local/http.ts) 四文件（三读供数 + `resolveAlarm` 处置写路径），OpsMonitorView `handleFixAlarm` 经端口消费闭环（`useOpsTelemetry` 透传） |
| 降级默认通道 | `adapters/memory`（内存快照，断网默认；告警表持进程内处置态） |
| 目标形态 | 本地进程 BFF（API 面回环 only，**永不暴露公网**），前端经端口-适配器接入 |
| 端口来源 | `PORT` 环境变量（与 Vite dev server 同源配置，见 `.env.example`） |

**契约纪律**：实现时以本文档为准；任何字段/端点变更必须**先改本文档（版本 +1）再改实现**。前端禁止出现硬编码端点（URL 一律经 `NEXT_PUBLIC_*` 环境变量注入）。

> **Next.js 16 迁移补记（P4，2026-10-15）**
>
> | 项 | Vite 形态（原） | Next 16 形态（现） |
> | -- | -- | -- |
> | BFF 薄壳 | `vite.config.ts` 内 `yyc3-registry-api` 插件（middleware 桥接，apply:"serve"） | [server/routeHandler.ts](../server/routeHandler.ts) Web 标准 `Request → Response` 薄壳（框架无关，118 例中 6 例 HTTP 语义常驻） |
> | 挂载方式 | dev server 中间件（`configureServer`） | **Track A（Node 运行时轨）启用时**：`app/api/[...registry]/route.ts` 三行转发 `handleWebRequest`；**Track B（静态导出，当前轨）与 API Route 互斥**（05 清单 §3.2），dev 无桥接 → local 适配器 404 → `not_found` → memory 降级（降级状态机既有机能，无白屏） |
> | 端口来源 | `PORT`（Vite define 注入 `VITE_APP_PORT`） | `PORT`（`next dev -p`）；前端 `NEXT_PUBLIC_APP_PORT` / `NEXT_PUBLIC_REGISTRY_BASE_URL` 环境变量注入 |
> | 回环校验 | 同 | 不变（`registryApi.handleRequest` 内部 Host 校验，薄壳透传 Host 头） |

## 1. 设计原则

1. **本地回环 only**：API 面仅接受回环访问（宿主绑定 `0.0.0.0` 属 Figma 宿主约束，`/api` 面以 Host 校验等价收紧，非回环一律 403）；禁止对公网暴露
2. **资源形状 = 现有类型**：响应体字段严格复用 [src/types/index.ts](../src/types/index.ts) 已有类型，不发明新字段
3. **离线降级**：前端适配器请求失败时自动回退 memory 快照（断网可用是验收项）
4. **无外部依赖**：不代理任何公网服务（无 AI API、无图床、无第三方 webhook）

## 2. 端点面（最小面，已实现）

统一前缀：`http://127.0.0.1:${PORT}/api`

| # | 方法与路径 | 响应体（现有类型） | 语义 | 对应现行 mock |
| -- | ---------- | ------------------ | ---- | ---- |
| 1 | `GET /health` | `{ status: "online"\|"warning"\|"offline", uptime: string }` | BFF 自身存活 | — |
| 2 | `GET /services` | `ServiceStatus[]` | 本地服务注册表（真实探测替代演示快照） | `SERVICES_LIST` |
| 3 | `GET /metrics?from=&to=` | `OpsMetric[]` | 资源时序采样 | `OPS_METRICS` |
| 4 | `GET /alarms?resolved=` | `AlarmItem[]` | 告警列表 | `SYSTEM_ALARMS` |
| 5 | `PATCH /alarms/:id` | `AlarmItem` | 置 `resolved` 状态（请求体 `{ resolved: boolean }`） | OpsMonitorView 处置动作 |
| 6 | `GET /logs?stage=&level=` | `LogEntry[]` | 终端日志流（后续可升级 SSE） | `INITIAL_LOGS` |
| 7 | `GET /batches` / `GET /batches/:id` | `BatchItem` / `BatchItem[]` | 批次仓储 | `INITIAL_BATCHES` |
| 8 | `GET /seeds` / `POST /seeds` | `SeedItem` / `SeedItem[]` | 种子仓储（采纳回写） | `INITIAL_SEEDS` |

**错误约定**：非 2xx 时返回 `{ error: { code: string, message: string } }`；前端适配器据此走降级分支，不向 UI 泄露内部细节。

**404 细化（v1.0.1 定稿，v1.1.0 扩展）**：`:id` 路径（#7 `GET /batches/:id` 读、#5 `PATCH /alarms/:id` 未命中）的 404 为**业务空值**（权威快照的确定性答案）——适配器消化为 `null`，不触发降级留痕；其余非 2xx / 网络错误 / 超时（>3s）触发降级。

## 3. 端点明细与示例

### 3.1 GET /services → ServiceStatus[]

```json
[
  {
    "serviceId": "srv-diffsynth-worker",
    "name": "DiffSynth 推理引擎 (CUDA:0)",
    "port": 9100,
    "status": "online",
    "uptime": "14天 06:22",
    "pids": 4,
    "memory": "18.4 GB",
    "stabilityHistory": [100, 100, 99.2, 100, 100, 98.7, 100]
  }
]
```

字段语义见 [05-监控告警与Runbook §4](05-监控告警与Runbook.md)。

### 3.2 GET /alarms?resolved=false → AlarmItem[]

```json
[
  {
    "id": "ALARM-0412-01",
    "level": "warning",
    "title": "显存预警：瞬时 VRAM 达到 22.8 GB (阈值 22.0 GB)",
    "description": "…",
    "timestamp": "09:30:15",
    "resolved": false,
    "recommendation": "建议开启 FP8 权重缓存或降低 Batch Concurrent 并发数至 1。",
    "actionLabel": "一键整理显存碎片"
  }
]
```

### 3.3 GET /metrics?from=09:00&to=10:00 → OpsMetric[]

```json
[
  { "time": "09:30", "gpuVram": 22.8, "gpuUtil": 97, "cpuUtil": 41, "memUtil": 31.2, "diskIops": 850, "temp": 71 }
]
```

## 4. 前端接入契约（端口-适配器，已实现）

```
src/domains/ops/ports.ts       ← TelemetryPort（四读 + appendLog + resolveAlarm，06 §2 #5 端口面）
src/adapters/local/            ← 本适配器：fetch Registry API（URL 经 env 注入）
src/adapters/memory/           ← 降级适配器：内存快照（断网默认）
src/app/composition.ts         ← 组合根：dev → local（内置降级），静态/测试 → memory
```

降级触发条件：网络错误 / 非 2xx / 超时（>3s）。降级与恢复事件必须经 TelemetryPort 留痕（Runbook §3.3 留痕要求）。

**接入细化（v1.0.1 定稿）**：

- 遥测端口中 `listLogs` / `appendLog` 走**本地留痕通道**（适配器内部 memory 实例，保证降级/恢复与处置条目强一致可见）；`GET /logs` 端点保留给真实采集阶段（后续可升级 SSE），local 适配器暂不消费
- `SeedRepository.getById`：契约未定义 `GET /seeds/:id`，local 适配器经 `GET /seeds` 列表本地查找消化（不虚构端点）
- 降级/恢复留痕采用**状态翻转**口径：healthy ↔ degraded 各留痕一次，降级期间重复失败不重复留痕（优于按次去重）
- 组合根装配：`import.meta.env.DEV` 且非测试环境 → local（内置 per-call 降级）；静态构建 / preview → memory 直连
- `TelemetryPort.resolveAlarm`（v1.1.0）：`PATCH /alarms/:id`（body `{ resolved: true }`）——命中返回翻转后 `AlarmItem` 副本；404 → `null`（业务空值，不留痕）；其余失败回退 `memory.resolveAlarm` 兜底落账。视图侧 `OpsMonitorView.handleFixAlarm` 成功翻转本地态 / 空值 warning toast / 异常 error toast

## 5. 环境变量契约

见 [.env.example](../.env.example)。前端可消费项仅限 `VITE_` 前缀；BFF 端口单一来源为 `PORT`（构建期经 vite `define` 注入 `import.meta.env.VITE_APP_PORT`，避免双源漂移）。

## 6. 验收清单（PR-12 逐项勾选，M7 达成）

- [x] BFF 仅监听 `127.0.0.1`（实现口径：API 面回环 only —— Host 校验，见 §1）——**证据**：非回环 Host 请求 403 实测（PR-10）+ `server/registryApi.test.ts` isLoopbackHost 用例常驻
- [x] 全部端点响应字段与 §2 表格及 `src/types/index.ts` 逐字段一致 ——**证据**：`server/registryApi.test.ts` 23 例 `toEqual` 断言 + `adapters.local.test.ts` 响应体断言，字段漂移即红
- [x] 断网（拔线/DevTools offline）时前端自动回退 memory 快照，无白屏 ——**证据**：`adapters.local.test.ts` 三触发降级覆盖（网络错 / 非 2xx / 超时，fetch reject ≡ DevTools offline）+ `useOpsTelemetry` 同步快照引导零空态
- [x] 零公网出站请求（含字体/图片/CDN）——**证据**：`offline-guard.test.ts` 2 例常驻门禁（PR-1 起持续全绿）
- [x] OpenAPI/类型由本文档驱动，字段漂移在 CI 拦截 ——**证据（范围裁量，如实标注）**：以 **types 类型断言测试**为等价落地（server `toEqual` + local 响应断言，vitest 门禁拦截漂移）；OpenAPI 文档生成列 P3 预研，不在本排期

## 变更历史

| 版本   | 日期       | 变更内容                               | 作者                |
| ------ | ---------- | -------------------------------------- | ------------------- |
| v1.1.0 | 2026-10-12 | 契约收口（PR-12 / M7）：status draft→active；§0 实现状态更新（PR-10~12 全交付）；§2 404 细化扩展至 #5 PATCH /alarms/:id；§4 接入细化补 resolveAlarm 语义；§6 五项逐项勾选附证据 | YanYuCloudCube Team |
| v1.0.1 | 2026-10-12 | 404-on-:id 业务空值细化 + 接入细化（listLogs 本地留痕通道 / seeds getById 列表消化 / 状态翻转留痕 / D6 装配）；§0 实现状态更新（PR-10 已交付） | YanYuCloudCube Team |
| v1.0.0 | 2026-10-11 | 契约草案创建（未实现，最小面定义）     | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

**© 2025-2026 YanYuCloudCube™. All Rights Reserved.**

</div>
