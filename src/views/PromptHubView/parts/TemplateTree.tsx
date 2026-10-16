/**
 * file: src/views/PromptHubView/parts/TemplateTree.tsx
 * description: YYC³ 视图分区 — PromptHubView 左栏提示词分类目录树（选择 + 版本 Diff / AI 扩写入口）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[prompt],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 PromptHubView 左栏逐字提取的模板目录树 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../data/content, ../../../types, lucide-react
 * exports: TemplateTreeProps, TemplateTree
 */
import { FolderTree, History, Sparkles } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { PROMPT_TEMPLATES } from "../../../data/content";
import type { ShowToast } from "../../../types";

export interface TemplateTreeProps {
  activeTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onOpenDiff: () => void;
  onShowToast: ShowToast;
}

export const TemplateTree: React.FC<TemplateTreeProps> = ({
  activeTemplateId,
  onSelectTemplate,
  onOpenDiff,
  onShowToast,
}) => {
  return (
    <div className="w-64 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0">
      <div className="p-3.5 border-b border-[#1e2f47] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-[#00e0b8]" />
          <span className="text-xs font-semibold text-[#e8f0f8]">提示词分类目录</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15294a] text-[#8a97a8] border border-[#1e2f47]">
          {PROMPT_TEMPLATES.length} 模板
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {PROMPT_TEMPLATES.map((tmpl) => {
          const isSelected = tmpl.id === activeTemplateId;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#15294a] border-[#00e0b8] shadow-[0_0_12px_rgba(0,224,184,0.18)]"
                  : "bg-[#0f1f38] border-[#1e2f47] hover:border-[#294060]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#00b4d8]">{tmpl.category}</span>
                {tmpl.isBestPractice && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00e0b8]/20 text-[#00e0b8] font-bold">
                    最佳实践
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-[#e8f0f8] truncate mb-1">{tmpl.name}</div>
              <div className="flex items-center justify-between text-[10px] text-[#8a97a8] font-mono">
                <span>版本: {tmpl.version}</span>
                <span className="text-[#00e0b8] font-semibold">{tmpl.rating}分</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#1e2f47] bg-[#0a1628]/60 space-y-2">
        <Button
          variant="secondary"
          size="xs"
          className="w-full"
          icon={<History className="w-3.5 h-3.5" />}
          onClick={() => onOpenDiff()}
        >
          版本 Diff 对比
        </Button>
        <Button
          variant="primary"
          size="xs"
          className="w-full"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => onShowToast("info", "正在由 LLM 扩写提示词变体...")}
        >
          AI 自动扩写变体
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
