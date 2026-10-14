/**
 * file: src/components/common/Slider.tsx
 * description: YYC³ 基础通用组件 — Slider
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
 * brief: YYC³ 基础通用组件 — Slider
 *
 * dependencies: react
 * exports: SliderProps, Slider
 */
import React from "react"

export interface SliderProps {
  label?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  unit?: string
  hint?: string
}

export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = "",
  hint,
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100),
  )

  return (
    <div className="w-full space-y-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {label && <span className="font-medium text-[#8b949e]">{label}</span>}
          {hint && <span className="text-[11px] text-[#5a6268]">({hint})</span>}
        </div>
        <div className="font-mono text-xs px-2 py-0.5 rounded bg-[#122340] border border-[#30363d] text-[#00d4aa] font-semibold">
          {value}
          {unit}
        </div>
      </div>
      <div className="relative flex items-center h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#122340] rounded-lg appearance-none cursor-pointer focus:outline-none accent-[#00d4aa]"
          style={{
            background: `linear-gradient(to right, #00d4aa 0%, #00d4aa ${percentage}%, #122340 ${percentage}%, #122340 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#5a6268] font-mono">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
