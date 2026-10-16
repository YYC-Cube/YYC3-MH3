/**
 * file: src/components/navigation/Sidebar/parts/SidebarFooter.tsx
 * description: YYC³ 导航分区 — Sidebar 页脚本地状态（数据主权 + 端口/显存）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[part],[sidebar],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 Sidebar 逐字提取的页脚本地状态 JSX（零重设计）。
 *
 * dependencies: react, ../../../../kernel/config, lucide-react
 * exports: SidebarFooterProps, SidebarFooter
 */
import { ShieldCheck } from "lucide-react";
import React from "react";
import { APP_PORT } from "../../../../kernel/config";

export interface SidebarFooterProps {
  collapsed: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ collapsed }) => {
  return (
    <div className="p-3 border-t border-[#30363d] bg-[#071425]/70">
      {!collapsed ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-[#8b949e]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4aa]" />
              本地优先数据主权
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30">
              100% 离线可用
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-mono">
            <span>本地预览 :{APP_PORT}</span>
            <span>VRAM 19.4/24G</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center" title="本地数据安全保障 · 100%离线可用">
          <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
