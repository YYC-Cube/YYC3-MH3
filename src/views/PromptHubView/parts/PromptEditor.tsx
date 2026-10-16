/**
 * file: src/views/PromptHubView/parts/PromptEditor.tsx
 * description: YYC³ 视图分区 — PromptHubView 中栏提示词编辑器（工具栏 + 质量评分条 + 文本域）
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
 * brief: 从 PromptHubView 中栏逐字提取的编辑器 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types, lucide-react
 * exports: PromptEditorProps, PromptEditor
 */
import { Code, Play, Save } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import type { ShowToast } from "../../../types";

export interface PromptEditorProps {
  templateName: string;
  templateVersion: string;
  editorText: string;
  onChangeText: (value: string) => void;
  isTesting: boolean;
  onRunTest: () => void;
  onOpenBatchTest: () => void;
  onShowToast: ShowToast;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  templateName,
  templateVersion,
  editorText,
  onChangeText,
  isTesting,
  onRunTest,
  onOpenBatchTest,
  onShowToast,
}) => {
  return (
    <div className="flex-1 flex flex-col border-r border-[#1e2f47] overflow-hidden">
      {/* Editor Top Bar */}
      <div className="p-3 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#00e0b8]" />
          <span className="text-xs font-semibold text-[#e8f0f8]">{templateName}</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#15294a] text-[#8a97a8] border border-[#1e2f47]">
            {templateVersion}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("success", "模板已成功保存")}
          >
            保存修改
          </Button>
          <Button variant="secondary" size="xs" onClick={() => onOpenBatchTest()}>
            批量测试队列
          </Button>
          <Button
            variant="primary"
            size="xs"
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            loading={isTesting}
            onClick={onRunTest}
          >
            单步推理测试
          </Button>
        </div>
      </div>

      {/* Quality Scoring Bar (Requirement 2.1) */}
      <div className="px-4 py-2 bg-[#0f1f38] border-b border-[#1e2f47] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[#8a97a8]">质量评分模型：</span>
          <span>
            合规性: <strong className="text-[#00e0b8]">98分</strong>
          </span>
          <span>
            完整度: <strong className="text-[#00e0b8]">95分</strong>
          </span>
          <span>
            效果预期: <strong className="text-[#00b4d8]">96分</strong>
          </span>
        </div>
        <Badge variant="brand" size="xs">
          A+ 工业级提示词
        </Badge>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-4 bg-[#0a1628] overflow-y-auto font-mono text-xs">
        <textarea
          value={editorText}
          onChange={(e) => onChangeText(e.target.value)}
          className="w-full h-full bg-transparent text-[#e8f0f8] resize-none focus:outline-none leading-relaxed selection:bg-[#00e0b8]/30"
          spellCheck={false}
        />
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-2 bg-[#0c1a30] border-t border-[#1e2f47] flex items-center justify-between text-[11px] text-[#8a97a8] font-mono">
        <span>{editorText.length} 字符 · UTF-8</span>
        <span>支持 Mustache 语法模板绑定</span>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
