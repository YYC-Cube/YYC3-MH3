/**
 * file: src/app/useKeyboardShortcuts.ts
 * description: YYC³ 应用层 — 全局键盘快捷键 Hook（Ctrl/⌘ + B / K / /）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [app],[hook],[shortcut]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 全局键盘快捷键 Hook — 侧栏折叠 / 全局搜索 / YYC³ 协同
 *
 * dependencies: react
 * exports: useKeyboardShortcuts
 */
import { useEffect, useRef } from "react"

export interface ShortcutHandlers {
  onToggleSidebar: () => void
  onToggleSearch: () => void
  onToggleYYC3: () => void
}

/** 全局快捷键：Ctrl/⌘+B 折叠侧栏 · Ctrl/⌘+K 全局搜索 · Ctrl/⌘+/ YYC³ 协同 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  // ref 桥接：监听器全生命周期仅注册一次，且始终调用最新回调（防闭包过期）
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        handlersRef.current.onToggleSidebar()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        handlersRef.current.onToggleSearch()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        handlersRef.current.onToggleYYC3()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
