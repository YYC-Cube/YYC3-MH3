#!/usr/bin/env node
/**
 * file: scripts/check-lighthouse.mjs
 * description: YYC³ lighthouse CI 门禁 — 生产产物四类审计 + Best Practices 验证 meta CSP
 * author: YanYuCloudCube Team
 * version: v1.4.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [lighthouse],[ci],[csp],[quality-gate],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 佐证链（浏览器侧）— 静态导出 Track B 无响应头，CSP 由构建期
 *        注入的 meta 标签承载（scripts/harden-csp.mjs）；Lighthouse
 *        Best Practices 类目消费页面真实渲染结果，是 meta CSP 的独立
 *        第三方佐证。流程：
 *   1) 校验 out/ 存在（否则提示先 build）
 *   2) 拉起 e2e/offline-server.mjs @ 127.0.0.1:4173
 *   3) playwright 拉起 chromium 并开放 --remote-debugging-port=9333
 *      （沙箱实测：直接 spawn Chrome for Testing 会写系统 Crashpad
 *      目录被拦，且 --disable-crashpad/HOME 重定向均无效；playwright
 *      启动路径已被 e2e/soak 验证沙箱兼容，此处复用）
 *   4) lighthouse CLI --port=9333 附着该实例跑四类目
 *      （performance/accessibility/best-practices/seo），
 *      第十批 ① 起 **RUNS=3 串行取 median**（第九批实测 TBT 40–180ms 同构
 *      建波动 4.5 倍，主因 Lantern 模拟 CPU 降频下 Style & Layout 摆动
 *      0.34–0.96s；单次采样不足以支撑决策——门禁改 median-of-3 收敛），
 *      JSON 报告归档 reports/lighthouse/<ts>.run{1,2,3}.report.json
 *   5) 门禁（第九批实测基线：perf 0.89→0.95-0.96（3 连跑），LCP 3.1s→1.9-2.4s
 *      ≤2.5s good 线，可变字体 7→2 文件（162,794B→89,000B，-45.4%）；报告
 *      reports/lighthouse/2026-10-16T15-08-39.report.json）：
 *      performance ≥ 0.92（**median-of-3**；第九批达成 0.95-0.96 定标，防回归）
 *      total-blocking-time median ≤ 200ms（good 区上限，第十批 ① 新增；
 *      第九批实测区间 40–180ms，median 收敛后防交互性能回归）
 *      accessibility ≥ 0.9（**min-of-3**——正确性类目每次都必须达标；实测满分 1.0）
 *      best-practices ≥ 0.9（**min-of-3**；实测满分 1.0，含 csp-xss=1 —— meta CSP 第三方佐证）
 *      seo 不设门禁（内部工具，仅观测记录）
 *      摘要 JSON 落 reports/lighthouse/<ts>.summary.json（含逐跑分数+median）
 *
 * usage: pnpm check:lighthouse（先 pnpm build）
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const LH_BIN = join(ROOT, "node_modules", ".bin", "lighthouse");
/* 4175 独立端口：soak 长跑常驻 4173（playwright webServer reuseExistingServer
   会复用它），lighthouse 迭代在此端口自起自收，互不干扰 */
const SERVER_PORT = 4175;
const URL = `http://127.0.0.1:${SERVER_PORT}/`;
const DEBUG_PORT = 9333;
const GATE = { performance: 0.92, accessibility: 0.9, "best-practices": 0.9 };
/* 第十批 ①：TBT good 区上限（≤200ms）+ RUNS=3 median 门禁（波动收敛） */
const TBT_GATE_MS = 200;
const RUNS = 3;
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const REPORT_DIR = join(ROOT, "reports", "lighthouse");

/** 等待 offline-server 就绪（轮询 200） */
async function waitServerReady(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(URL);
      if (res.status === 200) return;
    } catch {
      /* 未就绪继续轮询 */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("offline-server 30s 内未就绪");
}

/** 等待 chromium 调试端口就绪（轮询 /json/version） */
async function waitDebuggerReady(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) return;
    } catch {
      /* 未就绪继续轮询 */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("chromium 调试端口 30s 内未就绪");
}

if (!existsSync(LH_BIN)) {
  console.error("[lighthouse] node_modules/.bin/lighthouse 不存在 — 先 pnpm install");
  process.exit(2);
}
if (!existsSync(join(ROOT, "out", "index.html"))) {
  console.error("[lighthouse] out/ 不存在 — 先 pnpm build 生成生产产物");
  process.exit(2);
}
mkdirSync(REPORT_DIR, { recursive: true });

const server = spawn(process.execPath, [join(ROOT, "e2e", "offline-server.mjs")], {
  cwd: ROOT,
  env: { ...process.env, OFFLINE_PORT: String(SERVER_PORT) },
  stdio: "ignore",
});

const reportPrefix = join(REPORT_DIR, STAMP);
let browser = null;
let exitCode = 1;
let stderrTail = "";

try {
  await waitServerReady();
  browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${DEBUG_PORT}`, "--no-sandbox", "--disable-dev-shm-usage"],
  });
  await waitDebuggerReady();

  for (let i = 1; i <= RUNS; i++) {
    const outPath = `${reportPrefix}.run${i}.report.json`;
    const child = spawn(
      LH_BIN,
      [
        URL,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json",
        /* v13 对显式 --output-path 按字面路径写出（实测无自动后缀），故带全后缀 */
        `--output-path=${outPath}`,
        "--quiet",
        `--port=${DEBUG_PORT}`,
      ],
      { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] },
    );

    let stderrChunk = "";
    child.stderr.on("data", (chunk) => {
      stderrChunk = `${stderrChunk}${chunk}`.split("\n").slice(-8).join("\n");
    });

    const code = await new Promise((resolveCode) => {
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolveCode(124);
      }, 240_000);
      child.on("close", (resolveClose) => {
        clearTimeout(timer);
        resolveCode(resolveClose ?? 1);
      });
    });
    if (code !== 0) {
      stderrTail = stderrChunk;
      exitCode = code;
      break;
    }
  }
  /* 全部 RUNS 成功才复位 0（失败分支已带码 break；v1.4.0 首版遗漏本行，
     三跑全绿却因初值 1 误报运行失败——回归门禁自证价值，测试须覆盖成功路径） */
  exitCode = 0;
} catch (err) {
  console.error(`[lighthouse] ${err instanceof Error ? err.message : String(err)}`);
  exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill();
}

if (exitCode !== 0) {
  if (stderrTail) console.error(stderrTail);
  console.error(`[lighthouse] 运行失败（exit ${exitCode}）`);
  process.exit(exitCode);
}

/* 逐跑解析 + median/min 聚合（第十批 ①：波动收敛） */
const runReports = [];
for (let i = 1; i <= RUNS; i++) {
  const p = `${reportPrefix}.run${i}.report.json`;
  if (!existsSync(p)) continue;
  const r = JSON.parse(readFileSync(p, "utf8"));
  runReports.push({
    report: `reports/lighthouse/${STAMP}.run${i}.report.json`,
    scores: Object.fromEntries(
      ["performance", "accessibility", "best-practices", "seo"].map((k) => [k, r.categories?.[k]?.score ?? null]),
    ),
    tbt_ms: r.audits?.["total-blocking-time"]?.numericValue ?? null,
  });
}
if (runReports.length === 0) {
  console.error("[lighthouse] 无可用报告产物");
  process.exit(1);
}

const median = (xs) => {
  const s = [...xs].filter((v) => v != null).sort((a, b) => a - b);
  if (s.length === 0) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const medPerf = median(runReports.map((r) => r.scores.performance));
const medTbt = median(runReports.map((r) => r.tbt_ms));
const minA11y = Math.min(...runReports.map((r) => r.scores.accessibility ?? 0));
const minBp = Math.min(...runReports.map((r) => r.scores["best-practices"] ?? 0));

const cspAudit = JSON.parse(readFileSync(`${reportPrefix}.run1.report.json`, "utf8")).audits?.["csp-xss"] ?? null;
const summary = {
  generated_at: STAMP,
  url: URL,
  chrome: "playwright chromium (remote-debugging-port=9333)",
  runs: runReports,
  median: { performance: medPerf, tbt_ms: medTbt },
  min: { accessibility: minA11y, "best-practices": minBp },
  csp_xss: cspAudit
    ? { score: cspAudit.score, displayValue: cspAudit.displayValue ?? null, title: cspAudit.title }
    : null,
  gate: {
    ...GATE,
    tbt_ms: TBT_GATE_MS,
    strategy: "performance/TBT=median-of-3; accessibility/best-practices=min-of-3",
  },
};
writeFileSync(join(REPORT_DIR, `${STAMP}.summary.json`), `${JSON.stringify(summary, null, 2)}\n`);

for (const [i, r] of runReports.entries()) {
  const line = Object.entries(r.scores)
    .map(([k, v]) => `${k}: ${v === null ? "n/a" : (v * 10).toFixed(0)}`)
    .join("  ");
  console.log(`run${i + 1}: ${line}  tbt: ${r.tbt_ms === null ? "n/a" : `${Math.round(r.tbt_ms)}ms`}`);
}
console.log(
  `median: performance ${(medPerf * 10).toFixed(0)}  tbt ${Math.round(medTbt)}ms  |  min: a11y ${(minA11y * 10).toFixed(0)}  bp ${(minBp * 10).toFixed(0)}`,
);
if (cspAudit) console.log(`csp-xss: score=${cspAudit.score} ${cspAudit.displayValue ?? ""}`.trimEnd());
console.log(`摘要: reports/lighthouse/${STAMP}.summary.json`);

const failed = [];
if ((medPerf ?? 0) < GATE.performance) {
  failed.push(`performance(median ${medPerf}) < ${GATE.performance}`);
}
if (medTbt == null || medTbt > TBT_GATE_MS) {
  failed.push(`total-blocking-time(median ${medTbt}ms) > ${TBT_GATE_MS}ms`);
}
if ((minA11y ?? 0) < GATE.accessibility) {
  failed.push(`accessibility(min ${minA11y}) < ${GATE.accessibility}`);
}
if ((minBp ?? 0) < GATE["best-practices"]) {
  failed.push(`best-practices(min ${minBp}) < ${GATE["best-practices"]}`);
}
if (failed.length > 0) {
  console.error(`[lighthouse] 门禁未过: ${failed.join(", ")}`);
  process.exit(1);
}
console.log(`PASS ✓ lighthouse 门禁通过（median-of-${runReports.length}）`);
