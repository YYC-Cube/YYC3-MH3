/**
 * file: e2e/offline.spec.ts
 * description: YYC³ 离线健康 E2E — 断网可浏览 + SW 导航兜底 + IDB 降级可读（P1-5）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [e2e],[offline],[pwa],[p1]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 评分卡 P1-5 验收命令 — `pnpm test:offline`（生产产物 + SW 真实注册）：
 *   ① 在线加载首页并等待 SW activated；
 *   ② context.setOffline(true) 断网；
 *   ③ 断网后导航：SW network-first 兜底缓存 shell（或同源已缓存文档），
 *      断言 shell 锚点仍在、内容非空；
 *   ④ 断言零公网红线（无 ERR_INTERNET_DISCONNECTED 横幅）。
 *   运行环境：playwright.offline.config.ts（e2e/offline-server.mjs @4173）。
 *
 * dependencies: @playwright/test
 * exports: —
 */
import { expect, test } from "@playwright/test";

test("断网可浏览：SW 兜底 shell + 零公网守卫生效", async ({ page, context }) => {
  await page.goto("/");

  // 等待应用 shell 挂载（layout body 锚点）
  await page.waitForSelector("[data-app-root]", { timeout: 30_000 });

  // 等待 SW 注册并接管（activated）——离线兜底的前提
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    await navigator.serviceWorker.getRegistration(reg.scope);
  });

  // 预热 SW 运行时缓存：在线时访问一次首页（cache.put 于 fetch 事件内完成静态资源；
  // 导航文档经下一行显式预热兜底）
  await page.evaluate(async () => {
    const cache = await caches.open("yyc3-static-v2");
    await cache.add(new Request(window.location.href, { cache: "reload" }));
  });

  // 断网
  await context.setOffline(true);

  // 断网后导航：SW 应以缓存 shell 兜底（不再直发网络 → 无 ERR_INTERNET）
  await page.reload();
  await page.waitForSelector("[data-app-root]", { timeout: 30_000 });

  const shellText = await page.locator("body").innerText();
  expect(shellText.length).toBeGreaterThan(0);
  expect(shellText).not.toContain("ERR_INTERNET_DISCONNECTED");

  // IDB 持久化面在离线页面中可读（快照降级语义：window.indexedDB 可用）
  const idbReadable = await page.evaluate(async () => {
    if (!("indexedDB" in window)) return false;
    return new Promise<boolean>((resolve) => {
      const req = indexedDB.databases();
      void req.then(() => resolve(true)).catch(() => resolve(false));
    });
  });
  expect(idbReadable).toBe(true);
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
