/**
 * file: scripts/check-obs.ts
 * description: YYC³ 可观测汇聚端本地实证链 — Loki push→检索 + Prometheus scrape→查询
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [observability],[loki],[prometheus],[e2e],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-2 出口的真实汇聚端佐证（禁止"单测绿即出口通"）— 六步闭环：
 *   [1/6] docker compose up（deploy/observability：Loki 13100 + Prometheus 19090，仅回环）
 *   [2/6] 就绪探测（/ready、/-/ready）
 *   [3/6] registry-server @4174 起服 + BFF 流量 + /api/metrics/prometheus 直读校验
 *   [4/6] lokiSink push（固定 traceId 结构化日志，经真实 HTTP 到 Loki）
 *   [5/6] Loki query_range 按 traceId 检索命中
 *   [6/6] Prometheus api/v1/query 断言 yyc3_platform_cpu_util_percent 有样本
 * finally: registry 进程回收 + compose down -v（无残留）。
 * 任何一步失败即非零退出（门禁语义）。
 *
 * run: pnpm check:obs（tsx scripts/check-obs.ts）
 * dependencies: ../src/adapters/lokiSink, ../src/types, node:child_process
 */

import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createLokiSink } from "../src/adapters/lokiSink";
import type { LogEntry } from "../src/types";

const ROOT = resolve(import.meta.dirname, "..");
/* 端口取 13100/19090：宿主机可能已有自建 Loki/Prometheus 长驻栈占用 3100/9090 */
const LOKI = "http://127.0.0.1:13100";
const PROM = "http://127.0.0.1:19090";
const REGISTRY = "http://127.0.0.1:4174";
const TRACE = `obs-chain-${Date.now()}`;
const TSX_BIN = join(ROOT, "node_modules", ".bin", "tsx");

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** 带超时的运行命令（stdio 透传，返回退出码；超时 kill 返回 124） */
function run(cmd: readonly string[], timeoutMs: number): Promise<number> {
  return new Promise((resolveCode) => {
    const child = spawn(cmd[0]!, cmd.slice(1), { cwd: ROOT, stdio: "inherit" });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolveCode(124);
    }, timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolveCode(code ?? 1);
    });
  });
}

/** 轮询等待远端就绪（ok() 返回 true 即通过） */
async function waitFor(name: string, url: string, ok: (res: Response) => Promise<boolean>, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let last = "never";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      last = `http ${res.status}`;
      if (await ok(res)) return;
    } catch (error) {
      last = error instanceof Error ? error.message : "error";
    }
    await sleep(1000);
  }
  throw new Error(`等待 ${name} 超时（最后状态: ${last}）`);
}

/* ---- Loki / Prometheus 响应最小形状（仅取断言所需字段） ---- */
interface LokiQueryRangeResult {
  status?: string;
  data?: { result?: Array<{ values?: unknown[] }> };
}
interface PromQueryResult {
  status?: string;
  data?: { result?: unknown[] };
}

let registry: ChildProcess | null = null;
let upDone = false;

try {
  console.log(`[1/6] docker compose up（deploy/observability）`);
  if ((await run(["docker", "compose", "-f", "deploy/observability/docker-compose.yml", "up", "-d", "--wait"], 480_000)) !== 0) {
    throw new Error("docker compose up 失败（确认 Docker Desktop 已启动）");
  }
  upDone = true;

  console.log(`[2/6] 就绪探测 Loki /ready + Prometheus /-/ready`);
  await waitFor("Loki", `${LOKI}/ready`, async (r) => r.status === 200 && (await r.text()).includes("ready"), 60_000);
  await waitFor("Prometheus", `${PROM}/-/ready`, (r) => Promise.resolve(r.status === 200), 60_000);

  console.log(`[3/6] registry-server @4174 起服 + BFF 流量 + scrape 直读`);
  if (!existsSync(TSX_BIN)) throw new Error("node_modules/.bin/tsx 不存在 — 先 pnpm install");
  registry = spawn(TSX_BIN, ["server/registry-server.ts"], { cwd: ROOT, stdio: "inherit" });
  await waitFor("registry-server", `${REGISTRY}/api/services`, (r) => Promise.resolve(r.status === 200), 30_000);
  const scrape = await fetch(`${REGISTRY}/api/metrics/prometheus`);
  const scrapeText = await scrape.text();
  const sampleLines = scrapeText.split("\n").filter((l) => l.startsWith("yyc3_platform_")).length;
  if (scrape.status !== 200 || sampleLines === 0) {
    throw new Error(`/api/metrics/prometheus 异常: http ${scrape.status}，yyc3_platform_* 样本 ${sampleLines} 条`);
  }
  console.log(`      scrape 直读 OK: ${sampleLines} 条 yyc3_platform_* 样本`);

  console.log(`[4/6] lokiSink push（traceId=${TRACE}）`);
  const sink = createLokiSink({
    enabled: true,
    endpoint: `${LOKI}/loki/api/v1/push`,
    labels: { app: "yyc3-mh3", source: "obs-chain-check" },
  });
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level: "info",
    stage: "佐证链",
    message: "check-obs 端到端实证条目",
    traceId: TRACE,
  };
  const pushed = await sink.push([entry]);
  if (!pushed.ok || pushed.pushed !== 1) {
    throw new Error(`Loki push 失败: ${pushed.reason ?? `pushed=${pushed.pushed}`}`);
  }
  console.log(`      push OK（1 条）`);

  console.log(`[5/6] Loki query_range 按 traceId 检索`);
  const query = `{app="yyc3-mh3", source="obs-chain-check"} |= "${TRACE}"`;
  let lokiHits = 0;
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${LOKI}/loki/api/v1/query_range?query=${encodeURIComponent(query)}&limit=10&since=10m`);
    const data = (await res.json()) as LokiQueryRangeResult;
    lokiHits = (data.data?.result ?? []).reduce((n, s) => n + (s.values?.length ?? 0), 0);
    if (lokiHits > 0) break;
    await sleep(1000);
  }
  if (lokiHits === 0) throw new Error("Loki 检索未命中 traceId（push 或索引链路断）");
  console.log(`      Loki OK: 命中 ${lokiHits} 行`);

  console.log(`[6/6] Prometheus api/v1/query 断言 yyc3_platform_cpu_util_percent`);
  let promSamples = 0;
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${PROM}/api/v1/query?query=${encodeURIComponent("yyc3_platform_cpu_util_percent")}`);
    const data = (await res.json()) as PromQueryResult;
    promSamples = data.data?.result?.length ?? 0;
    if (promSamples > 0) break;
    await sleep(2000);
  }
  if (promSamples === 0) throw new Error("Prometheus 无 yyc3_platform_cpu_util_percent 样本（scrape 链路断）");
  console.log(`      Prometheus OK: ${promSamples} 条样本`);

  console.log(`\nPASS ✓ 佐证链闭环：push→Loki 检索 + scrape→Prometheus 查询 全通（traceId=${TRACE}）`);
} finally {
  if (registry) registry.kill();
  if (upDone) {
    console.log(`[cleanup] docker compose down -v`);
    await run(["docker", "compose", "-f", "deploy/observability/docker-compose.yml", "down", "-v", "--remove-orphans"], 120_000);
  }
}
