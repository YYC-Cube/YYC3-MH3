---
file: AGENTS.md
description: figma-make-app
author: "YanYuCloudCube Team <admin@0379.email>"
version: v1.0.1
created: 2026-10-11
updated: 2026-10-11
status: active
tags: [YYC3, 文档]
category: general
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---
# yyc3-mh3 (Next.js 16 · App Router)

React 19 + Next.js 16 + Tailwind CSS v4 project (App Router, static export Track B).

> 历史注记：本仓库原为 Vite + Figma Make 宿主形态，2026-10-15 完成向 Next.js 16 的架构迁移（P0–P5，见 docs/YYC3-MH3-impl-expert-20261015/05-*.md）。Figma Make 原型回路归档于 `figma-make` 分支 / `figma-make-final` tag。

## Development Server

Run `pnpm dev` (Next.js dev server on port 3031, Turbopack). Hot reload is built in.

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or the repository contradicts this guide.

- `src/app/layout.tsx` - Root layout: brand metadata + `AppProviders` + `AppShell` mount point
- `src/app/app-shell.tsx` - Application shell: login guard, navigation trio, global modals, keyboard shortcuts
- `src/app/page.tsx` - Root route (`/` → design-system view); 12 more route segments live in sibling directories
- `src/app/contexts.tsx` - Five domain Contexts (Toast / Auth / ProductionData / OpsTelemetry / UIShell)
- `src/app/navigation.ts` - `useAppNavigate` side-effect navigation hook (batchId state + router.push)
- `src/config.ts` - Runtime constants + `NavTabId ↔ href` route mapping (leaf layer)
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `server/registryApi.ts` + `server/routeHandler.ts` - Registry BFF pure-function core + Web-standard Request/Response thin shell (Track A pluggable)
- `next.config.ts` - Next configuration (basePath multi-base, `output: "export"`)
- `postcss.config.mjs` - Tailwind v4 PostCSS channel
- `package.json` - Project dependencies and the build/dev/start/test/format scripts
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19.2 and React DOM 19.2, Next.js 16 (App Router, static export)
- Styling: Tailwind CSS v4 with the `@tailwindcss/postcss` plugin
- Tooling: TypeScript 5.x (Next-normalized tsconfig), Vitest 5, `@vitejs/plugin-react` (test transform only)
- Formatting: oxfmt (code-domain scoped via `.oxfmtrc.json`)

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/postcss` plugin configured in `postcss.config.mjs`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file.

`src/app/layout.tsx` imports `@/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export route pages as default exports; view components keep named exports.
- Client components must start with `"use client"`; route-layer pages are the default mounting point for views.

---

## 变更历史

| 版本   | 日期       | 变更内容                               | 作者                |
| ------ | ---------- | -------------------------------------- | ------------------- |
| v1.0.1 | 2026-10-11 | 标头/标尾合规化，对齐团队规范（可追溯） | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

**© 2025-2026 YanYuCloudCube™. All Rights Reserved.**

</div>

