#!/usr/bin/env node
/**
 * file: scripts/profile-archive.mjs
 * description: YYC³ 剖析例行化 — Node 原生 CPU/堆剖析 + 报告归档 reports/clinic/
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [profile],[cpu-prof],[heap-prof],[archive],[p2]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P2-3 剖析例行化入口 — 对 registry BFF 合成负载依次采集：
 *   1) --cpu-prof  → reports/clinic/<时间戳>-cpu.cpuprofile
 *   2) --heap-prof → reports/clinic/<时间戳>-heap.heapprofile
 * 产物为 V8 原生剖析格式，Chrome DevTools (Performance/ Memory) 与
 * VSCode 直接载入。选型记录：clinic doctor 批处理模式在本机环境静默
 * 无产出（--collect-only 同），故例行化走原生剖析器（2026-10-16）。
 * 退出码：任一产物缺失即 1（门禁语义）。
 *
 * usage: pnpm profile:prof（时长 PROFILE_DURATION_MS，默认 10s/剖析）
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const ARCHIVE_DIR = join(ROOT, "reports", "clinic");
const DURATION_MS = process.env.PROFILE_DURATION_MS ?? "10000";

mkdirSync(ARCHIVE_DIR, { recursive: true });

/** 隔离 IDE js-debug 注入（bootloader 会在剖析子进程上挂 inspector） */
const childEnv = { ...process.env };
delete childEnv.NODE_OPTIONS;
delete childEnv.VSCODE_INSPECTOR_OPTIONS;

const targets = [
  { flag: "--cpu-prof", name: `${STAMP}-cpu.cpuprofile` },
  { flag: "--heap-prof", name: `${STAMP}-heap.heapprofile` },
];

let failed = false;
for (const target of targets) {
  console.log(`[prof] 采集 ${target.flag} → reports/clinic/${target.name}`);
  const run = spawnSync(
    process.execPath,
    [
      target.flag,
      `${target.flag}-dir`,
      ARCHIVE_DIR,
      `${target.flag}-name`,
      target.name,
      "--import",
      "tsx",
      "scripts/profile-target.ts",
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...childEnv, PROFILE_DURATION_MS: DURATION_MS },
      timeout: 120_000,
    },
  );
  const artifact = join(ARCHIVE_DIR, target.name);
  const ok = run.error === undefined && run.status === 0 && existsSync(artifact);
  if (!ok) {
    console.error(`[prof] ${target.flag} 失败（exit ${run.status ?? run.error?.code ?? "?"}）`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`[prof] 归档完成: reports/clinic/${STAMP}-cpu.cpuprofile + ${STAMP}-heap.heapprofile`);
