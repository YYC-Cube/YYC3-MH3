/**
 * file: src/views/DesignSystemView/parts/DesignBanner.tsx
 * description: YYC³ 功能视图 — DesignSystemView 顶部规范横幅与分区页签
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
 * brief: DesignSystemView 顶部渐变横幅（版本徽标 / 标题 / 简介 / 导出按钮）
 *        与四大分区页签（Tokens / Atoms / Business / Prompts），逐字搬移自原 DesignSystemView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../useDesignSystemView
 * exports: DesignBannerProps, DesignBanner
 */
import { Activity, Code2, Layers, Palette, Sparkles } from "lucide-react";
import React from "react";
import { Button, Tabs } from "../../../components/common";
import { DesignTab } from "../useDesignSystemView";

export interface DesignBannerProps {
  activeTab: DesignTab;
  onTabChange: (tab: DesignTab) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const DesignBanner: React.FC<DesignBannerProps> = ({ activeTab, onTabChange, onShowToast }) => {
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1a30] via-[#122340] to-[#0c1a30] p-6 border border-[#30363d] overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d4aa]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40">
              Design System v2.0
            </span>
            <span className="text-xs text-[#8b949e]">· 深色科技生产力风格 · 本地闭环AI流水线专属</span>
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">
            MiniMax-H3 本地数字人生产线 · UI设计系统与组件规范
          </h1>
          <p className="text-xs text-[#8b949e] mt-1.5 max-w-2xl leading-relaxed">
            严格遵循工业级深色科技规范，以冷静深空蓝为底、青绿为光，兼具微玻璃拟态与低延时交互，为专业数字人音画对齐与
            Seed 迭代沉淀极致生产力体验。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => onShowToast("info", "设计规范已就绪", "当前系统遵循五步闭环流水线标准设计")}
          >
            导出设计规范 (JSON)
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-6 pt-4 border-t border-[#30363d]/60">
        <Tabs<DesignTab>
          tabs={[
            {
              id: "tokens",
              label: "设计色彩与排版规范 (Tokens)",
              icon: <Palette className="w-3.5 h-3.5" />,
            },
            {
              id: "atoms",
              label: "通用原子与交互组件 (Atoms)",
              icon: <Layers className="w-3.5 h-3.5" />,
            },
            {
              id: "business",
              label: "业务专属生产力组件 (Business)",
              icon: <Activity className="w-3.5 h-3.5" />,
            },
            {
              id: "prompts",
              label: "分场景 AI 设计提示词库 (Prompts)",
              icon: <Code2 className="w-3.5 h-3.5" />,
            },
          ]}
          activeTab={activeTab}
          onChange={onTabChange}
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
