/**
 * file: src/views/DashboardView/parts/PipelineFlow.tsx
 * description: YYC³ 功能视图 — DashboardView 五步闭环生产流水线实时吞吐流转图
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[dashboard],[pipeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 第二行左列（lg:col-span-8）五节点闭环漏斗流转图，
 *        逐字搬移自原 DashboardView.tsx（Row 2）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: PipelineFlowProps, PipelineFlow
 */
import { ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { NavigateExtra, NavTabId } from "../../../types";

export interface PipelineFlowProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({ onNavigate }) => {
  return (
    <div className="lg:col-span-8 p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[#e8f0f8]">
            五步闭环生产流水线 · 实时吞吐流转图
          </h2>
          <p className="text-xs text-[#8a97a8]">任务从生成至 Seed 基因回写的端到端自动化漏斗</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="xs" onClick={() => onNavigate("workbench")}>
            流水线看板
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {[
          {
            step: "01",
            title: "神经渲染",
            num: "1,420",
            unit: "片段",
            pass: "100%",
            color: "border-[#00e0b8]",
          },
          {
            step: "02",
            title: "口型初评",
            num: "1,392",
            unit: "片段",
            pass: "98.0%",
            color: "border-[#00e0b8]",
          },
          {
            step: "03",
            title: "多模精评",
            num: "840",
            unit: "优质",
            pass: "92.4分",
            color: "border-[#00b4d8]",
          },
          {
            step: "04",
            title: "缺陷归因",
            num: "420",
            unit: "聚类",
            pass: "敏感度高",
            color: "border-[#9d7cd8]",
          },
          {
            step: "05",
            title: "Seed 回写",
            num: "64",
            unit: "S级种子",
            pass: "闭环进化",
            color: "border-[#00e0b8]",
          },
        ].map((node, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-xl bg-[#15294a]/60 border-l-2 ${node.color} border border-[#1e2f47] space-y-2 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between text-[10px] text-[#8b949e]">
              <span>STAGE {node.step}</span>
              <span className="text-[#00e0b8] font-mono font-bold">{node.pass}</span>
            </div>
            <div className="text-xs font-semibold text-[#e8f0f8]">{node.title}</div>
            <div className="font-mono text-lg font-bold text-[#e8f0f8]">
              {node.num} <span className="text-[10px] text-[#8a97a8] font-normal">{node.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1e2f47]/60 flex items-center justify-between text-xs text-[#8a97a8]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e0b8] animate-ping" />
          <span>闭环状态：今日已反哺回写 64 组高置信度种子基因</span>
        </div>
        <button
          onClick={() => onNavigate("seed")}
          className="text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer"
        >
          查看种子库 <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
