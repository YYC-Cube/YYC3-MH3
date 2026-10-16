/**
 * file: src/views/BatchDetailView/parts/ComparePanel.tsx
 * description: YYC³ 功能视图 — BatchDetailView 页签 B · 多维雷达与历史基准对比
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[compare],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 页签 B 多维质量雷达图 + 历史 50 批次基准超参对比表，
 *        逐字搬移自原 BatchDetailView.tsx（TAB B）。
 *
 * dependencies: react, ../../../components/common, ../../../components/pipeline/RadarScoreChart
 * exports: ComparePanel
 */
import React from "react";
import { Badge } from "../../../components/common";
import { RadarScoreChart } from "../../../components/pipeline/RadarScoreChart";

export const ComparePanel: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6">
        <RadarScoreChart />
      </div>
      <div className="lg:col-span-6 p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
          <h3 className="font-semibold text-sm text-[#e8f0f8]">
            历史 50 批次基准超参对比与差异百分比
          </h3>
          <Badge variant="brand" size="xs">
            领先基准 +5.4%
          </Badge>
        </div>

        <div className="space-y-2.5 text-[#8a97a8]">
          {[
            {
              label: "口型吻合度 (Lip-Sync)",
              curr: 95.8,
              base: 88.4,
              diff: "+8.3%",
            },
            {
              label: "表情自然度 (Expression)",
              curr: 92.4,
              base: 89.1,
              diff: "+3.7%",
            },
            {
              label: "姿态稳定性 (Stability)",
              curr: 97.2,
              base: 92.0,
              diff: "+5.6%",
            },
            {
              label: "时序一致性 (Coherence)",
              curr: 93.5,
              base: 86.8,
              diff: "+7.7%",
            },
            {
              label: "超清真实感 (Fidelity)",
              curr: 96.0,
              base: 91.5,
              diff: "+4.9%",
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47]"
            >
              <span className="font-medium text-[#e8f0f8]">{row.label}</span>
              <div className="flex items-center gap-4 font-mono">
                <span className="text-[#00e0b8] font-bold">{row.curr}</span>
                <span className="text-[#8b949e]">vs {row.base}</span>
                <span className="text-[#00e0b8] font-bold">{row.diff}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-[#0a1628] border border-[#00e0b8]/30 text-[11px] text-[#00e0b8] leading-relaxed">
          <strong>诊断结论：</strong>当前批次多项指标达到 S
          级基线门槛，特别是在时序连续性与口型贴合上表现突出。已推荐回写至种子库。
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
