/**
 * file: src/components/common/Input.tsx
 * description: YYC³ 基础通用组件 — Input
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
 * brief: YYC³ 基础通用组件 — Input
 *
 * dependencies: react
 * exports: InputProps, Input
 */
import React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  mono?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      prefixIcon,
      suffixIcon,
      mono = false,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-[#8b949e]"
            >
              {label}
            </label>
            {hint && <span className="text-[11px] text-[#5a6268]">{hint}</span>}
          </div>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 pointer-events-none text-[#8b949e] flex items-center">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-9 px-3 text-sm rounded-[6px] bg-[#122340]/90 text-[#e6edf3] placeholder-[#5a6268] border transition-all duration-150 ease-out focus:outline-none ${
              error
                ? "border-[#EE4C2C] focus:border-[#EE4C2C] focus:ring-1 focus:ring-[#EE4C2C]/50"
                : "border-[#30363d] hover:border-[#3d444d] focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40"
            } ${prefixIcon ? "pl-9" : ""} ${suffixIcon ? "pr-9" : ""} ${
              mono ? "font-mono text-xs tracking-tight" : ""
            } ${className}`}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 pointer-events-none text-[#8b949e] flex items-center">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-[#EE4C2C] mt-1 flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
