/**
 * file: public/sw.js
 * description: YYC³ PWA Service Worker · 静态资源离线缓存（图标/字体/构建产物 cache-first）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [pwa],[service-worker],[offline]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief:
 *   - 安装期仅预缓存 manifest 与品牌图标（体量可控、必命中）
 *   - /api/*（Registry BFF 实时遥测）一律直连，禁止缓存 —— 降级语义依赖实时性（06 契约 §4）
 *   - 导航请求直连网络：保证 index.html 始终最新，hash 产物 URL 变更即取新缓存
 *   - 静态资源（yyc3-icons / 字体 / js / css / png 等）cache-first，失败回退缓存
 */

const CACHE = "yyc3-static-v1"
const PRECACHE = ["/manifest.webmanifest", "/yyc3-icons/favicon.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Registry BFF 实时数据面：禁缓存（06 契约 §4 降级/恢复留痕依赖实时响应）
  if (url.pathname.startsWith("/api/")) return
  // Vite dev/HMR 通道不拦截（SW 仅生产注册，此行为双保险）
  if (url.pathname.startsWith("/@") || url.pathname.startsWith("/node_modules"))
    return
  // 导航文档直连：确保新构建的 hash 引用即时生效
  if (req.mode === "navigate") return

  const isStatic =
    url.pathname.startsWith("/yyc3-icons/") ||
    /\.(png|svg|webp|ico|woff2?|css|js|json|webmanifest)$/.test(url.pathname)
  if (!isStatic) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req)
      if (hit) return hit
      try {
        const res = await fetch(req)
        if (res && res.ok) cache.put(req, res.clone())
        return res
      } catch {
        return hit || Response.error()
      }
    }),
  )
})

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
