/**
 * file: src/views/OpsMonitorView/parts/ServicesTable.tsx
 * description: YYC³ 功能视图 — OpsMonitorView 本地微服务看门狗监控表
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[ops],[services],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 第二行本地微服务看门狗监控表（状态徽标 + 近 7 天稳定性柱图 + 平滑重载），
 *        逐字搬移自原 OpsMonitorView.tsx（Requirement 2.2）。
 *
 * dependencies: react, ../../../components/common, ../../../types
 * exports: ServicesTableProps, ServicesTable
 */
import React from "react";
import { Badge, Button, Card } from "../../../components/common";
import { ServiceStatus } from "../../../types";

export interface ServicesTableProps {
  services: ServiceStatus[];
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({ services, onShowToast }) => {
  return (
    <Card title="本地微服务看门狗监控 (Services Watchdog)" subtitle="TelemetryPort 本地遥测聚合 · memory 演示快照供数">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
              <th className="py-2.5 px-3">服务名称 / Service ID</th>
              <th className="py-2.5 px-3">端口</th>
              <th className="py-2.5 px-3">运行状态</th>
              <th className="py-2.5 px-3">近7天稳定性柱图 (缺柱即异常)</th>
              <th className="py-2.5 px-3">正常运行时间</th>
              <th className="py-2.5 px-3">进程 PIDs</th>
              <th className="py-2.5 px-3">内存占用</th>
              <th className="py-2.5 px-3 text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2f47]/50">
            {services.map((srv, idx) => (
              <tr key={srv.serviceId} className="hover:bg-[#15294a]/40 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-[#e8f0f8]">{srv.name}</div>
                  <div className="font-mono text-[10px] text-[#8a97a8]">{srv.serviceId}</div>
                </td>
                <td className="py-2.5 px-3 font-mono text-[#00b4d8]">:{srv.port}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="brand" size="xs" pulse>
                    在线运行中
                  </Badge>
                </td>
                {/* Micro Pillar Bar Chart (Requirement 2.2) */}
                <td className="py-2.5 px-3">
                  <div className="flex items-end gap-1 h-4 w-28" title="近7天运行稳定性">
                    {[100, 100, idx === 1 ? 75 : 100, 100, 100, 100, 100].map((val, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-xs transition-all ${val === 100 ? "bg-[#00e0b8]" : "bg-[#ff7a45]"}`}
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-[#8a97a8] font-mono">{srv.uptime}</td>
                <td className="py-2.5 px-3 text-[#8a97a8] font-mono">{srv.pids}</td>
                <td className="py-2.5 px-3 font-mono text-[#e8f0f8]">{srv.memory}</td>
                <td className="py-2.5 px-3 text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onShowToast("info", `已触发服务平滑重载: ${srv.name}`)}
                  >
                    平滑重载
                  </Button>
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
