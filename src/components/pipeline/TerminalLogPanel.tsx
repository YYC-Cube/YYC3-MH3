/**
 * file: src/components/pipeline/TerminalLogPanel.tsx
 * description: YYC³ 五步闭环流水线组件 — TerminalLogPanel
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[pipeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 五步闭环流水线组件 — TerminalLogPanel
 *
 * dependencies: react, ../../types, lucide-react
 * exports: TerminalLogPanelProps, TerminalLogPanel
 */
import {
  AlertTriangle,
  ArrowDown,
  Search,
  Terminal,
  Trash2,
  Wrench,
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { LogEntry } from "../../types"

export interface TerminalLogPanelProps {
  logs: LogEntry[]
  onClear?: () => void
  onTroubleshootFix?: (actionType: string) => void
  className?: string
}

export const TerminalLogPanel: React.FC<TerminalLogPanelProps> = ({
  logs,
  onClear,
  onTroubleshootFix,
  className = "",
}) => {
  const [levelFilter, setLevelFilter] =
    useState<"all" | "info" | "warn" | "error" | "success">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== "all" && log.level !== levelFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        log.message.toLowerCase().includes(q) ||
        log.stage.toLowerCase().includes(q) ||
        log.timestamp.includes(q)
      )
    }
    return true
  })

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "text-[#00b4d8]"
      case "warn":
        return "text-[#f1c40f]"
      case "error":
        return "text-[#EE4C2C]"
      case "success":
        return "text-[#00d4aa]"
      default:
        return "text-[#8b949e]"
    }
  }

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30"
      case "warn":
        return "bg-[#f1c40f]/15 text-[#f1c40f] border-[#f1c40f]/30"
      case "error":
        return "bg-[#EE4C2C]/15 text-[#EE4C2C] border-[#EE4C2C]/30"
      case "success":
        return "bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/30"
    }
  }

  return (
    <div
      className={`rounded-xl bg-[#071425] border border-[#30363d] flex flex-col font-mono text-xs overflow-hidden ${className}`}
    >
      {/* Top Console Bar */}
      <div className="px-3 py-2 bg-[#0c1a30] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="font-semibold text-[#e6edf3] font-sans">
            本地执行引擎实时终端
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#122340] text-[#8b949e] border border-[#30363d]">
            {filteredLogs.length} 条记录
          </span>
        </div>

        {/* Level filter tabs */}
        <div className="flex items-center gap-1 bg-[#122340] p-0.5 rounded border border-[#30363d]">
          {(["all", "info", "warn", "error", "success"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-0.5 text-[10px] rounded uppercase transition-colors cursor-pointer ${levelFilter === lvl
                  ? "bg-[#071425] text-[#00d4aa] font-bold shadow-xs"
                  : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search input & actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input
              type="text"
              placeholder="过滤终端日志..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 sm:w-40 h-6 pl-6 pr-2 rounded bg-[#122340] text-[11px] text-[#e6edf3] placeholder-[#5a6268] border border-[#30363d] focus:outline-none focus:border-[#00d4aa]"
            />
          </div>

          <button
            onClick={() => setAutoScroll((p) => !p)}
            className={`p-1 rounded border transition-colors cursor-pointer ${autoScroll
                ? "bg-[#00d4aa]/20 border-[#00d4aa] text-[#00d4aa]"
                : "bg-[#122340] border-[#30363d] text-[#8b949e]"
              }`}
            title="锁定滚轮到底部"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="p-1 rounded bg-[#122340] hover:bg-[#182e54] text-[#8b949e] hover:text-[#EE4C2C] border border-[#30363d] transition-colors cursor-pointer"
              title="清空日志"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Logs stream container */}
      <div
        ref={scrollRef}
        className="p-3 h-52 overflow-y-auto space-y-1.5 bg-[#071425] selection:bg-[#00d4aa]/30"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#5a6268] text-xs">
            暂无匹配日志记录
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="leading-relaxed hover:bg-[#0c1a30]/50 p-1 rounded transition-colors group"
            >
              <div className="flex items-start gap-2">
                <span className="text-[#5a6268] text-[11px] select-none flex-shrink-0">
                  {log.timestamp}
                </span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-semibold flex-shrink-0 ${getLevelBadge(
                    log.level,
                  )}`}
                >
                  {log.level}
                </span>
                <span className="text-[#8b949e] text-[11px] flex-shrink-0">
                  [{log.stage}]
                </span>
                <span
                  className={`flex-1 break-all ${getLevelColor(log.level)}`}
                >
                  {log.message}
                </span>
              </div>

              {/* Troubleshooting action recommendation if present */}
              {log.suggestion && (
                <div className="mt-1 ml-16 p-2 rounded bg-[#122340] border border-[#EE4C2C]/30 text-[11px] flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-[#EE4C2C]">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>排障建议: {log.suggestion}</span>
                  </div>
                  {log.actionable && onTroubleshootFix && (
                    <button
                      onClick={() =>
                        onTroubleshootFix(log.actionable!.actionType)
                      }
                      className="px-2 py-0.5 rounded bg-[#EE4C2C]/20 hover:bg-[#EE4C2C]/30 text-[#EE4C2C] border border-[#EE4C2C]/50 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3 h-3" />
                      {log.actionable.actionLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer status line */}
      <div className="px-3 py-1 bg-[#0c1a30]/80 border-t border-[#30363d] flex items-center justify-between text-[11px] text-[#8b949e]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            DiffSynth 守护线程运行中
          </span>
          <span>·</span>
          <span>CUDA:0 (RTX 4090 24GB)</span>
        </div>
        <div className="text-[10px] text-[#5a6268]">UTF-8 · SSE 保持长连接</div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
