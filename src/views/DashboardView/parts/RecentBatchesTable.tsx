/**
 * file: src/views/DashboardView/parts/RecentBatchesTable.tsx
 * description: YYC³ 功能视图 — DashboardView 近期批次任务列表（检索 + 状态筛选）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[dashboard],[table],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 第三行近期批次任务列表卡片（含批次ID/名称检索与操作列），
 *        状态徽标 getStatusBadge 本地闭包，逐字搬移自原 DashboardView.tsx（Row 3）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: RecentBatchesTableProps, RecentBatchesTable
 */
import { RotateCcw, Search } from "lucide-react";
import React from "react";
import { Badge, Button, Card } from "../../../components/common";
import { BatchItem, NavigateExtra, NavTabId } from "../../../types";

export interface RecentBatchesTableProps {
  batches: BatchItem[];
  filterQuery: string;
  onFilterQueryChange: (query: string) => void;
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onNewBatchClick: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const RecentBatchesTable: React.FC<RecentBatchesTableProps> = ({
  batches,
  filterQuery,
  onFilterQueryChange,
  onNavigate,
  onNewBatchClick,
  onShowToast,
}) => {
  const getStatusBadge = (status: BatchItem["status"]) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="brand" pulse>
            运行中
          </Badge>
        );
      case "completed":
        return <Badge variant="brand">已完成</Badge>;
      case "failed":
        return <Badge variant="danger">异常终止</Badge>;
      case "queued":
        return <Badge variant="warning">等待调度</Badge>;
      default:
        return <Badge variant="neutral">已暂停</Badge>;
    }
  };

  return (
    <Card
      title="近期批次任务列表 (Recent Batches)"
      subtitle="按创建时间倒序排列 · 支持快速检索与状态筛选"
      action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97a8]" />
            <input
              type="text"
              placeholder="筛选批次ID/名称..."
              value={filterQuery}
              onChange={(e) => onFilterQueryChange(e.target.value)}
              className="w-36 sm:w-44 h-7 pl-8 pr-2 rounded bg-[#15294a] text-xs text-[#e8f0f8] placeholder-[#8b949e] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
            />
          </div>

          <Button variant="outline" size="xs" onClick={() => onNavigate("nightly")}>
            夜间批量
          </Button>
          <Button variant="primary" size="xs" onClick={onNewBatchClick}>
            + 新建批次
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
              <th className="py-2.5 px-3">批次ID / 任务名称</th>
              <th className="py-2.5 px-3">模式</th>
              <th className="py-2.5 px-3">Seed 种子</th>
              <th className="py-2.5 px-3">状态 / 阶段</th>
              <th className="py-2.5 px-3">耗时 / 分辨率</th>
              <th className="py-2.5 px-3">5维评分</th>
              <th className="py-2.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2f47]/50">
            {batches.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-[#15294a]/40 transition-colors group cursor-pointer"
                onClick={() => onNavigate("workbench", { batchId: b.id })}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#0a1628] border border-[#1e2f47] overflow-hidden flex-shrink-0">
                      <img src={b.previewThumbnail} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-mono text-[#00e0b8] font-semibold text-xs group-hover:underline">{b.id}</div>
                      <div className="text-[#e8f0f8] font-medium truncate max-w-xs">{b.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono px-2 py-0.5 rounded bg-[#15294a] text-[#00b4d8] border border-[#1e2f47]">
                    {b.mode}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono text-[#e8f0f8]">{b.seed}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(b.status)}
                    <span className="text-[11px] text-[#8a97a8] font-mono">{b.progress}%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-mono text-[#e8f0f8]">{b.duration}</div>
                  <div className="text-[11px] text-[#8a97a8]">
                    {b.resolution} · {b.fps}fps
                  </div>
                </td>
                <td className="py-3 px-3">
                  {b.score > 0 ? (
                    <span
                      className={`font-mono font-bold text-xs ${
                        b.score >= 90 ? "text-[#00e0b8]" : b.score >= 80 ? "text-[#00b4d8]" : "text-[#ff7a45]"
                      }`}
                    >
                      {b.score} 分
                    </span>
                  ) : (
                    <span className="text-[#8b949e]">--</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="xs" onClick={() => onNavigate("batch-detail", { batchId: b.id })}>
                      复盘
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        onShowToast("info", `已加入重跑队列: ${b.id}`);
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
