/**
 * file: src/components/common/Tabs.tsx
 * description: YYC³ 基础通用组件 — TabItem
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
 * brief: YYC³ 基础通用组件 — TabItem
 *
 * dependencies: react
 * exports: TabItem, TabsProps, Tabs
 */
import React from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  variant?: "line" | "pills";
  size?: "sm" | "md";
  className?: string;
}

/** 泛型组件（id 类型贯通 tabs→activeTab→onChange，消除调用侧类型断言） */
export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = "line",
  className = "",
}: TabsProps<T>) {
  if (variant === "pills") {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-[#122340]/90 rounded-lg border border-[#30363d] ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#00d4aa] text-[#071425] font-semibold shadow-sm"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#182e54]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-[#071425]/20 text-[#071425]" : "bg-[#071425] text-[#8b949e]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-6 border-b border-[#30363d] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 pb-2.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
              isActive ? "text-[#00d4aa] font-semibold" : "text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-[#00d4aa]/20 text-[#00d4aa]" : "bg-[#122340] text-[#8b949e]"
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.6)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
