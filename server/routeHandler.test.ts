/**
 * file: server/routeHandler.test.ts
 * description: Route Handler 薄壳 HTTP 语义测试 — Request 提取 / 响应封包 / 回环透传（06 契约 §2/§5）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [test],[bff],[route-handler],[p4]
 * category: test
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P4 测试收尾 —— Web 标准薄壳层独立验证（纯函数层已由 registryApi.test.ts
 *        覆盖，此处聚焦 HTTP 语义：method/path/query/body 提取、JSON 响应头、
 *        Host 透传回环校验、PATCH 写路径、非法 body 容错）
 *
 * dependencies: vitest, ./routeHandler, ../src/data/*
 * exports: —
 */
import { describe, expect, it } from "vitest";
import { SYSTEM_ALARMS } from "../src/adapters/memory/fixtures/ops";
import { handleWebRequest } from "./routeHandler";

const LOOPBACK = "http://127.0.0.1:3031";

function makeGet(path: string, host = "127.0.0.1:3031"): Request {
  return new Request(`${LOOPBACK}${path}`, {
    method: "GET",
    headers: { host },
  });
}

describe("[routeHandler] Web 标准薄壳 · HTTP 语义", () => {
  it("GET /api/health → 200 + JSON + content-type 封包正确", async () => {
    const res = await handleWebRequest(makeGet("/api/health"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.status).toBe("online");
    expect(json.uptime).toMatch(/^\d+h \d+m \d+s$/);
  });

  it("GET 查询串透传（query 提取：resolved=xyz → 契约 400）", async () => {
    // alarms 的 resolved 参数仅接受 true/false（06 §2 #4）—— 400 即证 query 已达处理器
    const res = await handleWebRequest(makeGet("/api/alarms?resolved=xyz"));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("未知端点 → 404 + 契约错误封包（error.code/message）", async () => {
    const res = await handleWebRequest(makeGet("/api/not-exist"));
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error: { code: string; message: string } };
    expect(json.error.code).toBeTruthy();
    expect(json.error.message).toBeTruthy();
  });

  it("非回环 Host → 403（06 §1.1 回环 only，Host 头透传校验）", async () => {
    const res = await handleWebRequest(makeGet("/api/health", "192.168.1.50:3031"));
    expect(res.status).toBe(403);
  });

  it("PATCH /api/alarms/:id body {resolved:true} → 200 写路径生效", async () => {
    // 模块级单例持有告警态，先取初始 id
    const listRes = await handleWebRequest(makeGet("/api/alarms"));
    const alarms = (await listRes.json()) as { id: string; resolved: boolean }[];
    const target = alarms.find((a) => !a.resolved) ?? alarms[0]!;

    const res = await handleWebRequest(
      new Request(`${LOOPBACK}/api/alarms/${target.id}`, {
        method: "PATCH",
        headers: { host: "127.0.0.1:3031", "content-type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      }),
    );
    expect(res.status).toBe(200);

    // 回读验证写路径
    const after = await handleWebRequest(makeGet("/api/alarms"));
    const alarmsAfter = (await after.json()) as { id: string; resolved: boolean }[];
    expect(alarmsAfter.find((a) => a.id === target.id)?.resolved).toBe(true);
  });

  it("PATCH 非法 body（非 JSON）→ 400 容错（body 落 undefined 由处理器校验）", async () => {
    const res = await handleWebRequest(
      new Request(`${LOOPBACK}/api/alarms/alarm-001`, {
        method: "PATCH",
        headers: { host: "127.0.0.1:3031", "content-type": "text/plain" },
        body: "not-json",
      }),
    );
    expect(res.status).toBe(400);
  });
});

// 告警初始快照非空守卫（防夹具空转：上例至少存在一条告警可写）
if (SYSTEM_ALARMS.length === 0) throw new Error("告警快照为空，PATCH 用例夹具失效");

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
