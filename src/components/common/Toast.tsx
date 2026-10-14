/**
 * file: src/components/common/Toast.tsx
 * description: YYC³ 基础通用组件 — ToastItem
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[ui],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 基础通用组件 — ToastItem
 *
 * dependencies: react, lucide-react
 * exports: ToastItem, ToastProps, ToastContainer
 */
import React from "react"
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react"

export interface ToastItem {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
  subMessage?: string
}

export interface ToastProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: (
            <CheckCircle2 className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
          ),
          error: (
            <AlertCircle className="w-4 h-4 text-[#EE4C2C] flex-shrink-0" />
          ),
          warning: (
            <AlertTriangle className="w-4 h-4 text-[#f1c40f] flex-shrink-0" />
          ),
          info: <Info className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />,
        }[toast.type]

        const borders = {
          success: "border-[#00d4aa]/40 shadow-[0_0_12px_rgba(0,212,170,0.2)]",
          error: "border-[#EE4C2C]/40 shadow-[0_0_12px_rgba(238,76,44,0.2)]",
          warning: "border-[#f1c40f]/40 shadow-[0_0_12px_rgba(241,196,15,0.2)]",
          info: "border-[#00b4d8]/40 shadow-[0_0_12px_rgba(0,180,216,0.2)]",
        }[toast.type]

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-[#0c1a30] border ${borders} backdrop-blur-md animate-in slide-in-from-top-2 duration-150`}
          >
            <div className="mt-0.5">{icons}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#e6edf3]">
                {toast.message}
              </p>
              {toast.subMessage && (
                <p className="text-[11px] text-[#8b949e] mt-0.5 leading-relaxed">
                  {toast.subMessage}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8b949e] hover:text-[#e6edf3] transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
