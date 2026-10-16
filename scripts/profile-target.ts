/**
 * file: scripts/profile-target.ts
 * description: YYC³ clinic 剖析目标 — Registry BFF 纯核合成负载（真实代码路径）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [profile],[clinic],[bff],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-3 剖析例行化的负载目标 — 以真实 registry 纯函数核
 *        （handleWebRequest）为剖析对象，混入读路由与 POST /api/seeds
 *        状态写入（真实分配路径，堆剖析可见）。零网络：直接构造
 *        Web 标准 Request 调用纯核，时长由 PROFILE_DURATION_MS 控制
 *        （默认 10s）。clinic doctor/flame 经 tsx 包裹本文件运行。
 *
 * run: pnpm profile:target | pnpm profile:clinic（doctor）/ --flame（flame）
 * dependencies: ../server/routeHandler
 */

import { handleWebRequest } from "../server/routeHandler";

/** 剖析时长（ms，默认 10s；clinic 例行化保持短平快） */
const durationMs = Number(process.env.PROFILE_DURATION_MS ?? 10_000);

/** 回环 Host 头（undici Request 不隐式携带 Host；registryApi 门禁按 Host 判回环） */
const HOST_HEADER = "127.0.0.1:4174";

/** 读路由样本（覆盖列表/过滤/详情三类真实查询面） */
const readRoutes: Array<() => Request> = [
  () => new Request("http://127.0.0.1:4174/api/services", { headers: { host: HOST_HEADER } }),
  () =>
    new Request("http://127.0.0.1:4174/api/metrics?from=10%3A00&to=10%3A30", {
      headers: { host: HOST_HEADER },
    }),
  () => new Request("http://127.0.0.1:4174/api/alarms?resolved=false", { headers: { host: HOST_HEADER } }),
  () => new Request("http://127.0.0.1:4174/api/logs?level=info", { headers: { host: HOST_HEADER } }),
  () =>
    new Request("http://127.0.0.1:4174/api/batches/BATCH-20250412-089", {
      headers: { host: HOST_HEADER },
    }),
];

/** POST /api/seeds 写入样本（数组前插 + 深拷贝回包，真实分配热点） */
let seedSeq = 0;
function postSeed(): Request {
  const seq = seedSeq++;
  return new Request("http://127.0.0.1:4174/api/seeds", {
    method: "POST",
    headers: { host: HOST_HEADER, "content-type": "application/json" },
    body: JSON.stringify({
      id: `seed-profile-${seq}`,
      name: `剖析种子 #${seq}`,
      seedNumber: 90000000 + (seq % 1_000_000),
      tier: "standard",
      params: { profile: "soak", seq },
    }),
  });
}

async function main(): Promise<void> {
  const start = Date.now();
  let ops = 0;
  let httpErrors = 0;
  while (Date.now() - start < durationMs) {
    const make = ops % 6 === 5 ? postSeed : readRoutes[ops % readRoutes.length]!;
    const response = await handleWebRequest(make());
    const text = await response.text();
    if (response.status >= 400) httpErrors++;
    ops++;
    if (text.length < 0) break; // 恒假：防止 text 未读被判定为死代码
  }
  const elapsed = Date.now() - start;
  console.log(
    JSON.stringify({
      profile: "registry-bff-synthetic",
      durationMs: elapsed,
      ops,
      httpErrors,
      opsPerSec: Math.round((ops / elapsed) * 1000),
    }),
  );
}

void main();
