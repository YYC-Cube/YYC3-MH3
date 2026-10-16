/**
 * file: src/views/DashboardView/parts/AlarmBanner.tsx
 * description: YYC³ 功能视图 — DashboardView 全局告警聚合提示横幅
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[dashboard],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 全局告警聚合提示横幅（脉动边框 + 下钻运维大屏），
 *        逐字搬移自原 DashboardView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: AlarmBannerProps, AlarmBanner
 */
import { ShieldAlert } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { NavigateExtra, NavTabId } from "../../../types";

export interface AlarmBannerProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({ onNavigate }) => {
  return (
    <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#ff7a45]/50 flex items-center justify-between gap-4 text-xs animate-in fade-in shadow-[0_0_16px_rgba(255,122,69,0.12)]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7a45] opacity-50" />
          <ShieldAlert className="w-5 h-5 text-[#ff7a45] flex-shrink-0" />
        </div>
        <div>
          <span className="font-semibold text-[#e8f0f8]">全局告警聚合提示：</span>
          <span className="text-[#8a97a8]">
            检测到 1 处瞬时显存超标警告 (批次 086 峰值 22.8GB)，已由看门狗降级保护。
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="danger" size="xs" onClick={() => onNavigate("ops")}>
          下钻运维自愈大屏
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
