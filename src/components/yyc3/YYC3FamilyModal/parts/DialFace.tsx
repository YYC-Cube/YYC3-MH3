/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/DialFace.tsx
 * description: YYC³ AI Family 协同组件 — 520 基准表盘面板（环/刻度/中心/三针/成员节点）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[dial],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 表盘几何层 — 三层同心环、12 时钟刻度、品牌中心圆盘与数字时钟、
 *        SVG 径向光束与真实三针、8 位成员环形节点。
 *
 * dependencies: react, ../../../../data/yyc3Data, ../../../../types, ./MemberIcon, ./useFamilyClock
 * exports: DialFace, DialFaceProps
 */
import type React from "react";
import { YYC3_MEMBERS } from "../../../../data/yyc3Data";
import type { YYC3Member } from "../../../../types";
import { renderMemberIcon } from "./MemberIcon";
import { CLOCK_CX, CLOCK_CY, type FamilyClock } from "./useFamilyClock";

export interface DialFaceProps {
  selectedMember: YYC3Member;
  onSelectMember: (member: YYC3Member) => void;
  clock: FamilyClock;
}

export const DialFace: React.FC<DialFaceProps> = ({ selectedMember, onSelectMember, clock }) => {
  const { currentTimeStr, dateStr, dayLabel, isWeekend, hourTip, minuteTip, secondTip } = clock;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer thin ring */}
      <div className="absolute inset-0 rounded-full border border-[#1e2f47]/60 pointer-events-none" />

      {/* Middle dashed ring */}
      <div className="absolute inset-10 rounded-full border border-dashed border-[#1e2f47]/80 pointer-events-none" />

      {/* Inner glowing ring */}
      <div className="absolute inset-24 rounded-full border border-[#00e0b8]/20 shadow-[0_0_24px_rgba(0,224,184,0.06)] pointer-events-none" />

      {/* 12 Clock Hour Ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        return (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-[#00e0b8]/40 origin-bottom pointer-events-none"
            style={{
              top: "16px",
              left: "calc(50% - 1px)",
              transformOrigin: "50% 244px",
              transform: `rotate(${angle}deg)`,
            }}
          />
        );
      })}

      {/* Center Core: YYC³ 品牌圆盘（144→96 同比缩小，三针环绕外露）+ 数字时钟下移（图一布局） */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full bg-[#0a1628] border-2 border-[#00e0b8] shadow-[0_0_24px_rgba(0,224,184,0.35)] flex flex-col items-center justify-center">
          {/* Slow spinning ring */}
          <div className="absolute -inset-1.5 rounded-full border border-dashed border-[#00e0b8]/50 spin-slow pointer-events-none" />

          <img
            src="/yyc3-icons/yyc3-logo.png"
            alt="YYC³ AI Family"
            className="h-9 w-9 object-contain drop-shadow-[0_0_6px_rgba(0,224,184,0.6)]"
          />
          <span className="text-[8px] text-[#8a97a8] tracking-tight uppercase mt-1">AI Family</span>
        </div>

        {/* Digital Clock + 日期星期（中心圆正下方，不遮挡三针） */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap" style={{ top: 104 }}>
          <div className="font-mono text-xs font-bold text-[#00e0b8] tracking-wider">{currentTimeStr}</div>
          <div className="text-[9px] font-mono flex items-center justify-center gap-1 leading-none mt-0.5">
            <span className="text-[#8b949e]">{dateStr}</span>
            <span
              className="font-semibold"
              style={{
                color: isWeekend ? "#FF006E" : "#8a97a8",
                textShadow: isWeekend ? "0 0 6px rgba(255,0,110,0.5)" : "none",
              }}
            >
              周{dayLabel}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Radial Holographic Beams + 真实时钟三针（viewBox 520 等比自适应） */}
      <svg
        viewBox="0 0 520 520"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        {YYC3_MEMBERS.map((m) => {
          const isSelected = selectedMember.id === m.id;
          const rad = ((m.angle - 90) * Math.PI) / 180;
          const r = 210;
          const x = CLOCK_CX + r * Math.cos(rad);
          const y = CLOCK_CY + r * Math.sin(rad);

          return (
            <line
              key={m.id}
              x1={CLOCK_CX}
              y1={CLOCK_CY}
              x2={x}
              y2={y}
              stroke={isSelected ? "#ffffff" : m.roleColor}
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? "5 5" : "3 3"}
              opacity={isSelected ? 0.9 : 0.35}
              className={isSelected ? "data-stream-line" : ""}
            />
          );
        })}

        {/* 真实时钟三针：根部隐于中心圆盘之下，长短/颜色按真实钟表分级 */}
        {/* 时针 — 青绿主色 · 最短最粗 */}
        <line
          x1={CLOCK_CX}
          y1={CLOCK_CY}
          x2={hourTip.x}
          y2={hourTip.y}
          stroke="#00e0b8"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.9}
        />
        {/* 分针 — 信息蓝 · 中长中细 */}
        <line
          x1={CLOCK_CX}
          y1={CLOCK_CY}
          x2={minuteTip.x}
          y2={minuteTip.y}
          stroke="#00b4d8"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.85}
        />
        {/* 秒针 — 粉色辉光 · 最细最长（与周末高亮呼应） */}
        <line
          x1={CLOCK_CX}
          y1={CLOCK_CY}
          x2={secondTip.x}
          y2={secondTip.y}
          stroke="#FF006E"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(255,0,110,0.8))" }}
        />
      </svg>

      {/* 8 Member Nodes positioned along circumference */}
      {YYC3_MEMBERS.map((m) => {
        const isSelected = selectedMember.id === m.id;
        const rad = ((m.angle - 90) * Math.PI) / 180;
        const r = 210;
        const cx = 260;
        const cy = 260;
        const left = cx + r * Math.cos(rad) - 30;
        const top = cy + r * Math.sin(rad) - 30;

        return (
          <div
            key={m.id}
            onClick={() => {
              onSelectMember(m);
            }}
            style={{ left: `${left}px`, top: `${top}px` }}
            className="absolute w-[60px] h-[60px] flex flex-col items-center justify-center cursor-pointer group z-20"
          >
            {/* Circle Node Icon */}
            <div
              className={`relative w-12 h-12 rounded-full bg-[#0d1e36] flex items-center justify-center border-2 transition-all duration-200 group-hover:scale-110 ${
                isSelected
                  ? "border-white shadow-[0_0_24px_rgba(255,255,255,0.7)] scale-110"
                  : "border-[#1e2f47] hover:border-white/50"
              }`}
              style={{
                borderColor: isSelected ? "#ffffff" : m.roleColor,
                boxShadow: isSelected ? `0 0 20px ${m.roleColor}80` : `0 0 8px ${m.roleColor}30`,
              }}
            >
              {renderMemberIcon(m.iconType, isSelected ? "#ffffff" : m.roleColor)}

              {/* Speaking indicator dot from screenshot */}
              {m.isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e0b8] border-2 border-[#0a1628]" />
                </span>
              )}
            </div>

            {/* Member Name and Clock text */}
            <div className="mt-1 text-center whitespace-nowrap">
              <div
                className={`text-[11px] font-semibold transition-colors ${
                  isSelected ? "text-white" : "text-[#8a97a8] group-hover:text-[#e8f0f8]"
                }`}
                style={{ color: isSelected ? m.roleColor : undefined }}
              >
                {m.name}
              </div>
              <div className="text-[9px] font-mono text-[#8b949e]">{m.clockPosition}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
