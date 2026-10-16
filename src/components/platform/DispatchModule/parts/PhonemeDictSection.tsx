/**
 * file: src/components/platform/DispatchModule/parts/PhonemeDictSection.tsx
 * description: YYC³ 平台分区 — DispatchModule 多语种唇形音素字典中心
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[platform],[part],[dispatch],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 DispatchModule「多语种唇形音素字典中心」逐字提取的字典卡 JSX（零重设计）。
 *
 * dependencies: react, ../../../common, ../../../../types, lucide-react
 * exports: PhonemeDictSectionProps, PhonemeDictSection
 */
import { Download } from "lucide-react";
import React from "react";
import type { ShowToast } from "../../../../types";
import { Badge, Button, Card } from "../../../common";

/** 多语种音素字典展示数据（展示语义与 PhonemeLanguage 契约存在措辞差异，如实本地化） */
const PHONEME_DICT = [
  {
    name: "中文普通话 (Mandarin Pro)",
    code: "zh-CN",
    count: "412 音素",
    acc: "98.4%",
    status: "已常驻",
  },
  {
    name: "英语 (US English Studio)",
    code: "en-US",
    count: "48 纯正音素",
    acc: "97.8%",
    status: "已优化",
  },
  {
    name: "日语 (Japanese Kana/Moras)",
    code: "ja-JP",
    count: "112 音拍",
    acc: "96.5%",
    status: "已就绪",
  },
  {
    name: "西班牙语 (Spanish Castilian)",
    code: "es-ES",
    count: "64 重音特征",
    acc: "95.8%",
    status: "可加载",
  },
];

export interface PhonemeDictSectionProps {
  onShowToast: ShowToast;
}

export const PhonemeDictSection: React.FC<PhonemeDictSectionProps> = ({ onShowToast }) => {
  return (
    <Card
      title="多语种唇形音素字典中心 (言启·千行节点赋能)"
      subtitle="支持跨语种音素频谱特征对齐 · 支撑出海与多语言矩阵数字人生产"
      action={
        <Button
          variant="secondary"
          size="xs"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => onShowToast("success", "已检查全语言音素词典更新")}
        >
          同步最新词典包
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {PHONEME_DICT.map((lang) => (
          <div
            key={lang.code}
            className="p-3 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-1.5"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#e8f0f8] font-sans">{lang.name}</span>
              <Badge variant="brand" size="xs">
                {lang.code}
              </Badge>
            </div>
            <div className="flex justify-between font-mono text-[11px] text-[#8a97a8]">
              <span>{lang.count}</span>
              <span className="text-[#00e0b8] font-bold">精度 {lang.acc}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#1e2f47]/50 text-[10px]">
              <span className="text-[#8b949e]">{lang.status}</span>
              <button
                onClick={() => onShowToast("success", `已切换 ${lang.name} 作为当前对齐基准`)}
                className="text-[#00e0b8] hover:underline cursor-pointer"
              >
                设为主词典
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
