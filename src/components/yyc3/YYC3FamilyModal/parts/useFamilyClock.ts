/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/useFamilyClock.ts
 * description: YYC³ AI Family 协同组件 — 真实时钟走时与三针几何 Hook
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[hook],[clock],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 真实时钟单源 — 1s 走时（数字时间 / 日期星期 / 三针角度均由此派生），
 *        表盘 viewBox 520 坐标系下的中心与三针端点几何。
 *
 * dependencies: react
 * exports: CLOCK_CX, CLOCK_CY, FamilyClock, useFamilyClock
 */
import { useEffect, useState } from "react";

/** 星期标签（getDay: 0=日 … 6=六）；周末（日/六）以粉色高亮 */
const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

// 表盘几何：viewBox 520 坐标系，经 preserveAspectRatio 随容器等比自适应。
// 中心 (260,260) 与成员环一致。三针真实钟表比例（秒>分>时），长度基于表盘
// 半径 210 分级递减，且全部收在成员环内沿（r=180）之内：
//   时针 110（青绿主色 · 最短最粗）｜分针 145（信息蓝 · 中长）｜秒针 172（粉 · 最细最长）
export const CLOCK_CX = 260;
export const CLOCK_CY = 260;
const HAND_HOUR = 110;
const HAND_MINUTE = 145;
const HAND_SECOND = 172;

function handTip(angleDeg: number, len: number) {
  return {
    x: CLOCK_CX + Math.cos((angleDeg * Math.PI) / 180) * len,
    y: CLOCK_CY + Math.sin((angleDeg * Math.PI) / 180) * len,
  };
}

export interface FamilyClock {
  currentTimeStr: string;
  dateStr: string;
  dayLabel: string;
  isWeekend: boolean;
  hourTip: { x: number; y: number };
  minuteTip: { x: number; y: number };
  secondTip: { x: number; y: number };
}

export function useFamilyClock(): FamilyClock {
  // 真实时钟：单源 Date state，1s 走时（数字时间 / 三针角度 / 日期星期均由此派生）
  const [now, setNow] = useState<Date>(() => new Date());

  // Real-time clock tick — 1 秒 setInterval 真实走时（原参考实现已删，见 git 基线 8424ee1）
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // ===== 真实时钟派生（角度公式同原参考实现，-90° 使零位指向 12 点）=====
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hourAngle = hours * 30 + minutes * 0.5 - 90;
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90;
  const secondAngle = seconds * 6 - 90;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const currentTimeStr = `${pad2(now.getHours())}:${pad2(minutes)}:${pad2(seconds)}`;
  const dateStr = `${String(now.getFullYear()).slice(2)}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())}`;
  const dayIdx = now.getDay();
  const dayLabel = DAY_LABELS[dayIdx] ?? "日";
  const isWeekend = dayIdx === 0 || dayIdx === 6;

  const hourTip = handTip(hourAngle, HAND_HOUR);
  const minuteTip = handTip(minuteAngle, HAND_MINUTE);
  const secondTip = handTip(secondAngle, HAND_SECOND);

  return { currentTimeStr, dateStr, dayLabel, isWeekend, hourTip, minuteTip, secondTip };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
