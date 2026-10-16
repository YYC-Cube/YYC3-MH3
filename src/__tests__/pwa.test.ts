/**
 * file: src/__tests__/pwa.test.ts
 * description: PWA 与多端 logo 全链路测试 — manifest 完整性 / 图标实体存在 / SW 缓存守卫 / 引用链断言
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [test],[pwa],[logo],[offline]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 以工程产物（public/ 与 index.html）为事实源做静态断言，保证 PWA 安装面与多端图标引用不回归。
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");

describe("PWA · manifest.webmanifest 安装面", () => {
  const manifest = JSON.parse(
    readFileSync(resolve(ROOT, "public/manifest.webmanifest"), "utf8"),
  ) as {
    name: string;
    short_name: string;
    display: string;
    theme_color: string;
    icons: { src: string; sizes: string; purpose?: string }[];
  };

  it("具备可安装关键字段（name/short_name/display/theme_color）", () => {
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(manifest.short_name.length).toBeGreaterThan(0);
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("图标集覆盖 192 / 512 / maskable 三档", () => {
    const sizes = manifest.icons.map((i) => `${i.sizes}:${i.purpose ?? "any"}`);
    expect(sizes).toContain("192x192:any");
    expect(sizes).toContain("512x512:any");
    expect(sizes).toContain("512x512:maskable");
  });

  it("manifest 引用的每个图标文件均真实存在（decode %20 空格目录）", () => {
    for (const icon of manifest.icons) {
      const rel = decodeURIComponent(icon.src.replace(/^\//, ""));
      expect(existsSync(resolve(ROOT, "public", rel))).toBe(true);
    }
  });
});

describe("PWA · Service Worker 缓存守卫", () => {
  const sw = readFileSync(resolve(ROOT, "public/sw.js"), "utf8");

  it("/api 面（Registry BFF 实时遥测）禁止缓存", () => {
    expect(sw).toContain('"/api/"');
  });

  it("导航与 dev/HMR 通道直连，静态资源才 cache-first", () => {
    expect(sw).toContain('mode === "navigate"');
    expect(sw).toContain("/@");
    expect(sw).toContain("yyc3-icons");
  });
});

describe("多端 logo 全链路引用", () => {
  it("app/layout.tsx metadata：favicon 16/32 + apple-touch + manifest + robots noindex 齐备", () => {
    const layout = readFileSync(resolve(ROOT, "src/app/layout.tsx"), "utf8");
    expect(layout).toContain("/yyc3-icons/Web%20App/favicon-16.png");
    expect(layout).toContain("/yyc3-icons/Web%20App/favicon-32.png");
    expect(layout).toContain("/yyc3-icons/Web%20App/apple-touch-icon.png");
    // P5：manifest/icons 经 asset() 构造（Next 不为 metadata 字符串 URL 自动加 basePath）
    expect(layout).toContain('asset("/manifest.webmanifest")');
    expect(layout).toMatch(/robots.*index.*false/s);
    expect(layout).toMatch(/themeColor.*#0a1628/);
  });

  it("AI 浮窗双组件（Modal + Trigger）均引用统一品牌 logo", () => {
    const modal = readFileSync(
      resolve(ROOT, "src/components/yyc3/YYC3FamilyModal/parts/FamilyModalHeader.tsx"),
      "utf8",
    );
    const trigger = readFileSync(
      resolve(ROOT, "src/components/yyc3/YYC3FloatingTrigger.tsx"),
      "utf8",
    );
    expect(modal).toContain("/yyc3-icons/yyc3-logo.png");
    expect(trigger).toContain("/yyc3-icons/yyc3-logo.png");
  });

  it("robots.txt（原 site.json robots 语义接管）：全站 Disallow", () => {
    const robots = readFileSync(resolve(ROOT, "public/robots.txt"), "utf8");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Disallow: /");
  });

  it("SW 注册组件（main.tsx 职责迁出）：生产守卫 + basePath 感知", () => {
    const swRegister = readFileSync(resolve(ROOT, "src/app/sw-register.tsx"), "utf8");
    expect(swRegister).toContain('"use client"');
    expect(swRegister).toContain('NODE_ENV !== "production"');
    expect(swRegister).toContain("NEXT_PUBLIC_BASE_PATH");
  });

  it("品牌 logo 实体存在（favicon.png / yyc3-logo.png / logo.png）", () => {
    for (const f of ["favicon.png", "yyc3-logo.png", "logo.png"]) {
      expect(existsSync(resolve(ROOT, "public/yyc3-icons", f))).toBe(true);
    }
  });
});
