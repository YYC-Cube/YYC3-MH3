/**
 * file: src/views/WorkbenchView/parts/BatchQueuePanel.tsx
 * description: YYC³ 功能视图 — WorkbenchView 左栏批次任务队列面板
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
 * brief: WorkbenchView 左栏批次队列（筛选输入 + 批次卡片选中/运行态 + 快捷键提示），
 *        逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, lucide-react, ../../../types
 * exports: BatchQueuePanelProps, BatchQueuePanel
 */
import { Search } from "lucide-react";
import React from "react";
import { BatchItem } from "../../../types";

export interface BatchQueuePanelProps {
  batches: BatchItem[];
  currentBatchId: string;
  onSelectBatch: (id: string) => void;
}

export const BatchQueuePanel: React.FC<BatchQueuePanelProps> = ({
  batches,
  currentBatchId,
  onSelectBatch,
}) => {
  return (
    <div className="w-64 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-[#1e2f47] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#e8f0f8]">批次任务队列</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15294a] text-[#00e0b8] border border-[#1e2f47]">
          {batches.length} 批次
        </span>
      </div>

      <div className="p-2 border-b border-[#1e2f47]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97a8]" />
          <input
            type="text"
            placeholder="筛选批次ID或名称..."
            className="w-full h-7 pl-8 pr-2 rounded-md bg-[#15294a] text-xs text-[#e8f0f8] placeholder-[#8b949e] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {batches.map((b) => {
          const isSelected = b.id === currentBatchId;
          const isRunningCard = b.status === "running";

          return (
            <div
              key={b.id}
              onClick={() => onSelectBatch(b.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                isRunningCard
                  ? "card-running-shimmer bg-[#15294a]"
                  : isSelected
                    ? "bg-[#15294a] border-[#00e0b8] shadow-[0_0_12px_rgba(0,224,184,0.18)]"
                    : "bg-[#0f1f38] border-[#1e2f47] hover:border-[#294060]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-semibold text-[#00e0b8]">{b.id}</span>
                <span className="text-[10px] text-[#8a97a8] font-mono">{b.duration}</span>
              </div>
              <div className="text-xs font-medium text-[#e8f0f8] truncate mb-1.5">{b.name}</div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono px-1.5 py-0.2 rounded bg-[#0a1628] text-[#00b4d8] border border-[#1e2f47]">
                  {b.mode}
                </span>
                <span
                  className={`font-mono font-semibold ${
                    b.status === "running"
                      ? "text-[#00e0b8] animate-pulse"
                      : b.status === "completed"
                        ? "text-[#00e0b8]"
                        : b.status === "failed"
                          ? "text-[#ff7a45]"
                          : "text-[#ffb830]"
                  }`}
                >
                  {b.status === "running" ? `${b.progress}% 运行中` : b.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#1e2f47] bg-[#0a1628]/60 flex items-center justify-between text-[11px] text-[#8a97a8]">
        <span>提示: 双击直接载入参数</span>
        <kbd className="px-1.5 py-0.5 rounded bg-[#15294a] border border-[#1e2f47] text-[10px]">
          Ctrl+Enter
        </kbd>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
