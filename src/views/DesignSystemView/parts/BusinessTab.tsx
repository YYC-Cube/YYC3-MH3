/**
 * file: src/views/DesignSystemView/parts/BusinessTab.tsx
 * description: YYC³ 功能视图 — DesignSystemView 业务专属生产力组件页签
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[designsystem],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DesignSystemView TAB 3 —— 五步闭环流水线 / 视频预览与雷达图 / 终端日志面板 /
 *        YYC³ AI Family 智能协同系统四类业务组件展示，逐字搬移自原 DesignSystemView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../components/pipeline/*, ../../../domains/production/pipeline, ../../../types
 * exports: BusinessTabProps, BusinessTab
 */
import { Sparkles } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { PipelineBar } from "../../../components/pipeline/PipelineBar";
import { RadarScoreChart } from "../../../components/pipeline/RadarScoreChart";
import { TerminalLogPanel } from "../../../components/pipeline/TerminalLogPanel";
import { VideoPreviewPlayer } from "../../../components/pipeline/VideoPreviewPlayer";
import { getNextStage } from "../../../domains/production/pipeline";
import { LogEntry, PipelineStageKey } from "../../../types";

export interface BusinessTabProps {
  stage: PipelineStageKey;
  onStageChange: (stage: PipelineStageKey) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
  logs: LogEntry[];
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  onOpenYYC3?: () => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({
  stage,
  onStageChange,
  progress,
  onProgressChange,
  logs,
  onShowToast,
  onOpenYYC3,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Five-stage Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#e6edf3]">
              1. 五步闭环流水线组件 (Five-Stage Closed-Loop Pipeline)
            </h3>
            <p className="text-xs text-[#8b949e]">
              生成(DiffSynth) → 评分(SyncNet) → 精评(多模态) → 分析(缺陷归因) → Seed 迭代
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="secondary"
              onClick={() => {
                // 循环推进规则由领域层提供（seed_iter 闭环回 generation）
                onStageChange(getNextStage(stage));
                onProgressChange(Math.floor(Math.random() * 80) + 20);
              }}
            >
              模拟推进下一个阶段
            </Button>
          </div>
        </div>
        <PipelineBar
          currentStage={stage}
          progress={progress}
          isRunning={true}
          onStageClick={(st) => {
            onStageChange(st);
            onShowToast("info", `已切换至流水线阶段: ${st}`);
          }}
        />
      </div>

      {/* 2. Video Player & Radar Chart Dual View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#e6edf3]">
              2. 视频预览播放器 (Video Preview Player)
            </h3>
            <span className="text-[11px] text-[#8b949e]">
              逐帧步进 · 0.5x~2x倍速 · 截图 · 快捷键 Space
            </span>
          </div>
          <VideoPreviewPlayer
            onSnapshot={() =>
              onShowToast("success", "样张已捕获", "已保存至本地 runs/snapshots/ 目录")
            }
          />
        </div>

        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#e6edf3]">
              3. 口型评分雷达图 (5-Dimension Radar Chart)
            </h3>
            <span className="text-[11px] text-[#8b949e]">五维度 · 历史均值叠层 · 告警建议</span>
          </div>
          <RadarScoreChart />
        </div>
      </div>

      {/* 4. Terminal Log Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#e6edf3]">
            4. 本地终端日志面板 (Terminal Log Console)
          </h3>
          <span className="text-[11px] text-[#8b949e]">Info/Warn/Error分色 · 错误排障建议入口</span>
        </div>
        <TerminalLogPanel
          logs={logs}
          onTroubleshootFix={(action) => {
            onShowToast("success", "已触发排障动作", `执行动作: ${action}`);
          }}
        />
      </div>

      {/* 5. YYC3 AI Family Global System */}
      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#e8f0f8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00e0b8]" />
              5. YYC³ AI Family 智能协同生产系统 (Global Floating AI Center)
            </h3>
            <p className="text-xs text-[#8a97a8] mt-0.5">
              融合环形时钟架构与 8 位全职能 AI 代理，常驻右下角浮窗，支持快捷键 Ctrl+/ 全域唤起
            </p>
          </div>
          <Button
            variant="primary"
            size="xs"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={onOpenYYC3}
          >
            即刻体验环形时钟浮窗 (Ctrl+/)
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          {[
            {
              name: "言启·千行 (06:00)",
              role: "意图路由与语音音素",
              color: "text-[#FFD700]",
            },
            {
              name: "语枢·万物 (07:30)",
              role: "数据分析与多维指标",
              color: "text-[#FF69B4]",
            },
            {
              name: "预见·先知 (09:00)",
              role: "显存预测与趋势前瞻",
              color: "text-[#00BFFF]",
            },
            {
              name: "千里·伯乐 (10:30)",
              role: "优质种子优选与沉淀",
              color: "text-white",
            },
            {
              name: "元启·天枢 (12:00)",
              role: "全局调度总指挥中枢",
              color: "text-[#00e0b8]",
            },
            {
              name: "智云·守护 (13:30)",
              role: "安全探活与看门狗自愈",
              color: "text-[#9d7cd8]",
            },
            {
              name: "格物·宗师 (15:00)",
              role: "质量标准黄金裁判官",
              color: "text-[#C0C0C0]",
            },
            {
              name: "创想·灵韵 (16:30)",
              role: "创意提示词与分镜灵感",
              color: "text-[#FF7A5C]",
            },
          ].map((ag, i) => (
            <div key={i} className="p-2 rounded bg-[#15294a] border border-[#1e2f47] space-y-0.5">
              <div className={`font-bold ${ag.color}`}>{ag.name}</div>
              <div className="text-[10px] text-[#8a97a8] font-sans truncate">{ag.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
