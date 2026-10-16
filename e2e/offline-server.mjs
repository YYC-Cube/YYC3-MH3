/**
 * file: e2e/offline-server.mjs
 * description: YYC³ 离线 e2e 静态服务器 — 服务 out/ 生产产物（zero-dep，静态导出 Track B）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [e2e],[server],[offline],[preview]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-5 离线 e2e 供数 — next dev 不注册 SW（NODE_ENV 判定），
 *        离线可浏览必须对生产产物验证：本服务器以 node:http 静态服务
 *        out/（trailingSlash 目录索引 → index.html），供 playwright
 *        webServer 命令拉起（127.0.0.1:4173）。
 *
 * dependencies: node:http, node:fs, node:path
 * exports: —
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const OUT_DIR = "out";
/* 端口可经 OFFLINE_PORT 覆盖（默认 4173）：soak 长跑常驻 4173 时，
   lighthouse 等旁路验证用独立端口并行，互不干扰 */
const PORT = Number(process.env.OFFLINE_PORT ?? 4173);

/** 常见静态类型表 */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    // trailingSlash 导出形态：目录路径 → index.html
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (rel === "" || rel.endsWith("/")) rel += "index.html";
    const file = normalize(join(OUT_DIR, rel));
    if (!file.startsWith(OUT_DIR)) throw new Error("path traversal");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[offline-e2e] serving ${OUT_DIR}/ at http://127.0.0.1:${PORT}`);
});
