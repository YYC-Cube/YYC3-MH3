/**
 * file: src/app/layout.tsx
 * description: App Router 根布局 · 品牌元数据 + 全局样式 + SW 注册挂载
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[layout],[metadata],[rsc]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Vite index.html + Figma site.json 品牌资产转录唯一承接点（05 清单 §1.1/§〇）：
 *   - title/description/icons/manifest 自 index.html 与 site.json 逐字对齐
 *   - robots noindex：site.json robots.index=false 隐私语义接管（配合 public/robots.txt）
 *   - 全局样式与 @fontsource 自托管字体经 "@/index.css" 注入（无外部 CDN，offline-guard 红线）
 *
 * dependencies: next (Metadata/Viewport 类型), ./app-shell, ./contexts, ./sw-register, @/index.css
 * exports: default (RootLayout), metadata, viewport
 */
import type { Metadata, Viewport } from "next";

import "@/index.css";
import { AppShell } from "./app-shell";
import { AppProviders } from "./contexts";
import { SwRegister } from "./sw-register";

/** 品牌元数据（index.html + .figma/make/site.json 转录，P0 资产保全） */
export const metadata: Metadata = {
  title: "MiniMax-H3 DiffSynth 本地版 AI 数字人生产线 v2.1 PRO",
  description:
    "Professional local AI digital human video production platform offering a five-step closed-loop pipeline for creators and operators with high performance and data sovereignty.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/yyc3-icons/Web%20App/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/yyc3-icons/Web%20App/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/yyc3-icons/Web%20App/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { url: "/yyc3-icons/Web%20App/android-chrome-512.png", sizes: "512x512", type: "image/png" },
      { url: "/yyc3-icons/favicon.png" },
    ],
    apple: [
      {
        url: "/yyc3-icons/Web%20App/apple-touch-icon.png",
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
      <body className="bg-[#0a1628] text-[#e8f0f8] font-sans antialiased overflow-hidden selection:bg-[#00e0b8]/30 selection:text-[#00e0b8]">
        <SwRegister />
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
