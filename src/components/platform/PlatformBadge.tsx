/**
 * file: src/components/platform/PlatformBadge.tsx
 * description: YYC³ 平台组件 — 分发平台徽章（展示 meta 单一来源）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[platform],[badge]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 分发平台徽章 — SocialPlatformKey → 展示名/配色的映射与渲染
 *
 * dependencies: react, ../../types
 * exports: PLATFORM_BADGE_META, PlatformBadge
 */
import { SocialPlatformKey } from "../../types";

/** 平台展示元数据（展示名 + 配色），覆盖全部 SocialPlatformKey 联合成员 */
export const PLATFORM_BADGE_META: Record<SocialPlatformKey, { label: string; color: string }> = {
  douyin: {
    label: "抖音",
    color: "bg-[#ff0050]/15 text-[#ff0050] border-[#ff0050]/30",
  },
  channels: {
    label: "视频号",
    color: "bg-[#07c160]/15 text-[#07c160] border-[#07c160]/30",
  },
  bilibili: {
    label: "B站",
    color: "bg-[#00aeec]/15 text-[#00aeec] border-[#00aeec]/30",
  },
  kuaishou: {
    label: "快手",
    color: "bg-[#ff5000]/15 text-[#ff5000] border-[#ff5000]/30",
  },
  redbook: {
    label: "小红书",
    color: "bg-[#ff2442]/15 text-[#ff2442] border-[#ff2442]/30",
  },
  nas: {
    label: "本地NAS",
    color: "bg-[#00e0b8]/15 text-[#00e0b8] border-[#00e0b8]/30",
  },
  cloud: {
    label: "云端存储",
    color: "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30",
  },
};

export function PlatformBadge({ platform }: { platform: SocialPlatformKey }) {
  const item = PLATFORM_BADGE_META[platform] ?? {
    label: platform,
    color: "bg-[#15294a] text-[#8a97a8]",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${item.color}`}>
      {item.label}
    </span>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
