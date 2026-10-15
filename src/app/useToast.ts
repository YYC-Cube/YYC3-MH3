/**
 * file: src/app/useToast.ts
 * description: YYC³ 应用层 — 全局 Toast 通知 Hook（产出 ShowToast 契约）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [app],[hook],[toast]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 全局 Toast 通知 Hook — 队列状态 + 触发/关闭（4s 自动消退）
 *
 * dependencies: react, ../components/common/Toast, ../types
 * exports: useToast
 */
import { useState } from "react";
import { ToastItem } from "../components/common/Toast";
import { ShowToast } from "../types";

/** 首屏就绪演示通知（产品启动反馈，非领域数据） */
const INITIAL_READY_TOAST: ToastItem = {
  id: "init-toast",
  type: "success",
  message: "MiniMax-H3 本地数字人生产线 v2.1 PRO 已就绪",
  subMessage: "RTX 4090 显存已分配 19.4GB · 5步闭环流水线在线 · YYC³ AI协同已连接",
};

/** Toast 通知队列 + 触发/关闭（应用级单实例，由 App 装配下发） */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([INITIAL_READY_TOAST]);

  const showToast: ShowToast = (type, message, subMessage) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, subMessage }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, dismissToast };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
