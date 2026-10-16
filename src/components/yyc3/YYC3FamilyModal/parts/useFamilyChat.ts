/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/useFamilyChat.ts
 * description: YYC³ AI Family 协同组件 — 会话接入 Hook（消息流 + 发送 + 智能回复）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[hook],[chat],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 会话单源 Hook — 收敛消息列表与输入草稿，发送后模拟选中家人的智能回复；
 *        罐装回复分支与问候卡文案经 AI 域纯函数（domains/ai/family）出借。
 *
 * dependencies: react, ../../../../types, ../../../../domains/ai/family, ./types
 * exports: FamilyChat, useFamilyChat
 */
import { useState } from "react";
import { familyGreeting, familyReply } from "../../../../domains/ai/family";
import type { YYC3Member } from "../../../../types";
import type { ChatMessage } from "./types";

export interface FamilyChat {
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  handleSendMessage: (textToSend?: string) => void;
}

export function useFamilyChat(selectedMember: YYC3Member): FamilyChat {
  const [chatInput, setChatInput] = useState("");
  const greeting = familyGreeting();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      agentName: greeting.agentName,
      agentColor: greeting.agentColor,
      text: greeting.text,
      timestamp: greeting.timestamp,
      actionable: {
        label: greeting.actionLabel,
        actionType: greeting.actionType,
        payload: greeting.payload,
      },
    },
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setChatInput("");

    // Simulate Agent intelligent reply（罐装决策由 AI 域 familyReply 分支出借）
    setTimeout(() => {
      const { text: replyText, actionLabel, payload } = familyReply(selectedMember, text);

      setMessages((prev) => [
        ...prev,
        {
          id: `agt-${Date.now()}`,
          sender: "agent",
          agentName: selectedMember.name,
          agentColor: selectedMember.roleColor,
          text: replyText,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actionable: {
            label: actionLabel,
            actionType: "inject_recommendation",
            payload,
          },
        },
      ]);
    }, 700);
  };

  return { messages, chatInput, setChatInput, handleSendMessage };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
