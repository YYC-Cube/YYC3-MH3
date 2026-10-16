/**
 * file: src/types/common.ts
 * description: YYC³ 类型契约 — 通用 UI 契约（跨域共享原子类型）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [type],[contract],[common],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 通用 UI 契约 — 导航标识 / 跳转扩展 / 通知 / 媒体片段 / Toast：
 *        跨域共享原子类型统一收敛于此（跨域类型经 barrel 唯一事实源）
 *
 * dependencies: —
 * exports: NavTabId, NavigateExtra, NotificationItem, MediaClipItem, ToastType, ShowToast
 */

export type NavTabId =
  | "design-system"
  | "dashboard"
  | "workbench"
  | "batch-detail"
  | "seed"
  | "prompt"
  | "models"
  | "agent"
  | "platform"
  | "ops"
  | "nightly"
  | "docs"
  | "settings";

/**
 * 全局导航扩展参数：跨视图跳转时携带目标定位 ID。
 * 消费方：App.handleNavigate（当前收敛 batchId，seedId/docId 由后续视图选中逻辑消费）。
 */
export interface NavigateExtra {
  batchId?: string;
  seedId?: string;
  docId?: string;
}

export interface NotificationItem {
  id: string;
  type: "alarm" | "completed" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetTab?: NavTabId;
  targetId?: string;
}

export interface MediaClipItem {
  id: string;
  name: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  resolution: string;
  aspectRatio: string;
  audioAligned: boolean;
}

/** Toast 通知级别 */
export type ToastType = "success" | "error" | "warning" | "info";

/** 全局 Toast 触发契约（useToast 产出，视图 onShowToast 统一签名） */
export type ShowToast = (type: ToastType, message: string, subMessage?: string) => void;

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
