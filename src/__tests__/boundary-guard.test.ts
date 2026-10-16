/**
 * file: src/__tests__/boundary-guard.test.ts
 * description: 边界门禁 · 六域分层依赖静态检查（import 方向矩阵零越界 + 同层跨域禁引）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[guard],[boundary],[architecture],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 架构分层门禁（offline-guard 同型持久闸门）：
 *       依赖方向必须自上而下单向 —— 叶层（types/kernel）零内部依赖，
 *       domains/data 仅依赖 types(+kernel)，adapters 可及 domains/data，
 *       components/views 不得触达 adapters/app，app 为组合根唯一 DI 点（06 §4）。
 *       越界 import（含动态 import 与 re-export）、以及 domains/A → domains/B
 *       的同层跨域引用一律拦截。
 *
 *       分层矩阵（键 = 所在层，值 = 允许引用的内部层；同层互引天然放行）：
 *         types      → —                                 （叶：类型契约 barrel）
 *         kernel     → types                             （叶：常量配置 + 路由映射）
 *         domains    → types + kernel                    （纯域函数 + 出站端口）
 *         orchestrator → types + kernel + domains        （编排内核，PR-3；禁 data/adapters/UI）
 *         data       → types                             （静态演示快照）
 *         adapters   → types + kernel + domains + data   （memory/local 适配器）
 *         components → types + kernel + domains + data   （UI 区块，禁触 adapters/app/views）
 *         views      → components 及以下                 （页面编排壳，禁触 adapters/app）
 *         app        → 全内部层 + adapters + views + orchestrator（路由层挂载视图 + hooks 装配 + 组合根 + Agent 运行时装配）
 *
 *       域隔离铁律（roadmap §1.3）：domains/<域> 只依赖 kernel(types) 与本域，
 *       禁止直接引用其他 domains/<域>（跨域协作走 types 契约或平台事件端口）。
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

/** 分层根目录（目录层；kernel/config 为 kernel 层内单文件叶） */
const LAYER_DIRS: Readonly<Record<string, string>> = {
  types: "types",
  kernel: "kernel",
  domains: "domains",
  orchestrator: "orchestrator",
  data: "data",
  adapters: "adapters",
  components: "components",
  views: "views",
  app: "app",
};
const CONFIG_LEAF = path.join(SRC_ROOT, "kernel", "config.ts");

/** 六域根名（src/domains/<域>/** 归属判定；非六域命名的 domains 内文件归 "domains" 根） */
const DOMAIN_ROOTS: readonly string[] = [
  "production",
  "platform",
  "ai",
  "admin",
  "editing",
  "distribution",
];
const DOMAINS_DIR = path.join(SRC_ROOT, "domains");

/** 依赖方向矩阵：键 = 所在层，值 = 允许引用的内部层（跨层方向铁律，同层放行） */
const ALLOWED: Readonly<Record<string, readonly string[]>> = {
  types: [],
  // kernel：路由映射常量 + 端口注入（NavTabId ↔ href），仅引用 types 契约（无环，安全）
  kernel: ["types"],
  domains: ["types", "kernel"],
  // orchestrator：编排内核（PR-3）——可依 domains 纯规则与 kernel/types，
  // 禁触 data（agentId 校验经 AgentPort 供数）/adapters/UI 层（零 react/next/IO 原语）
  orchestrator: ["types", "kernel", "domains"],
  data: ["types"],
  adapters: ["types", "kernel", "domains", "data"],
  components: ["types", "kernel", "domains", "data"],
  views: ["types", "kernel", "domains", "data", "components"],
  // app：最上层装配（组合根 + agent-runtime）——orchestrator 五模块在 app 装配（PR-5）
  app: ["types", "kernel", "domains", "data", "components", "adapters", "views", "orchestrator"],
};

/** 判定单条依赖边是否越界（纯函数，供检测器自证用例） */
function isEdgeViolation(fromLayer: string, toLayer: string): boolean {
  return fromLayer !== toLayer && !ALLOWED[fromLayer]?.includes(toLayer);
}

/** TS 模块解析候选：显式扩展名 / 省略扩展名 / 目录 index（对齐 tsc 解析语义） */
function resolveCandidates(absPath: string): string[] {
  return [
    absPath,
    `${absPath}.ts`,
    `${absPath}.tsx`,
    path.join(absPath, "index.ts"),
    path.join(absPath, "index.tsx"),
  ];
}

/** 按路径解析所在层；未纳入分层的内部文件返回 null */
function layerOf(absPath: string): string | null {
  for (const cand of resolveCandidates(absPath)) {
    if (cand === CONFIG_LEAF) return "kernel";
    for (const [layer, dir] of Object.entries(LAYER_DIRS)) {
      const root = path.join(SRC_ROOT, dir);
      if (cand === root || cand.startsWith(root + path.sep)) return layer;
    }
  }
  return null;
}

/**
 * 解析 domains 内文件的归属域：
 * 命中六域根之一返回其名；domains 内非六域命名文件返回 "domains"；域外返回 null。
 */
function domainOf(absPath: string): string | null {
  for (const cand of resolveCandidates(absPath)) {
    if (cand === DOMAINS_DIR || cand.startsWith(DOMAINS_DIR + path.sep)) {
      const rel = path.relative(DOMAINS_DIR, cand);
      const seg = rel.split(path.sep)[0];
      if (seg && DOMAIN_ROOTS.includes(seg)) return seg;
      return "domains";
    }
  }
  return null;
}

/** 递归收集源码文件（排除测试目录） */
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

/** 提取文件内全部内部相对导入说明符（静态 import/export-from + 动态 import()） */
const STATIC_RE = /^\s*(?:import|export)\b[^;]*?from\s*["'](\.[^"']+)["']/gm;
const DYNAMIC_RE = /\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g;

function extractInternalSpecs(content: string): string[] {
  // 捕获组索引经 noUncheckedIndexedAccess 推断可空，静态正则组恒存在（既有约定：非空断言 + 中文注释）
  const capture = (m: RegExpMatchArray): string => m[1] as string;
  return [
    ...[...content.matchAll(STATIC_RE)].map(capture),
    ...[...content.matchAll(DYNAMIC_RE)].map(capture),
  ];
}

describe("[boundary-guard] 六域分层 · 依赖方向零越界", () => {
  const allFiles = collect(SRC_ROOT);
  const layeredFiles = allFiles
    .map((f) => ({ file: f, layer: layerOf(f) }))
    .filter((x): x is { file: string; layer: string } => x.layer !== null);
  const domainFiles = layeredFiles.filter((x) => x.layer === "domains");

  it("矩阵完备性：允许集与分层键一一对应（防新层遗漏失察）", () => {
    expect(Object.keys(ALLOWED).sort()).toEqual([...Object.keys(LAYER_DIRS)].sort());
  });

  it("检测器自证：样例边判定方向正确（防矩阵写反全禁或全放）", () => {
    // 违规样例：下层反向依赖上层
    expect(isEdgeViolation("domains", "app")).toBe(true);
    expect(isEdgeViolation("adapters", "components")).toBe(true);
    expect(isEdgeViolation("components", "views")).toBe(true);
    expect(isEdgeViolation("views", "app")).toBe(true);
    expect(isEdgeViolation("data", "domains")).toBe(true);
    // 违规样例：orchestrator 禁触 data/adapters/UI（PR-3 矩阵新增层）
    expect(isEdgeViolation("orchestrator", "data")).toBe(true);
    expect(isEdgeViolation("orchestrator", "adapters")).toBe(true);
    expect(isEdgeViolation("orchestrator", "app")).toBe(true);
    // 违规样例：kernel 叶层反向依赖
    expect(isEdgeViolation("kernel", "domains")).toBe(true);
    expect(isEdgeViolation("types", "kernel")).toBe(true);
    // 合法样例：自上而下单向依赖与同层互引
    expect(isEdgeViolation("app", "adapters")).toBe(false);
    expect(isEdgeViolation("views", "components")).toBe(false);
    expect(isEdgeViolation("adapters", "domains")).toBe(false);
    expect(isEdgeViolation("domains", "kernel")).toBe(false);
    expect(isEdgeViolation("orchestrator", "domains")).toBe(false);
    expect(isEdgeViolation("components", "components")).toBe(false);
  });

  it("应扫描到实质数量的分层文件与依赖边（防守卫空转）", () => {
    expect(layeredFiles.length).toBeGreaterThan(40);
    const edgeCount = layeredFiles.reduce(
      (n, x) => n + extractInternalSpecs(fs.readFileSync(x.file, "utf8")).length,
      0,
    );
    expect(edgeCount).toBeGreaterThan(50);
  });

  it("六域齐备：production/platform/ai/admin/editing/distribution 均有归属文件", () => {
    const detected = new Set(domainFiles.map((x) => domainOf(x.file)));
    for (const root of DOMAIN_ROOTS) {
      expect(detected.has(root), `缺失域根：${root}`).toBe(true);
    }
  });

  it("跨层 import 全量零越界（矩阵外方向一律拦截）", () => {
    const violations: string[] = [];
    for (const { file, layer } of layeredFiles) {
      const content = fs.readFileSync(file, "utf8");
      for (const spec of extractInternalSpecs(content)) {
        const resolved = path.resolve(path.dirname(file), spec);
        const target = layerOf(resolved);
        if (target !== null) {
          if (isEdgeViolation(layer, target)) {
            violations.push(
              `${path.relative(PROJECT_ROOT, file)}: ${spec} → ${layer} ⇒ ${target} 越界（矩阵见文件头）`,
            );
          }
        } else {
          violations.push(
            `${path.relative(PROJECT_ROOT, file)}: ${spec} → 引用未纳入六域分层的内部文件`,
          );
        }
      }
    }
    expect(
      violations,
      ["分层依赖越界（架构红线，见 docs/06 §4 组合根唯一 DI 点）：", ...violations].join("\n"),
    ).toEqual([]);
  });

  it("同层跨域禁引：domains/A 不得 import domains/B（A≠B，roadmap §1.3）", () => {
    const violations: string[] = [];
    for (const { file } of domainFiles) {
      const fromDomain = domainOf(file);
      const content = fs.readFileSync(file, "utf8");
      for (const spec of extractInternalSpecs(content)) {
        const resolved = path.resolve(path.dirname(file), spec);
        const toDomain = domainOf(resolved);
        if (fromDomain && toDomain && fromDomain !== toDomain) {
          violations.push(
            `${path.relative(PROJECT_ROOT, file)}: ${spec} → ${fromDomain} ⇒ ${toDomain} 跨域违规（跨域协作走 types 契约或平台事件端口）`,
          );
        }
      }
    }
    expect(
      violations,
      ["同层跨域引用违规（域隔离红线，见 roadmap §1.3）：", ...violations].join("\n"),
    ).toEqual([]);
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
