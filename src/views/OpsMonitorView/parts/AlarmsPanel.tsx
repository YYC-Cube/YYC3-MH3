/**
 * file: src/views/OpsMonitorView/parts/AlarmsPanel.tsx
 * description: YYC³ 功能视图 — OpsMonitorView 实时告警与自愈中心
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[ops],[alarms],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: OpsMonitorView 第三行左列（lg:col-span-8）实时告警清单与一键自愈，
 *        逐字搬移自原 OpsMonitorView.tsx（Row 3）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: AlarmsPanelProps, AlarmsPanel
 */
import { ShieldAlert, Wrench } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import { AlarmItem } from "../../../types";

export interface AlarmsPanelProps {
  alarms: AlarmItem[];
  onFixAlarm: (id: string, actionName: string) => void;
}

export const AlarmsPanel: React.FC<AlarmsPanelProps> = ({ alarms, onFixAlarm }) => {
  return (
    <div className="lg:col-span-8 p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ff7a45]" />
          <span className="text-xs font-semibold text-[#e8f0f8]">实时告警与自愈中心 (Incidents)</span>
        </div>
        <span className="text-[10px] font-mono text-[#8a97a8]">
          未解除告警: {alarms.filter((a) => !a.resolved).length}
        </span>
      </div>

      <div className="space-y-2.5">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`p-3.5 rounded-xl border transition-all text-xs ${
              alarm.resolved
                ? "bg-[#15294a]/30 border-[#1e2f47] opacity-50"
                : "bg-[#15294a] border-[#ff7a45] shadow-[0_0_16px_rgba(255,122,69,0.25)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Badge variant={alarm.level === "critical" ? "danger" : "warning"} size="xs">
                  {alarm.resolved ? "已自愈解决" : alarm.level.toUpperCase()}
                </Badge>
                <span className="font-semibold text-[#e8f0f8]">{alarm.title}</span>
              </div>
              <span className="text-[11px] font-mono text-[#8a97a8]">{alarm.timestamp}</span>
            </div>

            <p className="text-[#8a97a8] leading-relaxed mb-2">{alarm.description}</p>

            <div className="pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between">
              <span className="text-[11px] text-[#00e0b8]">排障建议：{alarm.recommendation}</span>
              {!alarm.resolved && alarm.actionLabel && (
                <Button
                  variant="danger"
                  size="xs"
                  icon={<Wrench className="w-3 h-3" />}
                  onClick={() => onFixAlarm(alarm.id, alarm.actionLabel!)}
                >
                  {alarm.actionLabel}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
