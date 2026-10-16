/**
 * file: src/app/layout.tsx
 * description: App Router 根布局 · 品牌元数据 + 全局样式 + CSP 安全基线 + SW 注册挂载
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-10-15
 * updated: 2026-10-16
 * status: active
 * tags: [app],[layout],[metadata],[rsc],[csp]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Vite index.html + Figma site.json 品牌资产转录唯一承接点（05 清单 §1.1/§〇）：
 *   - title/description/icons/manifest 自 index.html 与 site.json 逐字对齐
 *   - robots noindex：site.json robots.index=false 隐私语义接管（配合 public/robots.txt）
 *   - 全局样式与 @fontsource 自托管字体经 "@/index.css" 注入（无外部 CDN，offline-guard 红线）
 *   - P5-3 CSP 安全基线：静态导出（Track B）无 HTTP 响应头通道，经 meta http-equiv
 *     下发（React 19 原生 hoist 至 head）；dev/prod 双策略（dev 放行 eval + ws: 供
 *     Turbopack HMR），prod 收紧为 self + 内联引导脚本所需最小面
 *
 * dependencies: next (Metadata/Viewport 类型), ./app-shell, ./contexts, ./error-sink, ./perf-sink, ./sw-register, @/index.css
 * exports: default (RootLayout), metadata, viewport
 */
import type { Metadata, Viewport } from "next";

import "@/index.css";
import { AppShell } from "./app-shell";
import { AppProviders } from "./contexts";
import { ErrorSink } from "./error-sink";
import { PerfSink } from "./perf-sink";
import { SwRegister } from "./sw-register";

/** 部署基路径（构建期 env 注入，与 next.config.ts basePath 同源；根基座为空串） */
const BASE = process.env.BASE_PATH?.replace(/\/+$/, "") || "";
/** PWA 静态资产 URL：Next 对 metadata 字符串 URL 不自动加 basePath，需显式前缀 */
const asset = (p: string) => `${BASE}${p}`;

/**
 * CSP 安全基线（P5-3，meta http-equiv 通道；frame-ancestors 在 meta 中被浏览器
 * 忽略故不声明，该维度交由部署侧响应头补齐）：
 * - 公共面：default-src 'self'（同源自给，与离线优先架构同构）
 * - script：prod 仅 self + 'unsafe-inline'（Next 静态导出的内联引导/Flight 数据）；
 *   dev 追加 'unsafe-eval'（Turbopack HMR 运行时需要）
 * - style：'unsafe-inline'（Tailwind 产物 + React 内联样式属性）
 * - img/font：self + data:（自托管 @fontsource、图标与内联位图）
 * - connect：prod self；dev 追加 ws:/wss:（HMR websocket）
 * - object/base/form：最小面收敛（none/self/self）
 */
const CSP_POLICY =
  process.env.NODE_ENV === "production"
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' ws: wss:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");

/** 品牌元数据（index.html + .figma/make/site.json 转录，P0 资产保全） */
export const metadata: Metadata = {
  title: "MiniMax-H3 DiffSynth 本地版 AI 数字人生产线 v2.1 PRO",
  description:
    "Professional local AI digital human video production platform offering a five-step closed-loop pipeline for creators and operators with high performance and data sovereignty.",
  manifest: asset("/manifest.webmanifest"),
  icons: {
    icon: [
      { url: asset("/yyc3-icons/Web%20App/favicon-16.png"), sizes: "16x16", type: "image/png" },
      { url: asset("/yyc3-icons/Web%20App/favicon-32.png"), sizes: "32x32", type: "image/png" },
      {
        url: asset("/yyc3-icons/Web%20App/android-chrome-192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: asset("/yyc3-icons/Web%20App/android-chrome-512.png"),
        sizes: "512x512",
        type: "image/png",
      },
      { url: asset("/yyc3-icons/favicon.png") },
    ],
    apple: [
      {
        url: asset("/yyc3-icons/Web%20App/apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  // site.json robots.index=false 语义保留（本地优先隐私基线，P0 转录）
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1628",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark">
      {/* P5-3 CSP 安全基线：React 19 原生 hoist meta 至 head（静态导出无响应头通道） */}
      <meta httpEquiv="Content-Security-Policy" content={CSP_POLICY} />
      <body
        data-app-root
        className="bg-[#0a1628] text-[#e8f0f8] font-sans antialiased overflow-hidden selection:bg-[#00e0b8]/30 selection:text-[#00e0b8]"
      >
        <SwRegister />
        <ErrorSink />
        <PerfSink />
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
