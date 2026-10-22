/**
 * file: src/domains/distribution/index.ts
 * description: YYC³ 推送域 — 渠道/账号发布规则（纯函数，零副作用零 UI 依赖）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [domain],[distribution],[channel],[publish],[pure]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 推送域规则 — 渠道标签 / 分发完成判定 / 按平台分组
 *
 * dependencies: ../../types
 * exports: SOCIAL_PLATFORMS, platformLabel, isDispatchComplete, groupTasksByPlatform
 */
import type { PushTaskItem, SocialPlatformKey } from "../../types";

/** 全部推送渠道键 — 全项目单一事实来源（分组与遍历共用） */
export const SOCIAL_PLATFORMS: readonly SocialPlatformKey[] = [
  "douyin",
  "channels",
  "bilibili",
  "kuaishou",
  "redbook",
  "nas",
  "cloud",
];

/** 渠道键 → 中文可读标签 */
const PLATFORM_LABELS: Readonly<Record<SocialPlatformKey, string>> = {
  douyin: "抖音",
  channels: "视频号",
  bilibili: "哔哩哔哩",
  kuaishou: "快手",
  redbook: "小红书",
  nas: "本地 NAS",
  cloud: "云端备份",
};

/** 渠道标签（推送/回执展示复用） */
export function platformLabel(key: SocialPlatformKey): string {
  return PLATFORM_LABELS[key];
}

/** 分发完成判定：存在至少一个任务且全部 completed 方视为完成 */
export function isDispatchComplete(tasks: readonly PushTaskItem[]): boolean {
  return tasks.length > 0 && tasks.every((task) => task.status === "completed");
}

/** 按渠道对推送任务分组（返回全渠道键齐备的分组表，空渠道为空数组） */
export function groupTasksByPlatform(tasks: readonly PushTaskItem[]): Record<SocialPlatformKey, PushTaskItem[]> {
  const grouped = Object.fromEntries(SOCIAL_PLATFORMS.map((key) => [key, [] as PushTaskItem[]])) as Record<
    SocialPlatformKey,
    PushTaskItem[]
  >;
  for (const task of tasks) {
    for (const platform of task.platforms) {
      grouped[platform].push(task);
    }
  }
  return grouped;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
