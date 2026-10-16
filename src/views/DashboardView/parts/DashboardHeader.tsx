/**
 * file: src/views/DashboardView/parts/DashboardHeader.tsx
 * description: YYC³ 功能视图 — DashboardView 顶部欢迎栏与大屏模式切换区
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
 * brief: DashboardView 顶部标题 + 徽标 + 三大操作按钮（大屏投屏 / 显存整理 / 进入工作台），
 *        逐字搬移自原 DashboardView.tsx（Requirement 2.1）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: DashboardHeaderProps, DashboardHeader
 */
import { Cpu, Tv, Wrench } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { NavigateExtra, NavTabId } from "../../../types";

export interface DashboardHeaderProps {
  isBigScreenMode: boolean;
  onToggleBigScreenMode: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isBigScreenMode,
  onToggleBigScreenMode,
  onShowToast,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1
            className={`font-bold text-[#e8f0f8] tracking-tight ${
              isBigScreenMode ? "text-2xl" : "text-xl"
            }`}
          >
            总览驾驶舱 · Executive Cockpit
          </h1>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono shadow-[0_0_8px_rgba(0,224,184,0.2)]">
            7×24H 生产中枢在线
          </span>
        </div>
        <p className="text-xs text-[#8a97a8] mt-1">
          实时汇总 MiniMax-H3 推理管线性能、SyncNet 评分闭环与本地硬件负载
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Big screen projection mode switcher */}
        <Button
          variant={isBigScreenMode ? "primary" : "secondary"}
          size="sm"
          icon={<Tv className="w-3.5 h-3.5" />}
          onClick={onToggleBigScreenMode}
        >
          {isBigScreenMode ? "退出大屏视角" : "大屏投屏模式 (2K/4K)"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={<Wrench className="w-3.5 h-3.5 text-[#00e0b8]" />}
          onClick={() => {
            onShowToast("success", "显存整理完成", "已清理 2.8GB 冗余激活值缓存");
          }}
        >
          一键显存整理
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Cpu className="w-4 h-4" />}
          onClick={() => onNavigate("workbench")}
        >
          进入流水线工作台
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
