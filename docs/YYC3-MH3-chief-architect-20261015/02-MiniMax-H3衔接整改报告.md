---
file: 02-MiniMax-H3衔接整改报告.md
description: YYC3-MH3 ↔ YYC3-MiniMax-H3 衔接与整改实施方案 - 首席架构师会话 - 2026-10-15
author: "Chief Architect <YanYuCloudCube Team>"
version: v1.0.0
created: 2026-10-15
updated: 2026-10-15
status: active
tags: [integration, remediation, roadmap, contract, local-first, observability]
category: report
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*

---

# 🌉 YYC3-MH3 ↔ YYC3-MiniMax-H3 衔接与整改报告

> **前置阅读**：同会话《01-MH3架构分析报告》（本文所有编号 D-x 缺陷、映射表均出自该报告）
> **性质**：可执行整改方案——每项含验收标准（DoD），按四阶段路线图编排

---

## 一、北极星目标与四原则

**北极星**：一个产品、两级形态——

- **`mh3.yyc3.top`（公网 Pages）**：只读生产线橱窗，展示真实批次/种子/指标**快照**，零密钥零后端；
- **本地运行的本仓工作台**：全功能控制面——实时指标、五步流水线调度、人工精评、种子采纳回写，直连 monorepo 引擎。

**四原则（全程不可违背）**：

1. **契约先行**：`@yyc3/manifest-schema`（zod）为两仓唯一数据契约真源，禁止再手写平行类型；
2. **零公网红线不破**：本仓 offline-guard 测试门禁保留；公网页面永不携带令牌、永不直连本地服务；
3. **不破坏正在运转的生产线**：monorepo 引擎/BFF/看门狗改动最小化，先加只读通道，后动控制面；
4. **诚实 UI**：所有「演示语义」必须显式标注，虚假文案（IndexedDB/SSE/CUDA）一律清除或落实。

---

## 二、双前端职责决策（架构裁决）

**问题**：本仓 Workbench 与 monorepo `apps/console` 双前端并存、职责未定。

| 方案 | 内容 | 评估 |
| --- | --- | --- |
| A. 本仓立即取代 console | 把 console 全部功能搬入本仓 | ❌ 高风险：SSE/管线 spawn/分镜闸门搬迁期间生产线裸奔 |
| B. 分工并存：本仓=公网橱窗+展示，console=本地运维台 | 零改动划清边界 | ✅ 短期最优，但长期双份领域代码漂移 |
| C. **本仓为唯一前端（目标态），console 渐进退役** | 本仓按 S1→S3 补齐能力，逐视图接管，console 冻结只修不增 | ✅ **推荐**：本仓骨架（Vite 8/顶格 TS/110 测试/六边形）明显更优，console 的**集成逻辑**（pipeline-manager、SSE、分镜闸门）以适配器形式移植，而非保留双壳 |

**裁决**：**短期执行 B，中期演进到 C**。本仓补齐 `BFF 适配器 + SSE + 持久化 + 可观测`四块后接管；console 于 S3 冻结（保留为回退通道一个版本周期）。

---

## 三、契约对齐方案（一切衔接的第一块砖）

### 3.1 引入 manifest-schema

- 本仓以 **npm workspace 不可达 → git subtree/vendor 方式**引入 `@yyc3/manifest-schema`（推荐 `vendor/manifest-schema/` 子树同步 + CI 脚本 `check_contract_sync`，monorepo 已有同名门禁脚本可复用思路）；
- `src/types/index.ts` 中与批次/种子相关的类型改为 **由 schema 派生**（`z.infer`），`SeedItem`/`BatchItem` 保留为视图模型（VM），新增纯函数 `mapManifestRecordToSeed()` / `mapBatchesJsonToBatchItem()` 完成「契约 → VM」映射，映射放 `domains/` 层并可测。

### 3.2 字段映射表（首版，S0 交付物）

| 契约字段（manifest/batches.json） | 本仓 VM | 转换规则 |
| --- | --- | --- |
| `batches[].id` (int) | `BatchItem.id` (string) | `batch-` 前缀或原样 toString |
| `batches[].status` 五态机 | `BatchItem.status` | 状态枚举直接对齐（补 `partial/reconciled` 两态） |
| `records[].seed` / `params` | `SeedItem.params` 五参数 | guidanceScale/steps 等按 manifest params 透传，缺省取本仓默认 |
| `records[].lipsync.score_norm` | 质检分（0-1 → 0-10） | ×10 保留两位 |
| `records[].human.score` | `fine_eval` 输入 | null → 「待评」态 |
| `records[].gen_seconds/peak_rss_gb/mps_alloc_gb` | `OpsMetric`/耗时面板 | 性能三件套直显 |
| `records[].reason`（七值枚举） | 失败标签 | 状态机 + 缺陷标签映射 |

---

## 四、YYC3-MH3 整改清单

### P0（诚实性与定向，本周内，纯本仓可完成）

| 编号 | 整改项 | DoD 验收标准 |
| --- | --- | --- |
| R-1 | **清除虚假文案**（D-2）：IndexedDB/WAL 假陈述、SSE/CUDA 假状态、9100 假服务表 | 全库 grep `IndexedDB|WAL|CUDA|RTX` 仅剩「规划中（ROADMAP）」显式标注；新增 vitest 用例锁文案诚实性（复用 offline-guard 静态扫描思路） |
| R-2 | **README/定位声明**：讲清本仓与 `YYC3-MiniMax-H3` 的关系（壳/发动机）、目标态两级形态 | README 增「架构关系」一节 + monorepo 仓库链接；两仓互链（配合对仓 T-2） |
| R-3 | **演示语义开关**：`import.meta.env` 引入 `DEMO_MODE` 显式开关，默认开启并全站标注「演示数据」徽标 | 关闭 DEMO_MODE 且无后端时 UI 呈现空态引导（而非假数据），有快照时呈现快照来源标识 |

### P1（真实数据通道 + 拥有性，S1-S2 交付）

| 编号 | 整改项 | DoD 验收标准 |
| --- | --- | --- |
| R-4 | **快照桥（只读）**：新增 `adapters/snapshot/`——构建期或 dev 期拉取 `dashboard/data/batches.json`（本地路径读取 / 构建时拷贝入 `public/snapshots/`），经契约映射喂 `BatchRepository` | mh3.yyc3.top 展示真实 24 批次历史；快照 `generated_at` 显式展示 |
| R-5 | **IndexedDB 持久化**（D-3）：种子库 + 全局配置 + 采纳历史落 `idb`（评估零依赖手写或 1 个依赖），`adapters/` 新增 idb 实现并在组合根按能力装配 | 刷新后种子/配置保留；SettingsView 文案由假转真；离线守卫测试仍全绿 |
| R-6 | **导入导出**：种子库 JSON 导出/导入（对齐 `update_seed_list` 的种子清单格式，为 R-11 回写铺路） | 导出文件可直接被 monorepo `update_seed_list.py` 消费（字段对齐验证） |
| R-7 | **Registry 真实采集 collector**（D-1 局部）：按预研 §四混合语义实现 `createRegistryApi({collector})`——L1 真实采（`os.cpus` 差分 / `ioreg` gpuUtil+gpuVram / `iostat` diskIops）、L2 探测保底（`node:net` 探 3030/8300 端口，探到即真实服务表）、L3 演示不变 | dev 模式打开 OpsMonitor 看到本机真实 CPU/GPU/磁盘曲线；服务表探测结果如实标注 offline/online |
| R-8 | **前端可观测性最小闭环**（D-4）：ErrorBoundary 包根 + `window.onerror`/`unhandledrejection` 钩子 → 结构化 JSONL 内存环形缓冲 → 经 `TelemetryPort.appendLog` 进日志面板 + IndexedDB 持久化 + 一键导出 | 人为抛错在 OpsMonitor 可见结构化记录；SW 更新失败不再静默 |

### P2（控制面接管，S3 交付）

| 编号 | 整改项 | DoD 验收标准 |
| --- | --- | --- |
| R-9 | **BFF 直连适配器**：dev/本地运行时 `adapters/local` 指向 monorepo console BFF（`/api/dashboard`、`/api/pipeline/*`、`/api/score`），经 `VITE_REGISTRY_BASE_URL` 注入，鉴权令牌走本机 `.env`（不入 git/不入公网构建） | 本仓工作台本地可看到 console 同源数据；零公网出站 |
| R-10 | **SSE 流接入**：消费 `/api/pipeline/stream` 四事件（state/log/file/heartbeat），替换 `setInterval` 模拟（D-5） | 触发一次 `--dry-run` 管线，Workbench 日志台滚动真实日志、五阶段随 state 事件推进 |
| R-11 | **精评与种子回写闭环**：批次精评视图写 `human.score` → 对接 `/api/storyboard/confirm` 或生成 `update_seed_list` 可消费清单 | 一次端到端：评 1 批 → 采纳 3 seed → monorepo 种子清单更新 |
| R-12 | **AI Family 从 canned 到编排**：`YYC3FamilyModal` 对话接 monorepo `/api/chat`（0379-World 网关，服务端持钥） | 提问真实经网关回答；网关不可达时明确降级提示 |

---

## 五、YYC3-MiniMax-H3 整改清单（对仓，最小化改动）

| 级 | 编号 | 整改项 | DoD |
| --- | --- | --- | --- |
| P0 | T-1 | **仓库收口**：README/batches.json 已修改未提交、删除文件待决断，提交或还原；README 目录树补 `apps/`+`packages/`、根 `package.json` description 去掉「Next.js 控制台」过时表述 | `git status` 干净；README 与实际结构一致 |
| P0 | T-2 | **互链声明**：README 增「公网橱窗 = YYC3-MH3（mh3.yyc3.top）」关系声明 | 两仓互链生效 |
| P1 | T-3 | **快照分发通道**：`export_dashboard_data.py` 增 `--out public/snapshots/batches.json` 目标（或建立同步脚本），使本仓公网构建可携带最新快照 | 本仓 Pages 部署后数据非 mock |
| P1 | T-4 | **卫生清理**：根目录 27×`output_batch*/` + 44×`report/analysis_*.md` 迁入 `runs/`（gitignore 追加）；删 `.safetensors.incomplete` 残留；`.idea/.mimosa/.v2c/.video_agent` 补 gitignore | 根目录仅剩工程文件；`git status` 不再出现新工具目录 |
| P2 | T-5 | **跨源 CORS 白名单**（仅当本仓前端直连 BFF 而非代理时）：console BFF 为 `localhost:3031`（本仓 dev）加 CORS 白名单 + 回环令牌发放 | 本仓 dev 跨端口访问 3030 BFF 成功 |
| P2 | T-6 | **统一可观测目录**：`watchdog_alerts/console_watch/audit_log` 三 JSONL 收敛到 `logs/observability/` + schema 版本字段 | 三流共用 `{"ts","kind","schema_version",...}` 骨架 |

---

## 六、目标态衔接架构

```
┌─ 公网（只读橱窗）─────────────────────────────┐
│  mh3.yyc3.top (GitHub Pages, 本仓静态构建)      │
│   └─ public/snapshots/batches.json ◄── T-3 定期导出（构建时注入）
│       零后端 · 零密钥 · 快照 generated_at 显式   │
└──────────────────────────────────────────────┘
                     ▲ 构建时单向快照流
═════════════════════╪══════ 本地优先边界 ═════════
                     │
┌─ 本地（全功能控制面）▼─────────────────────────┐
│  本仓工作台 (dev:3031 / PWA)                    │
│   ├─ adapters/snapshot  ← manifest/batches.json 文件契约
│   ├─ adapters/local     → console BFF :3030 /api/*（R-9）
│   │      └─ SSE /api/pipeline/stream（R-10）
│   ├─ collector(L1真实: ioreg/iostat/cpus)（R-7）
│   ├─ idb 持久化 + JSONL 可观测（R-5/R-8）
│   └─ registryApi BFF（dev only，回环 403 保留）
│                                                  │
│  YYC3-MiniMax-H3 monorepo                        │
│   ├─ console BFF(Hono:3030) ── spawn ──► pipeline_auto.py
│   ├─ agent 网关(FastAPI:8300) 三Agent+编排器
│   ├─ manifest.json ◄─ fs.watch 文件总线 ── 五步闭环引擎
│   └─ ~/.modelscopes/ 权重 72.5GB (M4 Max MPS)
└──────────────────────────────────────────────┘
```

**要点**：公网与本地之间**只有构建时单向快照流**，不存在任何运行时公网↔本地通道——这既是零公网红线的自然推论，也是数据主权的物理保证。

---

## 七、四阶段路线图

| 阶段 | 周期 | 内容 | 阶段 DoD（出口条件） |
| --- | --- | --- | --- |
| **S0 契约对齐 + 诚实化** | 1 周 | R-1/2/3 + T-1/2 + §3.1 契约引入与映射函数 | 虚假文案清零且有测试锁定；两仓互链；映射函数带单测；两仓 git status 干净 |
| **S1 只读桥接** | 1-2 周 | R-4 + R-7 + T-3/T-4 | 公网页面展示真实批次；本地 OpsMonitor 呈现真实 CPU/GPU/磁盘曲线与服务探测 |
| **S2 拥有性 + 可观测** | 1-2 周 | R-5/6/8 | 刷新不丢种子；错误可见可导出；导出清单被 update_seed_list 消费验证通过 |
| **S3 控制面接管（→方案 C）** | 2-4 周 | R-9/10/11/12 + T-5/6 | dry-run 管线经本仓工作台全程可视可控；精评→采纳→种子回写端到端走通；console 宣布冻结 |

---

## 八、风险登记册

| 风险 | 等级 | 对策 |
| --- | --- | --- |
| 令牌泄漏（BFF/agent claim key 进公网构建） | 🔴 高 | 令牌仅存本机 `.env`；CI 构建公网产物时静态扫描密钥模式（可并入 offline-guard 思路新增 secrets-guard 测试） |
| Pages 快照时效误导（旧数据当实时看） | 🟡 中 | 快照页强制显示 `generated_at` 与「历史快照」徽标（R-3 DEMO 开关联动） |
| 双前端漂移（过渡期两边改） | 🟡 中 | S3 起 console 仓库加 DEPRECATED 横幅；领域改动只准落本仓 |
| manifest schema 演进不同步 | 🟡 中 | subtree 同步 + 双仓 CI 各自 `check_contract_sync` 门禁 |
| 本地优先边界破防（有人给 Pages 加后端调用） | 🔴 高 | offline-guard 测试扩展：公网构建产物禁止出现 `127.0.0.1:3030/8300` 字面量 |
| idb 依赖与零依赖红线冲突 | 🟢 低 | 优先手写最小 idb 封装（ IndexedDB 原生 API + Promise 化，<200 行） |
| monorepo 工作区不干净导致 T-3 基线漂移 | 🟢 低 | T-1 收口先行，快照导出基于 tag |

---

## 九、立即可执行的下一步（本周）

1. **本仓**：R-1 虚假文案清除 + 诚实性测试（半天）→ R-2/R-3 定向声明与 DEMO 开关（半天）；
2. **对仓**：T-1 工作区收口提交 + T-2 互链（半小时）；
3. **共同**：确认本报告 §二 方案 B→C 裁决与 §七 路线图排期，随后开 S0。

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| --- | --- | --- | --- |
| v1.0.0 | 2026-10-15 | 首版：职责裁决 + 契约对齐 + 双仓整改清单 + 目标态架构 + 四阶段路线图 | Chief Architect |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

**© 2025-2026 YanYuCloudCube™. All Rights Reserved.**

</div>
