/**
 * file: src/views/WorkbenchView/parts/TemplateBar.tsx
 * description: YYC³ 功能视图 — WorkbenchView 顶部参数模板快捷切换条
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 顶部常用模板胶囊条 + 参数版本对比 / 批量参数导入入口，
 *        逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: TemplateBarProps, TemplateBar
 */
import { Bookmark, History, Upload } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { ParameterTemplate } from "../../../types";

const PRESET_TEMPLATES: ParameterTemplate[] = [
  {
    id: "tmpl-1",
    name: "4K播音权威主播 (S级基线)",
    mode: "Ref2VA",
    steps: 32,
    guidanceScale: 7.5,
    denoiseStrength: 0.65,
    resolution: "1080x1920",
    fps: 30,
    fp8: true,
    desc: "最适合金融新闻早报，口型时延极低 (<0.04s)",
  },
  {
    id: "tmpl-2",
    name: "60FPS 运动高动态长镜头",
    mode: "FL2VA",
    steps: 35,
    guidanceScale: 8.0,
    denoiseStrength: 0.68,
    resolution: "1080x1920",
    fps: 60,
    fp8: true,
    desc: "双关键帧插值，适合科技发布会与舞台演说",
  },
  {
    id: "tmpl-3",
    name: "电商带货高频微表情",
    mode: "Ref2VA",
    steps: 28,
    guidanceScale: 6.8,
    denoiseStrength: 0.7,
    resolution: "720x1280",
    fps: 30,
    fp8: false,
    desc: "极速生成，眼睑微表情自然，面部高饱和",
  },
];

export interface TemplateBarProps {
  onApplyTemplate: (tmpl: ParameterTemplate) => void;
  onOpenDiff: () => void;
  onOpenImport: () => void;
}

export const TemplateBar: React.FC<TemplateBarProps> = ({ onApplyTemplate, onOpenDiff, onOpenImport }) => {
  return (
    <div className="px-4 py-2 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between gap-4 text-xs select-none flex-shrink-0">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-[#8a97a8] whitespace-nowrap text-[11px] font-medium flex items-center gap-1">
          <Bookmark className="w-3.5 h-3.5 text-[#00e0b8]" />
          常用模板:
        </span>
        {PRESET_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onApplyTemplate(tmpl)}
            className="px-2.5 py-1 rounded-full bg-[#15294a] hover:bg-[#182f54] text-[#8a97a8] hover:text-[#00e0b8] border border-[#1e2f47] hover:border-[#00e0b8]/40 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{tmpl.name}</span>
            <span className="text-[10px] text-[#8b949e] font-mono">{tmpl.mode}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="xs" icon={<History className="w-3.5 h-3.5" />} onClick={onOpenDiff}>
          参数版本对比
        </Button>
        <Button variant="secondary" size="xs" icon={<Upload className="w-3.5 h-3.5" />} onClick={onOpenImport}>
          批量参数导入
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
