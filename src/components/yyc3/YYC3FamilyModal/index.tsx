/**
 * file: src/components/yyc3/YYC3FamilyModal/index.tsx
 * description: YYC³ AI Family 协同组件 — YYC3FamilyModal 容器（状态装配 + 布局编排）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ AI Family 智能协同生产浮窗 — 单一真值收敛选中成员/全屏/会话开关，
 *        装配表盘时钟、会话与自适应缩放 Hook，编排顶栏、表盘区与成员抽屉
 *        （大块 JSX 下沉至 parts）。
 *
 * dependencies: react, ../../../data/yyc3Data, ../../../types, ./parts/types, ./parts/useDialScale, ./parts/useFamilyClock, ./parts/useFamilyChat, ./parts/FamilyModalHeader, ./parts/FamilyDial, ./parts/MemberDrawer
 * exports: FamilyActionPayload, YYC3FamilyModalProps, YYC3FamilyModal
 */
import React, { useEffect, useRef, useState } from "react";
import { YYC3_MEMBERS } from "../../../data/yyc3Data";
import type { YYC3Member } from "../../../types";
import type { YYC3FamilyModalProps } from "./parts/types";
import { useDialScale } from "./parts/useDialScale";
import { useFamilyClock } from "./parts/useFamilyClock";
import { useFamilyChat } from "./parts/useFamilyChat";
import { FamilyModalHeader } from "./parts/FamilyModalHeader";
import { FamilyDial } from "./parts/FamilyDial";
import { MemberDrawer } from "./parts/MemberDrawer";

export type { FamilyActionPayload, YYC3FamilyModalProps } from "./parts/types";

export const YYC3FamilyModal: React.FC<YYC3FamilyModalProps> = ({
  isOpen,
  onClose,
  onApplyAction,
  onShowToast,
}) => {
  const [selectedMember, setSelectedMember] = useState<YYC3Member>(
    YYC3_MEMBERS[4]!, // mock 常量数组恒非空，静态索引安全
  ); // Default to Yuanqi / Tianxu
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 真实时钟：单源 Date state，1s 走时（数字时间 / 三针角度 / 日期星期均由此派生）
  const clock = useFamilyClock();
  const chat = useFamilyChat(selectedMember);

  // Keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 表盘自适应缩放（浮窗打开时启用测量）
  const dialAreaRef = useRef<HTMLDivElement>(null);
  const dialScale = useDialScale(dialAreaRef, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#071222]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-[#0a1628] border border-[#1e2f47] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 relative ${
          isFullscreen
            ? "w-[98vw] h-[95vh]"
            : "w-full max-w-5xl h-[94dvh] md:h-[660px] md:max-h-[94dvh]"
        }`}
        style={{
          boxShadow: "0 0 32px rgba(0, 224, 184, 0.08), 0 20px 48px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching attachment */}
        <FamilyModalHeader
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((p) => !p)}
          onClose={onClose}
        />

        {/* Main Body: Clock Dial Radial Area + Right Member Drawer（移动端纵向堆叠） */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Radial Clock-Dial Layout Surface */}
          <FamilyDial
            dialAreaRef={dialAreaRef}
            dialScale={dialScale}
            selectedMember={selectedMember}
            onSelectMember={(member) => {
              setSelectedMember(member);
              setIsChatOpen(false);
            }}
            clock={clock}
          />

          {/* Right Member Detail Flyout / Drawer（移动端折叠为底部面板） */}
          <MemberDrawer
            selectedMember={selectedMember}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen((p) => !p)}
            onOpenChat={() => setIsChatOpen(true)}
            chat={chat}
            onApplyAction={onApplyAction}
            onShowToast={onShowToast}
          />
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
