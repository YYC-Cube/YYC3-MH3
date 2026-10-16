/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/types.ts
 * description: YYC³ AI Family 协同组件 — YYC3FamilyModal 类型契约（动作负载/入参/消息）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[types],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: AI Family 浮窗契约层 — 可执行动作负载、浮窗入参与会话消息结构
 *
 * dependencies: —
 * exports: FamilyActionPayload, YYC3FamilyModalProps, ChatMessage
 */

/** AI Family 可执行动作负载（参数注入 / 种子载入），供 ChatMessage.actionable 与 onApplyAction 共用 */
export type FamilyActionPayload =
  | { guidanceScale: number; steps: number; denoiseStrength?: number }
  | { seedNumber: number };

export interface YYC3FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAction?: (actionType: string, payload?: FamilyActionPayload) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  agentName?: string;
  agentColor?: string;
  text: string;
  timestamp: string;
  actionable?: {
    label: string;
    actionType: string;
    payload?: FamilyActionPayload;
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
