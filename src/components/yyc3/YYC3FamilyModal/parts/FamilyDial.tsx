/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/FamilyDial.tsx
 * description: YYC³ AI Family 协同组件 — 表盘区（自适应测量层 + 底部署名）
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
 * brief: 表盘区容器 — 520 基准表盘整体等比缩放（移动端/全屏通吃），
 *        内嵌表盘面板并承载底部署名。
 *
 * dependencies: react, ../../../../types, ./DialFace, ./useFamilyClock
 * exports: FamilyDial, FamilyDialProps
 */
import type React from "react";
import type { RefObject } from "react";
import type { YYC3Member } from "../../../../types";
import { DialFace } from "./DialFace";
import type { FamilyClock } from "./useFamilyClock";

export interface FamilyDialProps {
  dialAreaRef: RefObject<HTMLDivElement | null>;
  dialScale: number;
  selectedMember: YYC3Member;
  onSelectMember: (member: YYC3Member) => void;
  clock: FamilyClock;
}

export const FamilyDial: React.FC<FamilyDialProps> = ({
  dialAreaRef,
  dialScale,
  selectedMember,
  onSelectMember,
  clock,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative select-none bg-gradient-to-b from-[#0a1628] to-[#071222] overflow-hidden min-h-0">
      {/* 表盘自适应测量层：520 基准表盘整体等比缩放（移动端/全屏通吃） */}
      <div ref={dialAreaRef} className="flex-1 w-full min-h-0 flex items-center justify-center">
        <div
          className="relative w-[520px] h-[520px] flex-shrink-0"
          style={{
            transform: `scale(${dialScale})`,
            transformOrigin: "center center",
          }}
        >
          <DialFace selectedMember={selectedMember} onSelectMember={onSelectMember} clock={clock} />
        </div>
      </div>

      {/* Bottom Motto matching screenshot */}
      <div className="mt-auto pt-2 text-center text-xs text-[#8a97a8] select-none">
        <p className="tracking-widest font-medium text-[#e8f0f8]/90">
          亦师亦友亦伯乐 · 一言一语一协同
        </p>
        <p className="text-[10px] text-[#8b949e] tracking-wider mt-0.5 font-mono">
          Words Initiate Quadrants, Language Serves as Core for Future
        </p>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
