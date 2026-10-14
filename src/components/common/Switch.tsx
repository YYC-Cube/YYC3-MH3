/**
 * file: src/components/common/Switch.tsx
 * description: YYC³ 基础通用组件 — Switch
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
 * brief: YYC³ 基础通用组件 — Switch
 *
 * dependencies: react
 * exports: SwitchProps, Switch
 */
import React from "react"

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer select-none ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div className="relative inline-flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out border ${
            checked
              ? "bg-[#00d4aa] border-[#00d4aa]"
              : "bg-[#122340] border-[#30363d]"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 mt-[2px] ml-[2px] rounded-full transition-transform duration-200 ease-in-out ${
              checked
                ? "translate-x-4 bg-[#071425]"
                : "translate-x-0 bg-[#8b949e]"
            }`}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-[#e6edf3]">{label}</span>
          )}
          {description && (
            <span className="text-[11px] text-[#8b949e]">{description}</span>
          )}
        </div>
      )}
    </label>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
