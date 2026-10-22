/**
 * file: src/views/DesignSystemView/parts/TokensTab.tsx
 * description: YYC³ 功能视图 — DesignSystemView 设计色彩与排版规范页签
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[designsystem],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DesignSystemView TAB 1 —— 色彩体系 / 排版字体系统 / 动效与质感三类设计令牌展示，
 *        逐字搬移自原 DesignSystemView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../data/design
 * exports: TokensTabProps, TokensTab
 */
import { Check, Copy, Palette, Sliders, Type } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { DESIGN_SYSTEM_COLORS, DESIGN_SYSTEM_TYPOGRAPHY } from "../../../data/design";

export interface TokensTabProps {
  copiedHex: string | null;
  onCopyColor: (hex: string) => void;
  onOpenModal: () => void;
}

export const TokensTab: React.FC<TokensTabProps> = ({ copiedHex, onCopyColor, onOpenModal }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Section: Colors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#00d4aa]" />
              色彩体系规范 (Color System Tokens)
            </h2>
            <p className="text-xs text-[#8b949e] mt-0.5">
              以深空蓝底色为基石，青绿为功能高亮，分层清晰，保障长时间监视与生产作业的视觉舒适度
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {DESIGN_SYSTEM_COLORS.map((c) => {
            const isCopied = copiedHex === c.hex;
            return (
              <div
                key={c.hex}
                onClick={() => onCopyColor(c.hex)}
                className="p-3 rounded-xl bg-[#0c1a30] border border-[#30363d] hover:border-[#00d4aa]/60 transition-all cursor-pointer group hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-10 h-10 rounded-lg border border-white/10 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                    >
                      <span className="text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-1 rounded text-white">
                        {isCopied ? <Check className="w-3 h-3 text-[#00d4aa]" /> : <Copy className="w-3 h-3" />}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#e6edf3] group-hover:text-[#00d4aa] transition-colors">
                      {c.hex}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#e6edf3] truncate">{c.name}</div>
                  <div className="text-[11px] text-[#8b949e] mt-1 leading-relaxed line-clamp-2">{c.role}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#30363d]/60 flex items-center justify-between text-[10px] text-[#8b949e]">
                  <span>点击复制 HEX</span>
                  <span className="font-mono text-[#8b949e]">{c.sample}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Typography */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
            <Type className="w-4 h-4 text-[#00b4d8]" />
            排版与字体系统规范 (Typography System)
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            英文与数字基准 Inter，中文思源黑体，终端与数值统一采用 JetBrains Mono
          </p>
        </div>

        <div className="rounded-xl bg-[#0c1a30] border border-[#30363d] overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 bg-[#122340] text-[11px] font-semibold text-[#8b949e] border-b border-[#30363d]">
            <div className="col-span-3">层级名称</div>
            <div className="col-span-2">字号 / 字重</div>
            <div className="col-span-2">字体系列</div>
            <div className="col-span-5">界面实景预览</div>
          </div>
          <div className="divide-y divide-[#30363d]/60">
            {DESIGN_SYSTEM_TYPOGRAPHY.map((t, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-[#122340]/40 transition-colors"
              >
                <div className="col-span-3 font-medium text-[#e6edf3]">{t.level}</div>
                <div className="col-span-2 font-mono text-[#00d4aa] text-[11px]">
                  {t.size} · {t.weight}
                </div>
                <div className="col-span-2 text-[#8b949e] text-[11px]">{t.font}</div>
                <div className="col-span-5 text-[#e6edf3] truncate" style={{ fontSize: t.size }}>
                  {t.sample}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Motion & Elevation Tokens */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#9B59B6]" />
            动效与质感系统 (Motion & Elevation Tokens)
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">克制高效，服务反馈，微玻璃拟态 + 细边框分层，无冗余打扰动效</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] space-y-2">
            <span className="text-xs font-semibold text-[#00d4aa]">微动效时长 (0.15s)</span>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              用于按钮 hover/active、输入框聚焦光圈、Tooltip 滑出与下拉箭头展开，提供即时敏捷的操作触觉反馈。
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button variant="secondary" size="xs">
                0.15s 反馈示例
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] space-y-2">
            <span className="text-xs font-semibold text-[#00b4d8]">面板切换过渡 (0.25s)</span>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              用于右侧抽屉滑入、模态框中心缩放淡出、标签页指示条平滑滑移。曲线采用 ease-out-cubic。
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button variant="outline" size="xs" onClick={onOpenModal}>
                模态框进入体验
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] space-y-2">
            <span className="text-xs font-semibold text-[#9B59B6]">流水线粒子流 (2.5s 恒流)</span>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              用于五阶段执行进度条的光流通道与节点呼吸灯，直观表达后台 CUDA 神经渲染工作状态。
            </p>
            <div className="pt-2">
              <div className="h-2 rounded-full pipeline-flowing w-full" />
            </div>
          </div>
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
