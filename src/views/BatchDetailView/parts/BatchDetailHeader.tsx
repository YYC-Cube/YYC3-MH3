/**
 * file: src/views/BatchDetailView/parts/BatchDetailHeader.tsx
 * description: YYC³ 功能视图 — BatchDetailView 顶部标题栏与操作/导出下拉区
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 顶部头栏（返回 / 批次标识 / NAS 归档 / 导出复盘报告下拉 / 重新生成），
 *        逐字搬移自原 BatchDetailView.tsx（Requirement 2.1）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: BatchDetailHeaderProps, BatchDetailHeader
 */
import { Archive, ArrowLeft, ChevronDown, Download, FileText, RotateCcw } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import { BatchItem, NavigateExtra, NavTabId } from "../../../types";

export interface BatchDetailHeaderProps {
  currentBatch: BatchItem;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  isExportOpen: boolean;
  onToggleExport: () => void;
  onCloseExport: () => void;
}

export const BatchDetailHeader: React.FC<BatchDetailHeaderProps> = ({
  currentBatch,
  onNavigate,
  onShowToast,
  isExportOpen,
  onToggleExport,
  onCloseExport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2f47]">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => onNavigate("workbench", { batchId: currentBatch.id })}
        >
          返回工作台
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-[#00e0b8]">{currentBatch.id}</span>
            <Badge variant="brand">{currentBatch.mode}</Badge>
            <span className="text-xs text-[#8a97a8]">· Seed: {currentBatch.seed}</span>
          </div>
          <h1 className="text-base font-semibold text-[#e8f0f8] mt-0.5">{currentBatch.name}</h1>
        </div>
      </div>

      {/* Action Controls & Export Dropdown (Requirement 2.1) */}
      <div className="flex items-center gap-2 relative">
        <Button
          variant="secondary"
          size="sm"
          icon={<Archive className="w-3.5 h-3.5" />}
          onClick={() =>
            onShowToast("success", "已归档至本地 NAS", `归档路径: /nas/archive/${currentBatch.id}`)
          }
        >
          NAS 归档
        </Button>

        {/* Export Dropdown */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            iconRight={<ChevronDown className="w-3.5 h-3.5" />}
            onClick={onToggleExport}
          >
            导出复盘报告
          </Button>

          {isExportOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-xl bg-[#0c1a30] border border-[#1e2f47] shadow-xl p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95 backdrop-blur-md">
              <button
                onClick={() => {
                  onShowToast("success", "PDF 格式生产质量全量报告已导出");
                  onCloseExport();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#e8f0f8] hover:bg-[#15294a] hover:text-[#00e0b8] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>导出为 PDF 报告</span>
              </button>
              <button
                onClick={() => {
                  onShowToast("success", "Markdown 格式报告与参数已导出");
                  onCloseExport();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#e8f0f8] hover:bg-[#15294a] hover:text-[#00e0b8] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>导出为 Markdown</span>
              </button>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={() => {
            onNavigate("workbench", { batchId: currentBatch.id });
            onShowToast("info", "已在工作台载入当前批次配置");
          }}
        >
          基于此重新生成
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
