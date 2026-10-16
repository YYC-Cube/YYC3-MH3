/**
 * file: src/views/OpsMonitorView/parts/OpsToolbox.tsx
 * description: YYC³ 功能视图 — OpsMonitorView 运维工具箱全功能集
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[ops],[toolbox],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 第三行右列（lg:col-span-4）运维工具箱四键执行 + 本地优先保障说明，
 *        逐字搬移自原 OpsMonitorView.tsx（Requirement 2.2）。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: OpsToolboxProps, OpsToolbox
 */
import { Activity, HardDrive, Trash2, Wrench, Zap } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";

export interface OpsToolboxProps {
  activeToolRunning: string | null;
  onRunTool: (toolName: string) => void;
}

export const OpsToolbox: React.FC<OpsToolboxProps> = ({ activeToolRunning, onRunTool }) => {
  return (
    <div className="lg:col-span-4 p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3 text-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e2f47] mb-3">
          <Wrench className="w-4 h-4 text-[#00e0b8]" />
          <span className="font-semibold text-[#e8f0f8]">运维工具箱全功能集 (Ops Toolbox)</span>
        </div>

        <div className="space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            icon={<Trash2 className="w-3.5 h-3.5 text-[#ff7a45]" />}
            loading={activeToolRunning === "cache"}
            onClick={() => onRunTool("cache")}
          >
            一键清理 24h 前临时切片缓存 (释放98GB)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            icon={<Zap className="w-3.5 h-3.5 text-[#00e0b8]" />}
            loading={activeToolRunning === "defrag"}
            onClick={() => onRunTool("defrag")}
          >
            一键显存碎片整理 (VRAM Defrag)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            icon={<Activity className="w-3.5 h-3.5 text-[#00b4d8]" />}
            loading={activeToolRunning === "env"}
            onClick={() => onRunTool("env")}
          >
            一键环境健康体检
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            icon={<HardDrive className="w-3.5 h-3.5 text-[#9d7cd8]" />}
            loading={activeToolRunning === "backup"}
            onClick={() => onRunTool("backup")}
          >
            导出系统快照与配置备份
          </Button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#0a1628] border border-[#1e2f47] text-[11px] text-[#8a97a8] space-y-1">
        <span className="text-[#00e0b8] font-semibold">本地优先保障</span>
        <p>
          日志与监控数据经本地端口留痕（浏览器环境写入 IndexedDB 持久化，无 IDB
          环境退化为内存会话），不发起任何外网回传。
        </p>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
