/**
 * file: src/app/sw-register.tsx
 * description: PWA Service Worker 注册组件 · basePath 感知（main.tsx 职责迁出）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[pwa],[service-worker],[client]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: Vite → Next 16 迁移：原 src/main.tsx 内 SW 注册逻辑迁出（05 清单 §1.4）：
 *   - 仅生产构建注册（dev 避开 HMR 通道，语义与原 import.meta.env.PROD 等价）
 *   - NEXT_PUBLIC_BASE_PATH 支撑子路径基座（deploy.yml 与 BASE_PATH 同步注入）；
 *     注册失败静默降级，不阻塞应用（原契约保留）
 *
 * dependencies: react
 * exports: SwRegister
 */
"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {
      /* SW 注册失败不阻塞应用 */
    });
  }, []);

  return null;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
