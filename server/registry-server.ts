/**
 * file: server/registry-server.ts
 * description: YYC³ Registry BFF HTTP 薄壳 — handleWebRequest 挂载宿主（佐证链）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [server],[bff],[prometheus],[observability],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-2/P2-3 汇聚端佐证链宿主 — 把纯函数核 handleWebRequest 挂到
 *        node:http @ 127.0.0.1:4174（仅回环，零公网守卫同口径）：
 *   - GET /api/metrics/prometheus → Prometheus 文本暴露（yyc3_platform_*，
 *     回环校验由 routeHandler 内建）
 *   - 其余 /api/* → registry BFF 契约路由
 * 供 scripts/check-obs.ts 拉起（tsx 运行）与 docker Prometheus scrape。
 *
 * run: tsx server/registry-server.ts（经 check:obs 编排；不直接暴露公网）
 * dependencies: ./routeHandler
 */

import { createServer, type IncomingMessage } from "node:http";
import { handleWebRequest } from "./routeHandler";

/** 仅绑定本地回环（与 06 §1.1 本地回环 only 同口径） */
const HOST = "127.0.0.1";
const PORT = 4174;

/** node:http IncomingMessage → Web 标准 Request（回环绝对 URL + 头规整 + 体聚合） */
async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Uint8Array));
  const body = Buffer.concat(chunks);
  return new Request(`http://${HOST}:${PORT}${req.url ?? "/"}`, {
    method,
    headers,
    body: hasBody && body.length > 0 ? new Uint8Array(body) : undefined,
  });
}

const server = createServer((req, res) => {
  void toWebRequest(req)
    .then((webReq) => handleWebRequest(webReq))
    .then(async (webRes) => {
      // 安全专项（第十批 ④）：响应头经 setHeader 官方 sink 逐条写入——
      // 不经动态 Record 索引中转（security/detect-object-injection 通过，
      // 且消除任意键名写入中间对象的模式面）
      webRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      res.writeHead(webRes.status);
      res.end(Buffer.from(await webRes.arrayBuffer()));
    })
    .catch((error: unknown) => {
      res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          error: { code: "INTERNAL", message: error instanceof Error ? error.message : "internal error" },
        }),
      );
    });
});

server.listen(PORT, HOST, () => {
  console.log(`[registry-server] http://${HOST}:${PORT}（Prometheus scrape /api/metrics/prometheus，仅回环）`);
});
