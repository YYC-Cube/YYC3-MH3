/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/FamilyChat.tsx
 * description: YYC³ AI Family 协同组件 — 会话流面板（消息列表 / 预设指令 / 输入栏）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[chat],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 会话流面板 — 气泡消息列表（含可执行推荐按钮）、预设指令胶囊与底部输入栏。
 *
 * dependencies: react, lucide-react, ../../../../data/yyc3Data, ../../../../types, ../../common, ./types, ./useFamilyChat
 * exports: FamilyChat, FamilyChatProps
 */
import { CheckCircle2, Send } from "lucide-react";
import type React from "react";
import { PRESET_CHAT_PROMPTS } from "../../../../data/yyc3Data";
import type { YYC3Member } from "../../../../types";
import { Button } from "../../../common";
import type { FamilyActionPayload } from "./types";
import type { FamilyChat as FamilyChatState } from "./useFamilyChat";

export interface FamilyChatProps {
  selectedMember: YYC3Member;
  chat: FamilyChatState;
  onApplyAction?: (actionType: string, payload?: FamilyActionPayload) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const FamilyChat: React.FC<FamilyChatProps> = ({
  selectedMember,
  chat,
  onApplyAction,
  onShowToast,
}) => {
  const { messages, chatInput, setChatInput, handleSendMessage } = chat;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            {m.sender === "agent" && (
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-[#00e0b8]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: m.agentColor || "#00e0b8",
                  }}
                />
                <span>{m.agentName}</span>
                <span className="text-[10px] text-[#8b949e] font-mono">{m.timestamp}</span>
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#00e0b8] text-[#0a1628] font-medium rounded-br-xs"
                  : "bg-[#15294a] text-[#e8f0f8] border border-[#1e2f47] rounded-bl-xs"
              }`}
            >
              {m.text}
            </div>

            {/* Actionable Button if present */}
            {m.actionable && (
              <div className="mt-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  icon={<CheckCircle2 className="w-3 h-3 text-[#00e0b8]" />}
                  onClick={() => {
                    onApplyAction?.(m.actionable!.actionType, m.actionable!.payload);
                    onShowToast("success", "已应用 AI 推荐方案至当前流水线");
                  }}
                >
                  {m.actionable.label}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preset Prompts Chips */}
      <div className="p-2 border-t border-[#1e2f47] bg-[#0c1a30]/80 overflow-x-auto flex gap-1.5 flex-shrink-0">
        {(PRESET_CHAT_PROMPTS[selectedMember.id] ?? PRESET_CHAT_PROMPTS.yuanqi ?? []).map(
          (p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-[#15294a] text-[#8a97a8] hover:text-[#00e0b8] border border-[#1e2f47] hover:border-[#00e0b8]/40 whitespace-nowrap transition-colors cursor-pointer"
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-[#1e2f47] bg-[#0f1f38] flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder={`向 ${selectedMember.name} 发送生产协同指令...`}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-1 h-8 px-3 rounded-lg bg-[#0a1628] text-xs text-[#e8f0f8] placeholder-[#8b949e] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
        />
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="w-3.5 h-3.5" />}
          onClick={() => handleSendMessage()}
        />
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
