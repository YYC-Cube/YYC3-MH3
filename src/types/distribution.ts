/**
 * file: src/types/distribution.ts
 * description: YYC³ 类型契约 — 推送域（渠道 / 推送任务 / 回执）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[distribution],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 推送域契约 — 社交渠道键 / 推送任务项 / 平台回执
 *
 * dependencies: —
 * exports: SocialPlatformKey, PushTaskItem, PlatformWebhookReceipt
 */

// Platform Management Types
export type SocialPlatformKey = "douyin" | "channels" | "bilibili" | "kuaishou" | "redbook" | "nas" | "cloud";

export interface PushTaskItem {
  id: string;
  title: string;
  batchId: string;
  platforms: SocialPlatformKey[];
  status: "queued" | "transferring" | "completed" | "failed";
  progress: number;
  speed: string;
  estRemaining: string;
  targetAccount: string;
  scheduledTime?: string;
  retryCount: number;
}

export interface PlatformWebhookReceipt {
  id: string;
  platform: SocialPlatformKey;
  targetAccount: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  conversionRate: string;
  lastSyncTime: string;
  sentimentScore: number;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
