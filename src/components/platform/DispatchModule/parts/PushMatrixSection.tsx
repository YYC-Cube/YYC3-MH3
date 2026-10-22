/**
 * file: src/components/platform/DispatchModule/parts/PushMatrixSection.tsx
 * description: YYC³ 平台分区 — DispatchModule 多平台账号矩阵分发看板（推送作业表）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[platform],[part],[dispatch],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 DispatchModule「一键推送与分发矩阵」逐字提取的看板 JSX（零重设计）。
 *
 * dependencies: react, ../../../common, ../../PlatformBadge, ../../../../types, lucide-react
 * exports: PushMatrixSectionProps, PushMatrixSection
 */
import { RefreshCw, Send } from "lucide-react";
import React from "react";
import type { PushTaskItem, ShowToast } from "../../../../types";
import { Button, Card } from "../../../common";
import { PlatformBadge } from "../../PlatformBadge";

export interface PushMatrixSectionProps {
  pushTasks: PushTaskItem[];
  onNewPushClick: () => void;
  onShowToast: ShowToast;
}

export const PushMatrixSection: React.FC<PushMatrixSectionProps> = ({ pushTasks, onNewPushClick, onShowToast }) => {
  return (
    <Card
      title="多平台账号矩阵分发看板 (Multi-Platform Matrix Push)"
      subtitle="支持一键推送到本地 NAS、云端存储与多平台分发 (抖音/视频号/B站/快手/小红书)"
      action={
        <Button variant="primary" size="xs" icon={<Send className="w-3.5 h-3.5" />} onClick={onNewPushClick}>
          新建推送作业
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
              <th className="py-2.5 px-3">作业ID / 成片标题</th>
              <th className="py-2.5 px-3">对应批次</th>
              <th className="py-2.5 px-3">目标分发渠道</th>
              <th className="py-2.5 px-3">推送账号</th>
              <th className="py-2.5 px-3">传输进度</th>
              <th className="py-2.5 px-3">实时速率</th>
              <th className="py-2.5 px-3">预计剩余</th>
              <th className="py-2.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2f47]/50">
            {pushTasks.map((task) => (
              <tr key={task.id} className="hover:bg-[#15294a]/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-mono text-[#00e0b8] font-bold">{task.id}</div>
                  <div className="text-[#e8f0f8] font-medium truncate max-w-xs">{task.title}</div>
                </td>
                <td className="py-3 px-3 font-mono text-[#8a97a8]">{task.batchId}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {task.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-[#e8f0f8]">{task.targetAccount}</td>
                <td className="py-3 px-3 w-40">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className={task.status === "completed" ? "text-[#00e0b8]" : "text-[#8a97a8]"}>
                        {task.status === "completed" ? "已完成" : "传输中"}
                      </span>
                      <span className="text-[#00e0b8] font-bold">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00e0b8] h-full transition-all" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[#00b4d8]">{task.speed}</td>
                <td className="py-3 px-3 font-mono text-[#8a97a8]">{task.estRemaining}</td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => onShowToast("info", `已查看推送日志: ${task.id}`)}
                    >
                      日志
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onShowToast("success", `已重新分发作业: ${task.id}`)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
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
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
