/**
 * file: src/views/PromptHubView/parts/TestSidebar.tsx
 * description: YYC³ 视图分区 — PromptHubView 右栏变量映射面板 + 快速单步验证测试区
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
 * brief: 从 PromptHubView 右栏逐字提取的变量映射与即时测试台 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../usePromptHub, lucide-react
 * exports: TestSidebarProps, TestSidebar
 */
import { Star, Tag } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import type { PromptTestResult } from "../usePromptHub";
import type { ShowToast } from "../../../types";

export interface TestSidebarProps {
  variables: string[];
  variableValues: Record<string, string>;
  onVariableChange: (name: string, value: string) => void;
  isTesting: boolean;
  testResult: PromptTestResult | null;
  onShowToast: ShowToast;
}

export const TestSidebar: React.FC<TestSidebarProps> = ({
  variables,
  variableValues,
  onVariableChange,
  isTesting,
  testResult,
  onShowToast,
}) => {
  return (
    <div className="w-80 bg-[#0c1a30] flex flex-col flex-shrink-0 p-4 space-y-4 overflow-y-auto">
      {/* Variable Mapping Panel (Requirement 2.1) */}
      <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-[#e8f0f8]">
            <Tag className="w-3.5 h-3.5 text-[#00e0b8]" />
            <span>动态变量占位符映射</span>
          </div>
          <span className="text-[10px] font-mono text-[#00e0b8]">{variables.length} 变量</span>
        </div>

        {variables.length > 0 ? (
          <div className="space-y-2 text-xs">
            {variables.map((v) => (
              <div key={v} className="space-y-1">
                <span className="font-mono text-[11px] text-[#8a97a8]">{`{{${v}}}`}</span>
                <input
                  type="text"
                  value={variableValues[v] || ""}
                  onChange={(e) => onVariableChange(v, e.target.value)}
                  className="w-full h-7 px-2 rounded bg-[#15294a] border border-[#1e2f47] text-xs text-[#e8f0f8] focus:outline-none focus:border-[#00e0b8]"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8b949e]">当前模板无额外变量</p>
        )}
      </div>

      {/* Instant Inference Testbench */}
      <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
          <span className="text-xs font-semibold text-[#e8f0f8]">快速单步验证测试区</span>
          <Badge variant="brand" size="xs">
            0.8s 极速推理
          </Badge>
        </div>

        {isTesting ? (
          <div className="aspect-video rounded-xl bg-[#15294a] border border-[#1e2f47] flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#00e0b8] border-t-transparent animate-spin" />
            <span className="text-xs text-[#00e0b8] font-mono">
              DiffSynth 正在提取 30 步潜空间特征...
            </span>
          </div>
        ) : testResult ? (
          <div className="space-y-3 animate-in fade-in">
            <div className="aspect-video rounded-xl overflow-hidden border border-[#00e0b8] relative group">
              <img
                src={testResult.preview}
                alt="Test Result"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0a1628]/80 text-[#00e0b8] font-mono text-xs font-bold border border-[#00e0b8]">
                {testResult.score} 分
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-1 text-xs">
              <div className="flex justify-between text-[#8a97a8]">
                <span>口型时延吻合度</span>
                <span className="font-mono text-[#00e0b8]">96.2%</span>
              </div>
              <div className="flex justify-between text-[#8a97a8]">
                <span>微表情自然度</span>
                <span className="font-mono text-[#00e0b8]">94.8%</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon={<Star className="w-3.5 h-3.5 fill-current" />}
              onClick={() => {
                onShowToast("success", "已加入最佳实践库", "该模板已标记为企业级金牌提示词");
              }}
            >
              一键加入最佳实践库
            </Button>
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-[#15294a]/40 border border-dashed border-[#1e2f47] flex flex-col items-center justify-center p-6 text-center text-xs text-[#8b949e]">
            <span>点击「单步推理测试」</span>
            <span className="text-[11px] mt-1">即刻调用本地模型验证替换后效果</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
