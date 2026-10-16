/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/MemberBio.tsx
 * description: YYC³ AI Family 协同组件 — 成员概览面板（引言/定位/职责/能力/指标/操作）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[bio],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 成员概览 — 名句引言、角色定位、核心职责、核心能力胶囊、运行指标 2x2 与底部操作。
 *
 * dependencies: react, lucide-react, ../../../../types, ../../common
 * exports: MemberBio, MemberBioProps
 */
import { MessageSquare, Sparkles } from "lucide-react";
import type React from "react";
import type { YYC3Member } from "../../../../types";
import { Button } from "../../../common";

export interface MemberBioProps {
  selectedMember: YYC3Member;
  onOpenChat: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const MemberBio: React.FC<MemberBioProps> = ({
  selectedMember,
  onOpenChat,
  onShowToast,
}) => {
  return (
    <div className="flex-1 p-5 space-y-4 text-xs overflow-y-auto">
      {/* Quote Card matching attachment 2 */}
      <div className="p-3.5 rounded-xl bg-[#15294a]/60 border border-[#1e2f47] text-[#e8f0f8] leading-relaxed italic text-xs shadow-inner">
        {selectedMember.quote}
      </div>

      {/* Role Definition */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
          角色定位
        </div>
        <p className="text-[#8a97a8] leading-relaxed pl-3">{selectedMember.roleDefinition}</p>
      </div>

      {/* Responsibilities */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
          核心职责
        </div>
        <div className="space-y-1 pl-3 text-[#8a97a8]">
          {selectedMember.responsibilities.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-[#00e0b8] font-mono">{">"}</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities pills */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
          核心能力
        </div>
        <div className="flex flex-wrap gap-1.5 pl-3">
          {selectedMember.capabilities.map((c, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-md bg-[#15294a] text-[#e8f0f8] border border-[#1e2f47]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Runtime Metrics 2x2 grid from screenshot 2 */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
          运行指标
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
            <div className="text-[10px] text-[#8a97a8]">今日处理</div>
            <div className="font-mono text-sm font-bold text-[#00e0b8] mt-0.5">
              {selectedMember.metrics.todayTasks}{" "}
              <span className="text-[10px] text-[#8a97a8] font-normal">tasks</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
            <div className="text-[10px] text-[#8a97a8]">平均延迟</div>
            <div className="font-mono text-sm font-bold text-[#00b4d8] mt-0.5">
              {selectedMember.metrics.avgLatencyMs}{" "}
              <span className="text-[10px] text-[#8a97a8] font-normal">ms</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
            <div className="text-[10px] text-[#8a97a8]">准确率</div>
            <div className="font-mono text-sm font-bold text-[#00e0b8] mt-0.5">
              {selectedMember.metrics.accuracyRate}{" "}
              <span className="text-[10px] text-[#8a97a8] font-normal">%</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
            <div className="text-[10px] text-[#8a97a8]">协作次数</div>
            <div className="font-mono text-sm font-bold text-[#9d7cd8] mt-0.5">
              {selectedMember.metrics.collabCalls}{" "}
              <span className="text-[10px] text-[#8a97a8] font-normal">calls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions matching screenshot 2 */}
      <div className="pt-3 border-t border-[#1e2f47] grid grid-cols-2 gap-2.5">
        <Button
          variant="primary"
          size="sm"
          icon={<MessageSquare className="w-3.5 h-3.5" />}
          onClick={onOpenChat}
        >
          对话
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Sparkles className="w-3.5 h-3.5 text-[#00e0b8]" />}
          onClick={() => {
            onShowToast(
              "success",
              `任务已分派给「${selectedMember.name}」`,
              "将自动对当前生产线进行实时优化分析",
            );
          }}
        >
          任务分派
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
