/**
 * file: src/views/WorkbenchView/parts/ModeActionBar.tsx
 * description: YYC³ 功能视图 — WorkbenchView 驱动模式切换与执行控制条
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 中栏驱动模式（Ref2VA / FL2VA）切换 + 启动/暂停/终止/保存模板按钮组，
 *        逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: ModeActionBarProps, ModeActionBar
 */
import { Bookmark, Pause, Play, Square } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { BatchMode } from "../../../types";

export interface ModeActionBarProps {
  mode: BatchMode;
  onModeChange: (mode: BatchMode) => void;
  isRunning: boolean;
  progress: number;
  onToggleRun: () => void;
  onTerminate: () => void;
  onSaveTemplate: () => void;
}

export const ModeActionBar: React.FC<ModeActionBarProps> = ({
  mode,
  onModeChange,
  isRunning,
  progress,
  onToggleRun,
  onTerminate,
  onSaveTemplate,
}) => {
  return (
    <div className="p-3 rounded-xl bg-[#0f1f38] border border-[#1e2f47] flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8a97a8]">驱动模式:</span>
        <div className="flex rounded-lg bg-[#15294a] p-0.5 border border-[#1e2f47]">
          <button
            onClick={() => onModeChange("Ref2VA")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              mode === "Ref2VA"
                ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                : "text-[#8a97a8] hover:text-[#e8f0f8]"
            }`}
          >
            Ref2VA (单图音画对齐)
          </button>
          <button
            onClick={() => onModeChange("FL2VA")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              mode === "FL2VA"
                ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                : "text-[#8a97a8] hover:text-[#e8f0f8]"
            }`}
          >
            FL2VA (关键帧长镜头)
          </button>
        </div>
      </div>

      {/* Execution Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={isRunning ? "danger" : "primary"}
          size="sm"
          icon={
            isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )
          }
          onClick={onToggleRun}
        >
          {isRunning
            ? "暂停生成 (Pause)"
            : progress >= 100
              ? "重新运行当前批次"
              : "启动生成 (Ctrl+Enter)"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={<Square className="w-3.5 h-3.5" />}
          onClick={onTerminate}
        >
          终止
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<Bookmark className="w-3.5 h-3.5" />}
          onClick={onSaveTemplate}
        >
          保存模板
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
