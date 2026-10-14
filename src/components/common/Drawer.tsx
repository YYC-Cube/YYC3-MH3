/**
 * file: src/components/common/Drawer.tsx
 * description: YYC³ 基础通用组件 — Drawer
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
 * brief: YYC³ 基础通用组件 — Drawer
 *
 * dependencies: react, lucide-react
 * exports: DrawerProps, Drawer
 */
import React, { useEffect } from "react"
import { X } from "lucide-react"

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "max-w-md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-[#071425]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${width} bg-[#0c1a30] border-l border-[#30363d] shadow-2xl flex flex-col transform transition ease-in-out duration-200`}
        >
          <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between">
            <div className="text-sm font-semibold text-[#e6edf3]">{title}</div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#122340] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">{children}</div>
          {footer && (
            <div className="px-5 py-3 border-t border-[#30363d] bg-[#071425]/60 flex items-center justify-end gap-2.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
