/**
 * file: src/__tests__/module-size-guard.test.ts
 * description: 组件体积门禁 · P3 上帝模块防回归（单文件 ≤300 行，视图/组件容器 ≤150 行）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[guard],[module-size],[god-module],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P3 上帝模块解构的持久闸门（boundary-guard 同型静态检查）：
 *       —— 全仓源码单文件 ≤300 行（防巨型模块回潮，审计 A/B-2 归零后锁定）；
 *       —— 视图 / 组件入口容器（目录式 `index.tsx`）≤150 行（强制编排壳薄化）。
 *       阈值超标即失败，并输出违规文件与行数清单；含抽查自证与扫描量下限断言，
 *       防止守卫空转（扫描不到文件时仍误判通过）。
 *
 * dependencies: node:fs, node:path, vitest
 * exports: —
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_ROOT = path.resolve(__dirname, ".."); // …/src
const PROJECT_ROOT = path.dirname(SRC_ROOT);
const SCAN_EXT = /\.(ts|tsx)$/;

/** 单文件行数上限（P3 验收：无 >300 行巨型模块） */
const MAX_FILE_LINES = 300;
/** 视图 / 组件入口容器行数上限（编排壳必须薄） */
const MAX_CONTAINER_LINES = 150;

/** 递归收集源码文件（排除测试目录与既有夹具） */
function collect(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "__tests__" || e.name === "node_modules") continue;
      collect(p, out);
    } else if (SCAN_EXT.test(e.name)) out.push(p);
  }
  return out;
}

/** 行数统计（与 wc -l 对齐：末尾换行不计入额外空行） */
function lineCount(absPath: string): number {
  const content = fs.readFileSync(absPath, "utf8");
  const lines = content.split("\n");
  return content.endsWith("\n") ? lines.length - 1 : lines.length;
}

/** 判定是否为「视图 / 组件入口容器」：views 或 components 下任意深度的目录式 index.tsx */
function isEntryContainer(absPath: string): boolean {
  const rel = path.relative(SRC_ROOT, absPath).split(path.sep);
  if (rel.length < 3) return false; // 至少 views/X/index.tsx
  const layer = rel[0];
  if (layer !== "views" && layer !== "components") return false;
  return rel[rel.length - 1] === "index.tsx";
}

/** 纯函数判定（供自证用例）：超限返回 true */
function exceeds(absPath: string, lines: number): boolean {
  if (lines > MAX_FILE_LINES) return true;
  return isEntryContainer(absPath) && lines > MAX_CONTAINER_LINES;
}

describe("[module-size-guard] P3 上帝模块防回归 · 体积上限", () => {
  const files = collect(SRC_ROOT);

  it("扫描量下限：应覆盖实质数量源码文件（防守卫空转）", () => {
    expect(files.length).toBeGreaterThan(150);
  });

  it("判定器自证：样例超限判定正确（防阈值写反恒放行）", () => {
    const fakeView = path.join(SRC_ROOT, "views", "Fake", "index.tsx");
    const fakePart = path.join(SRC_ROOT, "views", "Fake", "parts", "Big.tsx");
    expect(exceeds(fakeView, MAX_CONTAINER_LINES + 1)).toBe(true);
    expect(exceeds(fakeView, MAX_CONTAINER_LINES)).toBe(false);
    expect(exceeds(fakePart, MAX_FILE_LINES + 1)).toBe(true);
    expect(exceeds(fakePart, MAX_CONTAINER_LINES + 1)).toBe(false);
  });

  it("全仓源码单文件 ≤300 行，且视图/组件容器 ≤150 行", () => {
    const violations: string[] = [];
    for (const file of files) {
      const lines = lineCount(file);
      if (exceeds(file, lines)) {
        const kind = isEntryContainer(file) ? "容器" : "单文件";
        violations.push(`${path.relative(PROJECT_ROOT, file)}: ${lines} 行（${kind}超限）`);
      }
    }
    expect(
      violations,
      [
        `组件体积超限（P3 红线：单文件 ≤${MAX_FILE_LINES} 行 / 容器 ≤${MAX_CONTAINER_LINES} 行）：`,
        ...violations,
      ].join("\n"),
    ).toEqual([]);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
