---
file: 05-Vite至Next.js16迁移评估清单.md
description: YYC3-MH3 Vite → Next.js 16 架构级迁移评估 - impl-expert - 2026-10-15
author: AI Tutor <impl-expert>
version: v1.0.0
created: 2026-10-15
updated: 2026-10-15
status: active
tags: [analysis],[migration],[nextjs],[architecture]
category: report
---

# 📊 Vite → Next.js 16 迁移评估清单

## 评估信息

| 属性 | 值 |
| --- | --- |
| **评估对象** | YYC3-MH3 @ `e278273`（main，双远程同步态） |
| **评估日期** | 2026-10-15 |
| **目标框架** | Next.js 16（App Router / Turbopack / React 19.2） |
| **评估方法** | 全量目录遍历 + 逐文件耦合点核验（`import.meta.env` ×5 处、BFF 桥接、SW 注册、Vite 插件 ×6） |
| **结论预览** | **技术可行，架构适配度高**（六边形 + 纯函数 BFF 是最大资产）；核心成本在「路由重构 + 部署形态决策 + 测试重建」三处 |

---

## 〇、战略前提：迁移即脱离 Figma Make 宿主（🔴 极高风险，须先决策）

本项目当前运行于 **Figma Make 设计-代码回路**内，以下设施全部为该宿主服务：

- `vite.config.ts` 中 6 个插件里 **5 个是 Figma 宿主专用**（site 配置注入 / 错误覆盖层重放 / React Refresh 边界兜底 / Make Kit stories / Registry BFF 桥接）
- `FIGMA_PUBLIC_URL` / `FIGMA_DEV_SERVER_HOST` / `PORT=3031` 环境变量契约
- `.figma/make/*` 宿主脚本群（dev / install / format / deploy-preview）

**迁移 Next.js 16 = 放弃 Figma Make 内嵌开发回路**（Figma Make 以 Vite 为运行时基座）。若设计侧仍依赖 Figma Make 迭代 UI，则本迁移应推迟或采取双轨并行（Figma Make 原型仓 + Next 生产仓同步）。

> **✅ P0 决策记录（2026-10-15 执行会话）**
>
> | 决策项 | 结论 | 落地动作 |
> | --- | --- | --- |
> | §〇 Figma Make 去留 | **GO · 双轨归档制** | `git tag figma-make-final` + `git branch figma-make` 落于 `b7f969a`（Vite 工具链终态）——设计侧可随时切 `figma-make` 分支在 Figma Make 内继续原型回路；main 轨进入 Next 16 |
> | §3.2 部署轨选型 | **Track B（静态导出）先行** | 保 `mh3.yyc3.top` 线上零断服（生产 memory 快照行为与 Vite 静态形态完全等价）；Track A（Node 运行时）保留为 Registry 真实采集落地时的演进轨 |
> | 品牌资产转录 | site.json → `src/app/layout.tsx` metadata | title/description/icons/manifest 逐字转录；`robots.index=false` 隐私语义由 metadata.robots + `public/robots.txt` 双保险接管 |
> | BFF Route Handler | 顺延至 P4（清单原计划） | P1–P3 过渡期 dev 优雅降级 memory 快照（降级状态机既有机能，无白屏） |

---

## 一、全量目录与文件处置总表

> 处置结论三类：**✅ 保留复用**（零改动或微调即可）/ **🗑️ 删除废弃** / **🔧 针对性改写**

### 1.1 顶层配置文件

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `vite.config.ts` | 🗑️ 删除 | 🟡 中 | 0.5h | 531 行中约 450 行为 Figma 插件；有效逻辑全部有 Next 对应物（见 §3.1 映射表） |
| `vitest.config.ts` | 🔧 改写 | 🟢 低 | 0.5h | 保留 jsdom/globals/setup/alias；移除 `@tailwindcss/vite` 插件（`css: false` 下本就冗余）；`@vitejs/plugin-react` 保留（vitest 仍走 Vite 转译管线） |
| `tsconfig.json` | 🔧 改写 | 🟢 低 | 0.5h | 以 `next dev` 首启生成的 tsconfig 为基（追加 `next-env.d.ts`、`plugins: [{name: "next"}]`、`jsx: "preserve"`），合并现有 `strict`/`noUncheckedIndexedAccess` 等严格项与 `@/*` paths |
| `package.json` | 🔧 改写 | 🟡 中 | 1h | scripts 全换（见 §4.1）；依赖增删（见 §4.2）；`packageManager`/`engines`/仓库元数据字段保留 |
| `index.html` | 🗑️ 删除 | 🟡 中 | 1h | 职责整体并入 `app/layout.tsx` 的 `export const metadata` + `viewport`（title/icons/manifest/theme-color/lang=zh-CN）；`class="dark"` 与 body 样式类迁至 `<html>`/`<body>` 标签属性 |
| `.env.example` | 🔧 改写 | 🟢 低 | 0.5h | `VITE_*` → `NEXT_PUBLIC_*`；`PORT` → `next dev -p`；`FIGMA_*` 删除 |
| `.oxfmtrc.json` | 🔧 改写 | 🟢 低 | 0.2h | `ignorePatterns` 追加 `.next/`、`out/`；移除 `index.html` 项 |
| `.mise.toml` / `.gitignore` / `.gitattributes` | ✅ 保留 | 🟢 低 | 0.2h | `.gitignore` 追加 `.next/`、`out/` 两行 |
| `.figma/` | 🗑️ 删除 | 🟠 高 | 0.5h | 前提见 §〇；内含 `site.json` 品牌元数据需先行转录至 `app/layout.tsx` metadata |
| `.vscode/` | ✅ 保留 | 🟢 低 | 0 | — |

### 1.2 `.github/workflows/`

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `ci.yml` | 🔧 改写 | 🟡 中 | 1h | 四门禁保留；构建命令换 `pnpm build`（Next）+ `BASE_PATH` 双基座冒烟改经 `next.config.ts basePath` 注入（方式不变，仍走 env） |
| `deploy.yml` | 🔧 改写 | 🟠 高 | 2h | **随部署形态分叉**：Track A（Node 运行时）→ 废弃此文件改 Vercel/自托管流水线；Track B（维持 GH Pages 静态导出）→ 产物目录 `dist` → `out`，构建加 `output: 'export'` + `trailingSlash: true`（见 §3.2） |

### 1.3 `server/`（BFF 层）

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `server/registryApi.ts` | ✅ 保留 | 🟢 低 | 0 | **全仓最优质资产**：框架无关纯函数（`RegistryRequest → RegistryResponse`），零 Vite/Node API 依赖，直接被 Next Route Handler 复用 |
| `server/registryApi.test.ts` | ✅ 保留 | 🟢 低 | 0 | 纯函数单测，环境无关 |
| `（新增）app/api/[...registry]/route.ts` | 🔧 新增改写 | 🟡 中 | 2h | 替代 `vite.config.ts` 内 `registryApiPlugin` 薄壳：`Request → RegistryRequest`（method/path/query/body/host 提取）→ `api.handleRequest` → `NextResponse.json`。回环 Host 校验逻辑原样保留；`export const dynamic = "force-dynamic"`。**注意**：与 Track B（静态导出）互斥，见 §3.2 |

### 1.4 `src/` 应用层

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `src/main.tsx` | 🗑️ 删除 | 🟡 中 | 1h | 挂载职责由 Next 接管；**SW 注册逻辑迁出**至新增 `src/app/sw-register.tsx`（"use client"，`NODE_ENV === "production"` 守卫，注册路径 `process.env.NEXT_PUBLIC_BASE_PATH + "/sw.js"` 并显式传 `scope`） |
| `src/App.tsx`（路由中枢） | 🔧 改写 → 拆解 | 🔴 极高 | 8h | **全案最大改写项**：`useState<NavTabId>` 视图切换 → App Router 文件路由。14 个 `React.lazy` 视图全部由 Next 路由级代码分割替代（lazy 可删）；领域状态装配（toast/认证/生产数据/遥测）抽为 React Context Provider 树挂 `app/layout.tsx`；`handleNavigate(tab, extra)` → `<Link href>` / `router.push` + 动态段参数（见 §5 路由映射表） |
| `src/config.ts` | 🔧 改写 | 🟢 低 | 0.5h | `import.meta.env.VITE_APP_PORT` → `process.env.NEXT_PUBLIC_APP_PORT`（构建期 env 直读，无需 define） |
| `src/index.css` | 🔧 改写 | 🟢 低 | 0.5h | Tailwind v4 `@import "tailwindcss"` 与 `@fontsource` 三字体导入**原样保留**；改为在 `app/layout.tsx` 顶部 import；需新增 `postcss.config.mjs`（`@tailwindcss/postcss`，见 §4.2） |
| `src/vite-env.d.ts` | 🔧 改写 | 🟢 低 | 0.2h | 改 `next-env.d.ts` 引用；如有 `ImportMetaEnv` 接口声明同步删除 |
| `src/app/composition.ts` | 🔧 改写 | 🟡 中 | 1.5h | 组合根逻辑保留；`import.meta.env.DEV && !import.meta.env.VITEST` → `process.env.NODE_ENV === "development" && !process.env.VITEST`；**建议提升为模块级单例**（Next 下多组件各自 `createPorts()` 会重复装配） |
| `src/app/useAuthSession.ts` | 🔧 改写 | 🟡 中 | 2h | Context 化（跨路由段保持登录态）；登录视图为 Modal 形态可保留非路由方案 |
| `src/app/useProductionData.ts` | 🔧 改写 | 🟠 高 | 3h | Context 化（批次/种子/activeBatchId 跨页共享）；`NavigateExtra.batchId/seedId` 语义改由路由动态段承载后，`adoptSeed`/`createBatch` 的导航回调重接 `useRouter` |
| `src/app/useOpsTelemetry.ts` | 🔧 改写 | 🟡 中 | 2h | Context 化（遥测事件表全局共享） |
| `src/app/useToast.ts` | 🔧 改写 | 🟢 低 | 1h | Context 化（ToastContainer 挂 layout） |
| `src/app/useKeyboardShortcuts.ts` | ✅ 保留 | 🟢 低 | 0.2h | 纯 DOM 事件 hook；挂载点随 Context Provider 迁移 |

### 1.5 `src/adapters/` / `src/domains/` / `src/data/` / `src/types/`

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `src/domains/**`（5 域端口+纯函数） | ✅ 保留 | 🟢 低 | 0 | 零框架耦合，六边形核心资产原样复用 |
| `src/adapters/memory/**` | ✅ 保留 | 🟢 低 | 0 | 快照适配器，环境无关 |
| `src/adapters/local/http.ts` | 🔧 改写 | 🟢 低 | 1h | 唯一耦合点 L58：`import.meta.env.VITE_REGISTRY_BASE_URL` → `process.env.NEXT_PUBLIC_REGISTRY_BASE_URL`；超时/降级状态机原样 |
| `src/adapters/local/{batch,seed,telemetry}Repository.ts` | ✅ 保留 | 🟢 低 | 0 | 仅依赖 http.ts 基座，随基座改写自动兼容 |
| `src/data/**`（8 个 mock 常量模块） | ✅ 保留 | 🟢 低 | 0 | — |
| `src/types/index.ts` | 🔧 改写 | 🟡 中 | 1h | `NavTabId` 联合类型改为路由段字面量对齐（或保留作为导航配置源）；`NavigateExtra` 语义并入路由参数类型 |

### 1.6 `src/views/`（14 视图）与 `src/components/`

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `src/views/*.tsx` ×14 | 🔧 改写 | 🟠 高 | 6h | 每视图顶部加 `"use client"`（均为重交互：图表/终端/表单）；导出名统一为默认导出并包一层 `page.tsx`（见 §5）；`batch-detail`/`seed`/`docs` 三视图的 id 入参从 props/extra 改读路由参数（Next 16：`params` 为 **Promise，须 `await`**） |
| `src/components/common/**`（12 组件） | ✅ 保留 | 🟢 低 | 0 | 纯 UI 无路由耦合 |
| `src/components/navigation/Sidebar.tsx` | 🔧 改写 | 🟡 中 | 2h | 激活态从 `activeTab` prop → `usePathname()`；导航项配置化（label/href/icon 一张表驱动） |
| `src/components/navigation/Topbar.tsx` / `StatusBar.tsx` | 🔧 改写 | 🟢 低 | 1h | 展示层保留，数据源改 Context 消费 |
| `src/components/navigation/GlobalSearchModal.tsx` | 🔧 改写 | 🟡 中 | 1.5h | ⌘K 全局搜索的「跳转」动作从 `onNavigate(tab, extra)` → `router.push()`；搜索目标表增加 href 字段 |
| `src/components/pipeline/**` / `platform/**` / `batch/**` | ✅ 保留 | 🟢 低 | 0 | 视图内部组件，随视图迁移 |
| `src/components/yyc3/**`（AI Family 浮窗） | ✅ 保留 | 🟢 低 | 0.5h | 挂载点从 App.tsx 迁至 layout Provider 树；时钟 hook 环境无关 |

### 1.7 `public/` 与测试

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `public/CNAME` | ✅ 保留 | 🟢 低 | 0 | Track B 专用 |
| `public/sw.js` | ✅ 保留 | 🟢 低 | 0.5h | **已 scope 相对化**（v1.1.0 改造），basePath 形态天然兼容；仅需确认注册侧 scope 传参（§1.4 sw-register） |
| `public/manifest.webmanifest` | 🔧 改写 | 🟡 中 | 1h | `start_url`/`scope`/icons `src` 均为绝对路径 `/...`；Track B 子路径基座需构建期前缀注入（与 Vite 方案同思路，改由 CI sed 或双 manifest） |
| `public/yyc3-icons/**`（全端图标） | ✅ 保留 | 🟢 低 | 0 | — |
| `public/placeholders/**` | ✅ 保留 | 🟢 低 | 0 | — |
| `src/__tests__/domains.pure.ts` / `adapters.*.ts` | ✅ 保留 | 🟢 低 | 0.5h | 纯函数/注入式测试，环境无关 |
| `src/__tests__/app.smoke.tsx` / `domain.smoke.tsx` | 🔧 改写 | 🟠 高 | 4h | 渲染对象 `App` 解体 → 改为逐页面 + Provider 树组合渲染断言；110 用例规模预计 ±10% 波动 |
| `src/__tests__/pwa.test.ts` | 🔧 改写 | 🟡 中 | 2h | **L70-77 断言 `index.html` 内容**——该文件已不存在；改为断言 `app/layout.tsx` 的 metadata 导出（或构建产物 `out/index.html`，Track B 下后者更接近真值） |
| `src/__tests__/boundary-guard.test.ts` / `offline-guard.test.ts` | 🔧 改写 | 🟡 中 | 1.5h | 守卫规则中的 `import.meta.env` / 目录结构断言按新架构更新 |
| `src/test/setup.ts` | ✅ 保留 | 🟢 低 | 0 | — |

### 1.8 文档与合规

| 对象 | 处置 | 风险 | 工作量 | 说明 |
| --- | --- | --- | --- | --- |
| `docs/**`（全部） | ✅ 保留 | 🟢 低 | 0.5h | `06-Registry-API-契约.md` §5 端口约定需补记 Next 形态 |
| `README.md` | 🔧 改写 | 🟢 低 | 1h | 技术栈徽章/快速开始/脚本表/部署章节同步 |
| `AGENTS.md` / `CLAUDE.md` | 🔧 改写 | 🟢 低 | 0.5h | 工作区规则整体换血（Vite 叙述 → Next 叙述） |

---

## 二、依赖包迁移评估

| 依赖 | 现版本 | 处置 | Next 16 兼容性 | 风险 |
| --- | --- | --- | --- | --- |
| `react` / `react-dom` | ^19.0.0 | 🔧 升级至 ^19.2.x | Next 16 以 React 19.2 为基线（Cache Components 依赖） | 🟡 中 |
| `next` | — | ➕ 新增 `16.x` | — | — |
| `vite` | 8.0.16 | 🗑️ 移除（构建职责移交） | — | 🟢 低 |
| `@vitejs/plugin-react` | ^6 | ✅ 保留 | 仅供 vitest 转译使用 | 🟢 低 |
| `@tailwindcss/vite` | ^4 | 🗑️ 移除 | 改走 PostCSS 通道 | 🟢 低 |
| `tailwindcss` | ^4 | ✅ 保留 | 官方支持 Next 集成 | 🟢 低 |
| `@tailwindcss/postcss` | — | ➕ 新增 | Tailwind v4 的 Next 官方接法 | 🟢 低 |
| `lucide-react` | ^1.55 | ✅ 保留 | RSC 兼容（纯图标） | 🟢 低 |
| `@fontsource/*` ×3 | ^5 | ✅ 保留 | CSS import 原样 | 🟢 低 |
| `vitest` / `jsdom` / `@testing-library/*` | ^5 / ^30 / 最新 | ✅ 保留 | 与 Next 无冲突；`next/navigation` 相关 hook 需 mock（`__mocks__/next` 或 `vi.mock`） | 🟡 中 |
| `oxfmt` | 0.73.0 | ✅ 保留 | 配置追加忽略 `.next/`、`out/` | 🟢 低 |
| `typescript` | ^5.7 | ✅ 保留 | 满足 Next 16 ≥5.1 要求 | 🟢 低 |

**结论**：依赖面干净，无任何 Vite-only 运行时依赖渗入业务代码；预计净变更 = +2（next、@tailwindcss/postcss）/ −2（vite、@tailwindcss/vite）/ 1 升级（react）。

---

## 三、构建流程与运行时适配评估

### 3.1 `vite.config.ts` → `next.config.ts` 逐项映射

| Vite 配置项 | 现值 | Next 16 对应物 | 说明 |
| --- | --- | --- | --- |
| `base` | `FIGMA_PUBLIC_URL > BASE_PATH > /` 三级解析 | `basePath: process.env.BASE_PATH` | CI 注入方式**完全不变**（deploy.yml 的 `configure-pages → base_path` 链路原样复用） |
| `define VITE_APP_PORT` | PORT 构建期注入 | `NEXT_PUBLIC_APP_PORT` 环境变量 | Next 原生 env 机制，define 层删除 |
| `build.sourcemap/minify` | dev inline / prod 压缩 | Turbopack 默认行为对齐 | 零配置 |
| `server.port: 3031` | `strictPort` | `next dev -p 3031`（package.json scripts） | 团队端口规范延续 |
| `server.host: 0.0.0.0` | Figma 宿主 | 删除（本地开发回 127.0.0.1） | 安全面收紧 |
| `resolve.alias @` | `./src` | tsconfig `paths`（Next 自动读取） | 已具备 |
| 6 个 `plugins` | 5 个 Figma 专用 + 1 个 BFF | 全删；BFF → Route Handler | 见 §1.3 |

### 3.2 部署形态分叉（🔴 高风险决策点）

| 维度 | Track A：Node 运行时（推荐） | Track B：GH Pages 静态导出（现状延续） |
| --- | --- | --- |
| 配置 | 默认（无 `output`） | `output: "export"` + `trailingSlash: true` |
| BFF Route Handler | ✅ 完整可用（dev/prod 一致） | ❌ 互斥——Host 校验天然动态，导出构建即失败；BFF 须外置独立进程或退回 memory-only |
| 收益 | SSR/ISR/Cache Components 全解锁；`.env` 服务端密钥能力 | 零服务器成本；CI 改动最小（产物目录 `dist`→`out`） |
| 代价 | 弃用 GH Pages/CNAME；需 Vercel 或自托管 Node | 永久放弃服务端能力；PWA manifest 子路径注入需另做 |
| 建议 | **主案**：与「Registry 真实采集落地」（04 预研）天然衔接 | **备选**：仅当维持零成本静态托管为硬约束时 |

### 3.3 运行时特性适配清单

| 特性 | 现状 | 迁移方案 | 风险 |
| --- | --- | --- | --- |
| 环境变量读取 | `import.meta.env` ×5 处 | `process.env.NEXT_PUBLIC_*`；**服务端专属值（BFF 密钥类）去 `NEXT_PUBLIC_` 前缀**防泄漏 | 🟡 中 |
| SW 注册 | main.tsx `import.meta.env.PROD` + `BASE_URL` | sw-register client 组件 + `NEXT_PUBLIC_BASE_PATH` + 显式 scope | 🟡 中 |
| 视图懒加载 | `React.lazy` ×14 | 路由级自动分割，lazy 全删（防双重分割语义冲突） | 🟢 低 |
| dev/prod 分支 | `import.meta.env.DEV` | `process.env.NODE_ENV`（Next 双端语义一致） | 🟢 低 |
| HTML 注入 | Figma 插件 transformIndexHtml | `app/layout.tsx` metadata/viewport API | 🟢 低 |
| CSS | Tailwind v4 Vite 插件 | `postcss.config.mjs` + layout import | 🟢 低 |

---

## 四、路由体系迁移评估

### 4.1 目标路由映射表（App Router）

| 现视图（NavTabId） | 目标路由 | 段类型 | 参数迁移 |
| --- | --- | --- | --- |
| `design-system`（默认态） | `/` | 根页 | — |
| `dashboard` | `/dashboard` | 静态 | — |
| `workbench` | `/workbench` | 静态 | — |
| `batch-detail` + `extra.batchId` | `/batches/[batchId]` | 动态 | `const { batchId } = await params`（**Next 16 强制 Promise**） |
| `seed` + `extra.seedId` | `/seeds`（`?focus=seedId`） | 静态+查询 | 列表+聚焦语义，避免过度路由化 |
| `prompt` | `/prompt-hub` | 静态 | — |
| `models` | `/models` | 静态 | — |
| `agent` | `/agent-workflow` | 静态 | — |
| `platform` | `/platform` | 静态 | — |
| `ops` | `/ops-monitor` | 静态 | — |
| `nightly` | `/nightly-console` | 静态 | — |
| `docs` + `extra.docId` | `/docs`（`?doc=docId`） | 静态+查询 | — |
| `settings` | `/settings` | 静态 | — |
| `login`（Modal 形态） | 不设路由 | — | 保留全局 Modal（bypassLogin 语义依赖跨页共享） |

### 4.2 目录形态（目标态骨架）

```text
app/
├── layout.tsx            # metadata + <html class="dark"> + Provider 树 + SW 注册 + Toast/SW容器
├── page.tsx              # / → design-system
├── dashboard/page.tsx    # "use client" 视图薄壳（或视图中台 @/views 直接挂载）
├── workbench/page.tsx
├── batches/[batchId]/page.tsx   # await params
├── seeds/page.tsx  prompt-hub/  models/  agent-workflow/
├── platform/  ops-monitor/  nightly-console/  docs/  settings/
└── api/[...registry]/route.ts   # Track A 专用
```

### 4.3 RSC/CSC 拆分策略（分两阶段，避免一步到位）

- **Phase 1（迁移期）**：14 视图全部 `"use client"`，Provider 树挂 layout——**功能等价优先**，行为零漂移可验证
- **Phase 2（优化期，迁移完成后独立立项）**：`Sidebar`/`Topbar` 外壳与 `docs` 静态内容下沉 RSC；`INITIAL_*` 快照改服务端注入（`cacheComponents: true` + `"use cache"`），客户端仅交互壳水合——**不在本次迁移范围**，避免 Cache Components 实验语义引入回归面

---

## 五、现有功能兼容性评估

| 功能面 | 兼容性 | 风险 | 验证手段 |
| --- | --- | --- | --- |
| 六边形领域层（5 域） | ✅ 100% 原样 | 🟢 低 | domains.pure.test 全量保留即证 |
| Registry BFF（8 端点） | ✅ 纯函数复用；Track B 受限 | 🟡 中 | registryApi.test 保留 + route handler 集成冒烟 |
| 降级状态机（memory 回退） | ✅ 组合根 env 判定换写即可 | 🟢 低 | adapters.local.test 保留 |
| PWA 离线层 | 🔧 注册路径 + manifest 基座适配 | 🟡 中 | pwa.test 改写 + Lighthouse PWA 审计 |
| ⌘K 全局搜索 / Ctrl+B / Ctrl+/ | ✅ hook 原样，跳转动线改写 | 🟡 中 | 人工回归 + smoke |
| 模拟登录 + 5 次锁定 | ✅ Context 化后语义不变 | 🟢 低 | smoke 断言 |
| 多基座部署（自定义域/子路径） | ✅ basePath 机制等价承接 | 🟡 中 | CI 双基座冒烟（链路已建，命令替换即可） |
| 110 项测试资产 | 🔧 约 25% 需改写（smoke/pwa/守卫） | 🟠 高 | 迁移验收门禁：**全绿 + 用例数 ≥ 105** |
| 设计体系视图 / AI Family 浮窗 | ✅ 组件级保留 | 🟢 低 | smoke |
| 真实时钟 / 移动端适配 | ✅ 环境无关 | 🟢 低 | 人工回归 |

---

## 六、风险登记册（Top 5）

| # | 风险 | 等级 | 缓解措施 |
| --- | --- | --- | --- |
| R1 | Figma Make 回路断裂影响设计侧协作 | 🔴 极高 | §〇 Go/No-Go 前置决策；必要时双轨仓 |
| R2 | App.tsx 路由中枢拆解引发状态丢失（跨页 toast/选中态/遥测） | 🔴 极高 | Provider 树先行的「骨架迁移法」：先建 Context 层并行验证，再逐视图搬移 |
| R3 | 部署形态分叉（Track A/B）返工 | 🟠 高 | 迁移首日冻结决策；deploy.yml 按轨改写 |
| R4 | 测试资产断层（index.html 断言类） | 🟠 高 | 先改写后搬视图；验收门禁量化（≥105 用例） |
| R5 | Next 16 异步 API（params/cookies）误用同步写法 | 🟡 中 | tsc strict + Next 类型系统编译期拦截 |

---

## 七、工作量汇总与执行路线图

| 阶段 | 内容 | 工作量 | 出口标准 |
| --- | --- | --- | --- |
| **P0 决策冻结** | §〇 Figma Make 去留 + §3.2 部署轨选型 | 0.5 天 | 双决策书面确认 |
| **P1 骨架并行** | next.config/tsconfig/postcss/env/依赖安装；`next dev -p 3031` 空壳可跑 | 1 天 | 空白 App Router 页 200 OK |
| **P2 Provider 层** | 五大状态 Context 化 + composition 单例化 + SW 注册迁移 | 2 天 | smoke：Provider 树渲染无错 |
| **P3 视图搬移** | 14 视图逐页迁移 + 导航三件套路由化 + ⌘K 动线 | 3 天 | 全路由可达 + 交互回归清单过 |
| **P4 BFF 与测试** | Route Handler 薄壳 + pwa/smoke/守卫测试改写 | 2 天 | **110±5 用例全绿** |
| **P5 CI/CD 与收尾** | 双 workflow 改写 + README/AGENTS/契约文档同步 | 1.5 天 | CI 四门禁 + 部署双绿 + 线上验收 |
| **合计** | — | **≈ 10 人日**（含 20% 缓冲 ≈ 12 人日） | — |

> **✅ P1 执行实况（2026-10-15 已收口，出口标准超额达成）**
>
> - 出口标准「空白页 200 OK」升级为「**整树 SPA 根路由挂载**」：`src/app/page.tsx` 以绞杀者模式直接挂载既有 App 树，线上功能零漂移
> - 依赖落位：next@16.4.1 / react@19.2.4 / @tailwindcss/postcss@4.3.3；vite + @tailwindcss/vite 已移除
> - 删除清单兑现：vite.config.ts / index.html / src/main.tsx / src/vite-env.d.ts / .figma/make 全目录
> - 守卫适配：boundary-guard 增设「app 路由层 → 根入口」迁移期白名单；pwa 守卫断言迁移至 layout.tsx/robots.txt/sw-register
> - 验证链：format ✅ / typecheck ✅ / **111 用例**（+1 SW 注册守卫）/ 双基座静态导出 ✅（out/ 含 CNAME·robots·sw·manifest）
> - 附带修正：05 清单前次提交为空文件，本轮全文入库

> Phase 2 RSC 深化（cacheComponents/流式注入）不计入本清单，建议迁移稳定后独立立项。

---

## 八、验收门禁（迁移完成的可量化定义）

- [ ] `pnpm typecheck` / `pnpm test`（≥105 用例）/ `pnpm format:check` / `pnpm build` 四门禁全绿
- [ ] 14 路由段全部可达，⌘K/Ctrl+B/Ctrl+/ 快捷键动线等价
- [ ] BFF 8 端点 dev 回环冒烟通过（Track A）；静态导出产物含 CNAME/SW/manifest（Track B）
- [ ] Lighthouse：Performance ≥ 90 / PWA 可安装（自定义域）
- [ ] 双基座（根路径 + basePath）CI 冒烟通过
- [ ] `docs/06-Registry-API-契约.md` §5 与 README 完成事实同步

---

**评估结论**：✅ **有条件通过**——技术面（六边形架构 + 纯函数 BFF + 零浏览器 API 渗漏 + 依赖面干净）适配度显著高于典型 Vite SPA；唯二前置条件为 §〇 Figma Make 去留决策与 §3.2 部署轨选型。冻结此两项后，本清单可直接作为 P0–P5 执行行动指南。
