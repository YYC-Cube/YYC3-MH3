/**
 * file: server/routeHandler.ts
 * description: Registry API Route Handler 薄壳 — Web 标准 Request/Response 适配（框架无关，Track A 即插）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [server],[bff],[route-handler],[nextjs]
 * category: server
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P4 / §1.3 —— 原 vite.config.ts registryApiPlugin 中间件薄壳的
 *        Next 形态承接（Request/Response 转换逻辑全量等价迁移）：
 *   - handleWebRequest(req)：Web 标准 Request → RegistryRequest（method/path/query/body/host
 *     提取，body 容错 JSON.parse）→ createRegistryApi 纯函数处理 → JSON Response
 *   - 回环校验（06 §1.1）由 registryApi.handleRequest 内部执行 —— 薄壳透传 Host 头即可
 *   - 装配约定（Track A / Node 运行时轨启用时）：
 *       // app/api/[...registry]/route.ts
 *       import { handleWebRequest } from "@/server/routeHandler";
 *       export { handleWebRequest as GET, handleWebRequest as POST, handleWebRequest as PATCH };
 *     （Track B 静态导出与 API Route 互斥 —— 05 清单 §3.2，故本文件独立于 app/ 目录）
 *   - dev 过渡态：Track B 下 dev server 无 /api 桥接，local 适配器 404 → not_found
 *     → memory 降级（降级状态机既有机能，P1 已验证无白屏）
 *
 * dependencies: ./registryApi
 * exports: handleWebRequest
 */
import { createRegistryApi } from "./registryApi";

/** BFF 处理器模块级单例（与原 Vite 插件 configureServer 期单例语义一致） */
const api = createRegistryApi();

/**
 * Web 标准请求适配薄壳：
 * GET/HEAD 无体直转；其余方法读文本并容错 JSON.parse（失败为 undefined，由处理器校验）。
 */
export async function handleWebRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  let body: unknown;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const raw = await req.text();
    if (raw.length > 0) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = undefined;
      }
    }
  }

  const result = api.handleRequest({
    method: req.method,
    path: url.pathname,
    query: url.searchParams,
    body,
    host: req.headers.get("host") ?? "",
  });

  return new Response(JSON.stringify(result.json), {
    status: result.status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
