---
file: CONTRIBUTING.md
description: 贡献指南 (Contributing Guide)
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.1
created: 2026-10-11
updated: 2026-10-11
status: active
tags: [YYC3],[贡献指南]
category: guide
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---
# 贡献指南 (Contributing Guide)

> 「**_YanYuCloudCube_**」言启象限 | 语枢未来
>
> 感谢你为 YYC³ 生态贡献力量！请先阅读本指南，让每一次协作都「执行有规划、规划有节点、节点有目标、目标可评估」。

---

## 🪜 快速上手

```bash
# 1. Fork 并克隆仓库
git clone <your-fork-url>
cd YYC3-MH3

# 2. 安装工具链（Node 22 + pnpm 10+，见 .mise.toml）
mise install

# 3. 安装依赖
pnpm install

# 4. 启动开发服务器（默认 8443）
pnpm dev
```

---

## 🔀 开发流程（PDCA+ 循环）

```
Plan (规划) → Do (执行) → Check (检查) → Act (处理) → Archive (归档)
```

### 1. Plan — 规划

- 在 Issue 中明确目标与验收标准
- 分析影响范围与依赖关系
- 复杂任务在 `docs/{项目名}-{导师标识}-{YYYYMMDD}/01-任务规划与节点目标.md` 中登记

### 2. Do — 执行

- 从最新的 `main` 拉出功能分支：

```bash
git checkout -b feat/your-feature-name
```

**分支命名规范**：

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `feat/` | 新功能 | `feat/seed-mutation-lab` |
| `fix/` | 缺陷修复 | `fix/vram-overflow-warning` |
| `docs/` | 文档 | `docs/readme-badges` |
| `refactor/` | 重构 | `refactor/pipeline-bar` |
| `chore/` | 工程杂项 | `chore/deps-upgrade` |

### 3. Check — 质量门禁

提交前必须全部通过：

| 检查项 | 命令 | 通过标准 |
| --- | --- | --- |
| 类型检查 | `npx tsc --noEmit` | **0 errors** |
| 生产构建 | `pnpm build` | 构建成功 |
| 代码格式 | `pnpm format` | oxfmt 格式化通过 |
| 人工自检 | 对照验收标准 | 功能正确、无回归 |

### 4. Act + Archive — 提交与归档

**提交信息规范（Conventional Commits）**：

```
<type>(<scope>): <subject>

feat(workbench): 支持 Seed 一键回写沉淀
fix(search): 修复夜间控制台搜索项缺失标题
docs(readme): 补全五步流水线说明
```

- `subject` 使用中文或英文均可，简洁明确，聚焦「为什么」
- 一个 commit 只做一件事

**Pull Request 要求**：

- [ ] 关联对应 Issue
- [ ] 质量门禁全部通过（附截图或命令输出）
- [ ] 涉及新功能时同步更新 README / docs
- [ ] 敏感信息检查：无硬编码密钥、无真实 API Key

---

## 📐 代码规范

### 技术栈约定

- **React 19 函数组件 + Hooks**，默认导出组件
- **TypeScript strict 模式**，公共接口必须显式类型标注
- **Tailwind CSS v4**：主题 Token 统一在 `src/index.css` 的 `@theme` 中维护，禁止散落魔法色值（DS Tokens 除外）
- **字符串引号**：含撇号的字符串使用双引号（如 `"We're ready"`），避免构建报错
- **路径别名**：`@/` 指向 `src/`

### 架构约定

```
src/
├── components/common/    # 基础组件：保持无业务语义、可复用
├── components/pipeline/  # 流水线域组件
├── views/                # 页面级视图：通过 App.tsx 条件路由挂载
├── data/                 # 模拟数据与静态档案
└── types/                # 全局类型唯一来源
```

- 新增类型一律进入 `src/types/index.ts`，避免循环依赖
- 新增视图需同步登记到 `NavTabId` 联合类型与 `TAB_TITLES`

---

## 📚 文档协同（YYC³ 标准）

每次实质性会话/开发请在 `docs/` 下建立工作目录并沉淀四件套：

```
docs/{项目名}-{导师标识}-{YYYYMMDD}/
├── 00-项目现状审核报告.md
├── 01-任务规划与节点目标.md
├── 02-执行日志与进度跟踪.md
└── 03-总结文档与状态同步.md
```

> **不盲猜、不盲测、不盲从 —— 以代码为准绳，以文档为纽带，以价值为导向。**

---

## 🐛 报告缺陷

提交 Issue 时请包含：

1. 复现步骤与期望/实际行为
2. 环境（OS / Node / pnpm 版本）
3. 控制台报错截图或日志
4. 如涉及 UI，请附截图

安全类漏洞请**不要**公开提交，参见 [安全政策 (SECURITY.md)](SECURITY.md)。

---

## 🧭 协作原则

```
信任但验证 (Trust but Verify)
        ↓
透明沟通 (Transparent Communication)
        ↓
持续迭代 (Continuous Iteration)
        ↓
共同成长 (Grow Together)
```

---

**© 2025-2026 YanYuCloudCube Team. All Rights Reserved.**

---

## 变更历史

| 版本   | 日期       | 变更内容                               | 作者                |
| ------ | ---------- | -------------------------------------- | ------------------- |
| v1.0.1 | 2026-10-11 | 标头/标尾合规化，对齐团队规范（可追溯） | YanYuCloudCube Team |

