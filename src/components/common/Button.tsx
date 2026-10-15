/**
 * file: src/components/common/Button.tsx
 * description: YYC³ 基础通用组件 — Button
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
 * brief: YYC³ 基础通用组件 — Button
 *
 * dependencies: react, lucide-react
 * exports: ButtonProps, Button
 */
import { Loader2 } from "lucide-react";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "purple";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  disabled,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none rounded-[6px] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-[#071425] active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer";

  const sizeClasses = {
    xs: "text-xs px-2.5 py-1 gap-1.5 h-7",
    sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
    md: "text-sm px-4 py-2 gap-2 h-9",
    lg: "text-sm px-5 py-2.5 gap-2.5 h-11",
  }[size];

  const variantClasses = {
    primary:
      "bg-[#00d4aa] hover:bg-[#00b894] text-[#071425] font-semibold hover:shadow-[0_0_16px_rgba(0,212,170,0.35)] focus:ring-[#00d4aa]",
    secondary:
      "bg-[#122340] hover:bg-[#182e54] text-[#e6edf3] border border-[#30363d] hover:border-[#00d4aa]/50 focus:ring-[#00b4d8]",
    outline:
      "bg-transparent hover:bg-[#122340]/60 text-[#00d4aa] border border-[#00d4aa]/60 hover:border-[#00d4aa] focus:ring-[#00d4aa]",
    danger:
      "bg-[#EE4C2C] hover:bg-[#d9381e] text-white hover:shadow-[0_0_16px_rgba(238,76,44,0.35)] focus:ring-[#EE4C2C]",
    ghost:
      "bg-transparent hover:bg-[#122340] text-[#8b949e] hover:text-[#e6edf3] focus:ring-[#30363d]",
    purple:
      "bg-[#9B59B6] hover:bg-[#8e44ad] text-white hover:shadow-[0_0_16px_rgba(155,89,182,0.35)] focus:ring-[#9B59B6]",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
