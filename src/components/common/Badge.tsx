/**
 * file: src/components/common/Badge.tsx
 * description: YYC³ 基础通用组件 — Badge
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
 * brief: YYC³ 基础通用组件 — Badge
 *
 * dependencies: react
 * exports: BadgeProps, Badge
 */
import React from "react"

export interface BadgeProps {
  children: React.ReactNode
  variant?: "brand" | "info" | "purple" | "danger" | "warning" | "neutral"
  size?: "xs" | "sm" | "md"
  pulse?: boolean
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "brand",
  size = "sm",
  pulse = false,
  className = "",
}) => {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.2",
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  }[size]

  const variantClasses = {
    brand: "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30",
    info: "bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/30",
    purple: "bg-[#9B59B6]/15 text-[#9B59B6] border border-[#9B59B6]/35",
    danger: "bg-[#EE4C2C]/15 text-[#EE4C2C] border border-[#EE4C2C]/35",
    warning: "bg-[#f1c40f]/15 text-[#f1c40f] border border-[#f1c40f]/35",
    neutral: "bg-[#30363d]/40 text-[#8b949e] border border-[#30363d]",
  }[variant]

  const dotColor = {
    brand: "bg-[#00d4aa]",
    info: "bg-[#00b4d8]",
    purple: "bg-[#9B59B6]",
    danger: "bg-[#EE4C2C]",
    warning: "bg-[#f1c40f]",
    neutral: "bg-[#8b949e]",
  }[variant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}
          />
        </span>
      )}
      {children}
    </span>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
