/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/MemberDrawer.tsx
 * description: YYC³ AI Family 协同组件 — 成员详情抽屉（头部 + 概览/会话切换）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[drawer],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 成员详情抽屉 — 顶部成员身份信息与切换按钮，正文在成员概览与会话流之间切换。
 *
 * dependencies: react, lucide-react, ../../../../types, ../../common, ./MemberIcon, ./MemberBio, ./FamilyChat, ./types, ./useFamilyChat
 * exports: MemberDrawer, MemberDrawerProps
 */
import { MessageSquare } from "lucide-react";
import type React from "react";
import type { YYC3Member } from "../../../../types";
import { Button } from "../../../common";
import { FamilyChat } from "./FamilyChat";
import { MemberBio } from "./MemberBio";
import { renderMemberIcon } from "./MemberIcon";
import type { FamilyActionPayload } from "./types";
import type { FamilyChat as FamilyChatState } from "./useFamilyChat";

export interface MemberDrawerProps {
  selectedMember: YYC3Member;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenChat: () => void;
  chat: FamilyChatState;
  onApplyAction?: (actionType: string, payload?: FamilyActionPayload) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({
  selectedMember,
  isChatOpen,
  onToggleChat,
  onOpenChat,
  chat,
  onApplyAction,
  onShowToast,
}) => {
  return (
    <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0 overflow-y-auto max-h-[46%] md:max-h-none">
      {/* Drawer Header matching screenshot 2 */}
      <div className="p-5 border-b border-[#1e2f47] bg-[#0f1f38]/60 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full bg-[#15294a] border-2 flex items-center justify-center shadow-md"
            style={{ borderColor: selectedMember.roleColor }}
          >
            {renderMemberIcon(selectedMember.iconType, selectedMember.roleColor)}
          </div>
          <div>
            <h3 className="font-bold text-base text-[#e8f0f8]">{selectedMember.name}</h3>
            <div className="text-xs text-[#8a97a8] font-mono mt-0.5">{selectedMember.metaName}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-[#00e0b8] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                在线
              </span>
              <span className="text-[#8b949e]">|</span>
              <span className="font-mono text-[11px] text-[#8a97a8]">{selectedMember.clockPosition}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={onToggleChat} title="切换对话/概览">
            <MessageSquare className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Toggle Content: Member Bio VS Chat Stream */}
      {!isChatOpen ? (
        <MemberBio selectedMember={selectedMember} onOpenChat={onOpenChat} onShowToast={onShowToast} />
      ) : (
        <FamilyChat
          selectedMember={selectedMember}
          chat={chat}
          onApplyAction={onApplyAction}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
