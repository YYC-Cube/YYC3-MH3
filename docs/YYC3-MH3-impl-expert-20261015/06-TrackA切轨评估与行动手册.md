---
file: 06-TrackA切轨评估与行动手册.md
description: YYC3-MH3 Track A（Node 运行时轨）切轨评估 - impl-expert - 2026-10-16
author: AI Tutor <impl-expert>
version: v1.0.0
created: 2026-10-16
updated: 2026-10-16
status: ready
tags: [analysis],[track-a],[deploy],[registry],[runbook]
category: report
---

# 🛤️ Track A 切轨评估与行动手册

> **定位**：05 迁移清单 §3.2 部署轨分叉的决策级预研。**本手册为「立项即执行」的待命文档**——触发条件未满足前不启动任何切轨动作。
>
> **📌 2026-10-16 立项会修正**：触发条件与「Registry 采集立项」**正式解耦**（07 决议书 A2 事实：collector 为 darwin-only，内网宿主若为 Linux 命中 platform 守卫回退）——Track A 转为独立裁决事项，D1 决策门不变。

## 评估信息

| 属性 | 值 |
| --- | --- |
| **评估基线** | main @ `69e25b4`（Next 16.4.0 · Track B 静态导出 · 118 用例 · Lighthouse A11y 100） |
| **评估日期** | 2026-10-16 |
| **触发条件** | Registry 真实采集正式立项（04 预研转入实施） |
| **结论预览** | **切轨可行，工程量 ≈ 2-3 人日**；但存在 1 项**契约红线决策**（06 §1.1 回环 only vs 公网部署）须先解 |

---

## 一、为什么需要 Track A

Track B（现状）下 BFF 无法随站点部署：`output: "export"` 与 API Route 互斥，线上生产恒走 memory 快照——Registry 真实采集（采集器写入、批次真实数据、告警真实流转）**没有服务端落点**。Track A 切轨后：

- `routeHandler.ts` 薄壳随 Next Node 服务常驻，八端点真实供数
- 服务端能力解锁：`.env` 服务端密钥（采集器 token）、定时任务挂载点、写路径持久化前提
- `getPorts()` 组合根在生产态装配 local 适配器 → 真实闭环（生成→评分→精评→归因→回写全链）

## 二、现状代码事实（切轨 GAP 分析基础）

| # | 事实 | 位置 | Track A 影响 |
| --- | --- | --- | --- |
| F1 | `output: "export"` + `trailingSlash: true` | [next.config.ts](../../next.config.ts) | 必须移除（否则构建期 API Route 报错） |
| F2 | `handleWebRequest` 薄壳已备，Track A 三行接入 | [server/routeHandler.ts](../../server/routeHandler.ts) | 零改动，新建 `app/api/[...registry]/route.ts` 转发即可 |
| F3 | Host 校验仅放行 `127.0.0.1/localhost/::1`，非回环一律 403 | registryApi.ts `isLoopbackHost` | 🔴 **公网部署下自身域名即 403**——契约红线决策（见 §三） |
| F4 | 组合根生产态装配 memory（`NODE_ENV==="development"` 才走 local） | [composition.ts](../../src/app/composition.ts) | 需第三态：Node 运行时生产 → local + env 注入 URL |
| F5 | 前端 URL 解析 `NEXT_PUBLIC_REGISTRY_BASE_URL → 127.0.0.1:3031 兜底` | [http.ts](../../src/adapters/local/http.ts) | 部署时注入同源绝对 URL 即可，代码零改动 |
| F6 | deploy.yml 全链绑定 GH Pages 静态产物（out/ + CNAME） | .github/workflows/deploy.yml | 整轨改写或双轨并存（workflow_dispatch 手动轨） |
| F7 | SW 对 `/api/*` 禁缓存、导航直连 | [sw.js](../../public/sw.js) | 兼容，零改动 |

## 三、前置决策门（唯一红线）

**D1 · 06 契约 §1.1「本地回环 only，永不暴露公网」如何自处于公网部署？**

| 选项 | 做法 | 代价 | 契约动作 |
| --- | --- | --- | --- |
| **D1-a 自托管内网（推荐）** | Node 服务部署于既有内网设施（如 192.168.3.45 侧），域名经内网 DNS/反代指向，公网不暴露 `/api` | 外网访问需 VPN/反代白名单 | 契约零修改（回环语义等价收紧为内网面） |
| D1-b 公网 + 域名放行 | `isLoopbackHost` 扩为 allowlist（回环 + `mh3.yyc3.top`），叠加 Bearer token 鉴权 | 攻击面扩大；鉴权密钥管理 | **契约版本 +1 先行修订**（纪律：先文档后实现） |
| D1-c 双面部署 | 静态面（Pages）+ API 面（内网独立进程）分离，前端 `NEXT_PUBLIC_REGISTRY_BASE_URL` 指内网 | 架构最复杂；离线场景断链 | 契约零修改 |

> 推荐 **D1-a**：与「本地优先 · 数据主权 100%」品牌叙事零冲突，04 预研的真实采集器本就运行在内网 GPU 机。

## 四、切轨行动手册（D1 决策冻结后按序执行）

| 阶段 | 内容 | 涉及文件 | 工作量 | 出口标准 |
| --- | --- | --- | --- | --- |
| **T1 构建切换** | 移除 `output: "export"` / `trailingSlash`；`images.unoptimized` 视托管方定 | next.config.ts | 0.5h | `next build` 含 API Route 无报错 |
| **T2 BFF 接入** | 新建 route：`export { handleWebRequest as GET, as POST, as PATCH }` + `export const dynamic = "force-dynamic"` | app/api/[...registry]/route.ts（新增 3 行） | 0.5h | dev 回环八端点冒烟过（routeHandler.test 6 例语义复用） |
| **T3 组合根三态** | 生产 Node 态走 local：判定改 `process.env.NEXT_PUBLIC_REGISTRY_BASE_URL 存在 && !VITEST`（env 驱动而非 NODE_ENV 硬分） | composition.ts | 1h | 生产构建水合真实数据（降级状态机保留） |
| **T4 托管部署** | D1-a：内网 Node（systemd/Docker + 反代）；备选 Vercel | 部署侧脚本 | 0.5-1d | 线上 8 端点 200 + 前端真实供数 |
| **T5 CI/CD 分轨** | deploy.yml 增 `workflow_dispatch` Track A 轨（或独立 workflow）；GH Pages 轨保留作静态镜像/回滚位 | .github/workflows/ | 0.5d | 双轨可切换，Pages 产物持续可用 |
| **T6 文档收口** | 06 契约实现状态表更新；README 部署章节双轨注记；03 总结归档 | docs ×3 | 0.5h | 事实同步完成 |

**合计 ≈ 2-3 人日**（不含 D1 决策周期）。

## 五、风险登记

| # | 风险 | 等级 | 缓解 |
| --- | --- | --- | --- |
| R1 | 06 契约红线未决先动工 → 架构反复 | 🔴 | §三 D1 为 T1 前置硬门 |
| R2 | 切轨后 GH Pages 断更导致回滚面丢失 | 🟠 | T5 双轨并存，Pages 保留为回滚位（DNS 切回即回滚） |
| R3 | composition 判定改动引发测试环境误装配 local | 🟡 | `VITEST` 守卫保留；boundary/adapters 测试先跑 |
| R4 | SW 离线语义与真实写路径冲突（POST/PATCH 离线失败） | 🟡 | 降级状态机已有 not_found/network 分类，补离线提示 UI 属产品层 |

## 六、回滚方案

Git revert T1-T3 提交 → GH Pages 轨（未拆除）自动以静态形态持续服务 → DNS 无需变更。回滚成本 ≈ 0（T4 托管侧下线即可）。

---

**评估结论**：✅ **待命就绪**——F2 薄壳与 F5 env 通道已在迁移期预埋，工程面仅 T1-T3 为代码改动（约 2h）；唯一阻塞项为 D1 契约决策，建议随 Registry 真实采集立项会一并裁决。
