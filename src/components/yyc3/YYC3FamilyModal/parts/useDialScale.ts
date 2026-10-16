/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/useDialScale.ts
 * description: YYC³ AI Family 协同组件 — 表盘自适应缩放 Hook
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[hook],[scale],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 表盘自适应缩放 — 经 ResizeObserver 测量容器可用宽高，对 520 基准表盘做等比缩放。
 *
 * dependencies: react
 * exports: useDialScale
 */
import type { RefObject } from "react";
import { useEffect, useState } from "react";

/**
 * 表盘自适应：测量容器可用宽高，对 520 基准表盘做等比缩放。
 * 表盘内部（成员环/SVG/中心圆）统一以 520 坐标系定位，整层 scale 保证
 * 移动端窄屏与全屏宽幅下均完整呈现且不破坏节点几何。
 */
export function useDialScale(ref: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setScale(Math.min(1, width / 520, height / 520));
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, enabled]);
  return scale;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
