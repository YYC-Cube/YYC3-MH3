#!/usr/bin/env node
/**
 * file: scripts/check-lighthouse.mjs
 * description: YYC³ lighthouse CI 门禁 — 生产产物四类审计 + Best Practices 验证 meta CSP
 * author: YanYuCloudCube Team
 * version: v1.2.0
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
 *      JSON 报告归档 reports/lighthouse/<ts>.report.json
 *   5) 门禁（第八批 ② 实测基线：perf 0.73→0.89，LCP 6.4s→3.1s，延迟水合加载器
 *      scripts/delay-hydration.mjs 剔除首绘窗口内 558KB JS；报告
 *      reports/lighthouse/2026-10-16T14-00-52.report.json）：
 *      performance ≥ 0.85（第八批达成 0.89 定标，防回归）
 *      accessibility ≥ 0.9（实测满分 1.0，锁定）
 *      best-practices ≥ 0.9（实测满分 1.0，含 csp-xss=1 —— meta CSP 第三方佐证）
 *      seo 不设门禁（内部工具，仅观测记录）
 *      摘要 JSON 落 reports/lighthouse/<ts>.summary.json
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
const GATE = { performance: 0.85, accessibility: 0.9, "best-practices": 0.9 };
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

  const child = spawn(
    LH_BIN,
    [
      URL,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      /* v13 对显式 --output-path 按字面路径写出（实测无自动后缀），故带全后缀 */
      `--output-path=${reportPrefix}.report.json`,
      "--quiet",
      `--port=${DEBUG_PORT}`,
    ],
    { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] },
  );

  child.stderr.on("data", (chunk) => {
    stderrTail = `${stderrTail}${chunk}`.split("\n").slice(-8).join("\n");
  });

  exitCode = await new Promise((resolveCode) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolveCode(124);
    }, 240_000);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolveCode(code ?? 1);
    });
  });
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

const report = JSON.parse(readFileSync(`${reportPrefix}.report.json`, "utf8"));
const categories = report.categories ?? {};
const scores = Object.fromEntries(
  ["performance", "accessibility", "best-practices", "seo"].map((k) => [k, categories[k]?.score ?? null]),
);
const cspAudit = report.audits?.["csp-xss"] ?? null;
const summary = {
  generated_at: STAMP,
  url: URL,
  chrome: "playwright chromium (remote-debugging-port=9333)",
  scores,
  csp_xss: cspAudit
    ? { score: cspAudit.score, displayValue: cspAudit.displayValue ?? null, title: cspAudit.title }
    : null,
  gate: GATE,
  report: `reports/lighthouse/${STAMP}.report.json`,
};
writeFileSync(join(REPORT_DIR, `${STAMP}.summary.json`), `${JSON.stringify(summary, null, 2)}\n`);

console.log(
  Object.entries(scores)
    .map(([k, v]) => `${k}: ${v === null ? "n/a" : (v * 10).toFixed(0)}`)
    .join("  "),
);
if (cspAudit) console.log(`csp-xss: score=${cspAudit.score} ${cspAudit.displayValue ?? ""}`.trimEnd());
console.log(`报告: reports/lighthouse/${STAMP}.report.json`);

const failed = Object.entries(GATE).filter(([k, min]) => (scores[k] ?? 0) < min);
if (failed.length > 0) {
  console.error(`[lighthouse] 门禁未过: ${failed.map(([k, min]) => `${k} < ${min}`).join(", ")}`);
  process.exit(1);
}
console.log("PASS ✓ lighthouse 门禁通过");
