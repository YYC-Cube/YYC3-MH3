/**
 * file: src/components/common/Select.tsx
 * description: YYC³ 基础通用组件 — SelectOption
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
 * brief: YYC³ 基础通用组件 — SelectOption
 *
 * dependencies: react, lucide-react
 * exports: SelectOption, SelectProps, Select
 */
import React from "react"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string | number
  label: string
  badge?: string
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  options: SelectOption[]
}

export const Select: React.FC<SelectProps> = ({
  label,
  hint,
  options,
  className = "",
  id,
  value,
  onChange,
  ...props
}) => {
  const selectId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[#8b949e]"
          >
            {label}
          </label>
          {hint && <span className="text-[11px] text-[#5a6268]">{hint}</span>}
        </div>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={`w-full h-9 pl-3 pr-8 text-sm rounded-[6px] bg-[#122340] text-[#e6edf3] border border-[#30363d] hover:border-[#3d444d] focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40 focus:outline-none transition-all duration-150 appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#0c1a30] text-[#e6edf3] py-1.5"
            >
              {opt.label} {opt.badge ? `(${opt.badge})` : ""}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b949e]">
          <ChevronDown className="w-4 h-4" />
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
