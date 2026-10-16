/**
 * file: src/views/OpsMonitorView/parts/LogStream.tsx
 * description: YYC³ 功能视图 — OpsMonitorView 值守大屏实时终端日志流
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[ops],[log],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 第四行值守大屏实时终端日志流（滚动开关 + 导出日志 + 分级高亮），
 *        逐字搬移自原 OpsMonitorView.tsx（Requirement 2.2）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: LogStreamProps, LogStream
 */
import { Download, Pause, Play } from "lucide-react";
import React from "react";
import { Button, Card } from "../../../components/common";
import { LogEntry } from "../../../types";

export interface LogStreamProps {
  logs: LogEntry[];
  isLogStreaming: boolean;
  onToggleLogStreaming: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const LogStream: React.FC<LogStreamProps> = ({
  logs,
  isLogStreaming,
  onToggleLogStreaming,
  onShowToast,
}) => {
  return (
    <Card
      title="值守大屏实时终端日志流 (Live Terminal Stream)"
      subtitle="按时间升序流式刷新 · 错误标红高亮"
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            icon={isLogStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            onClick={onToggleLogStreaming}
          >
            {isLogStreaming ? "暂停滚动" : "继续滚动"}
          </Button>
          <Button
            variant="secondary"
            size="xs"
            icon={<Download className="w-3 h-3" />}
            onClick={() => onShowToast("success", "全量运维日志已导出")}
          >
            导出日志
          </Button>
        </div>
      }
    >
      <div className="p-3 rounded-xl bg-[#071222] border border-[#1e2f47] font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 leading-relaxed">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-2 text-[11px]">
            <span className="text-[#8b949e]">{log.timestamp}</span>
            <span
              className={`px-1 rounded text-[10px] uppercase font-bold ${
                log.level === "error"
                  ? "bg-[#ff7a45]/20 text-[#ff7a45]"
                  : log.level === "warn"
                    ? "bg-[#ffb830]/20 text-[#ffb830]"
                    : "bg-[#00e0b8]/20 text-[#00e0b8]"
              }`}
            >
              {log.level}
            </span>
            <span className="text-[#8a97a8]">[{log.stage}]</span>
            <span className={log.level === "error" ? "text-[#ff7a45]" : "text-[#e8f0f8]"}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
