/**
 * file: next.config.ts
 * description: Next.js 16 构建配置 · 多基座部署 + GH Pages 静态导出（Track B）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [config],[build],[nextjs],[deploy]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Vite → Next 16 迁移 P1 骨架（05 清单 §3.1/§3.2）
 *   - basePath：CI 注入 BASE_PATH（GH Pages 子路径基座），自定义域留空 = 根基座——
 *     与原 vite.config.ts 三级解析链等价承接（Figma Make 宿主形态随 P0 归档退役）
 *   - output: "export" + trailingSlash：Track B 静态导出，保 mh3.yyc3.top 线上不断服；
 *     Track A（Node 运行时）保留为后续演进轨（05 清单 §3.2）
 *   - images.unoptimized：静态导出无图片优化服务端，Icons/占位图直出
 *
 * dependencies: next
 * exports: default (NextConfig)
 */
import type { NextConfig } from "next";

/** 部署基路径（尾斜杠归一；空串 = 根基座） */
const basePath = process.env.BASE_PATH?.replace(/\/+$/, "") || "";

const nextConfig: NextConfig = {
  // 多基座部署：自定义域（mh3.yyc3.top）根基座 / github.io 子路径基座双兼容
  basePath: basePath || undefined,
  // Track B：GH Pages 静态导出（产物 out/，含 public/ 下 CNAME / sw / manifest / robots）
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
