/**
 * file: src/views/BatchDetailView/parts/AnomaliesPanel.tsx
 * description: YYC³ 功能视图 — BatchDetailView 页签 D · 异常帧定位与缺陷标注工具
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[anomalies],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 页签 D 异常帧清单与一键平滑补丁应用，
 *        逐字搬移自原 BatchDetailView.tsx（TAB D / Requirement 2.1）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../useBatchDetailView
 * exports: AnomaliesPanelProps, AnomaliesPanel
 */
import { Wrench } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import { BatchAnomaly } from "../useBatchDetailView";

export interface AnomaliesPanelProps {
  anomalies: BatchAnomaly[];
  onFixAnomaly: (frame: number) => void;
}

export const AnomaliesPanel: React.FC<AnomaliesPanelProps> = ({ anomalies, onFixAnomaly }) => {
  return (
    <div className="p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
        <div>
          <h3 className="text-sm font-semibold text-[#e8f0f8]">异常帧定位与缺陷标注工具</h3>
          <p className="text-[#8a97a8]">基于 SyncNet 误差阈值与面部关键点突变检测定位的问题帧</p>
        </div>
        <Badge variant="warning" size="xs">
          检测到 {anomalies.filter((a) => !a.fixed).length} 处待修复异常
        </Badge>
      </div>

      <div className="space-y-3">
        {anomalies.map((ano) => (
          <div
            key={ano.frame}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
              ano.fixed ? "bg-[#15294a]/40 border-[#1e2f47] opacity-60" : "bg-[#15294a] border-[#ff7a45]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[#00e0b8]">Frame #{ano.frame}</span>
              <div className="text-[#e8f0f8]">{ano.issue}</div>
            </div>

            <div className="flex items-center gap-2">
              {ano.fixed ? (
                <Badge variant="brand" size="xs">
                  已平滑修复
                </Badge>
              ) : (
                <Button
                  variant="danger"
                  size="xs"
                  icon={<Wrench className="w-3.5 h-3.5" />}
                  onClick={() => onFixAnomaly(ano.frame)}
                >
                  一键应用平滑补丁
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
