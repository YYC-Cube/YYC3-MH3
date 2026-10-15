/**
 * file: src/components/common/Card.tsx
 * description: YYC³ 基础通用组件 — Card
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
 * brief: YYC³ 基础通用组件 — Card
 *
 * dependencies: react
 * exports: CardProps, Card
 */
import React from "react";

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  glow?: boolean;
  className?: string;
  bodyClassName?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  badge,
  action,
  glow = false,
  className = "",
  bodyClassName = "",
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg transition-all duration-200 ease-out border ${
        glow ? "glass-panel-glow" : "glass-panel"
      } ${
        hoverable
          ? "hover:border-[#00d4aa]/40 hover:bg-[#0e2038] hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)] cursor-pointer"
          : ""
      } ${className}`}
    >
      {(title || action || badge) && (
        <div className="px-4 py-3 border-b border-[#30363d]/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {typeof title === "string" ? (
              <h3 className="text-sm font-semibold text-[#e6edf3] tracking-wide truncate">
                {title}
              </h3>
            ) : (
              title
            )}
            {badge}
            {subtitle && (
              <span className="text-xs text-[#8b949e] font-normal truncate">{subtitle}</span>
            )}
          </div>
          {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
