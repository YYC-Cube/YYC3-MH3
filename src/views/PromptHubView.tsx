/**
 * file: src/views/PromptHubView.tsx
 * description: YYC³ 功能视图 — PromptHubView
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — PromptHubView
 *
 * dependencies: react, ../data/content, ../types, lucide-react
 * exports: PromptHubViewProps, PromptHubView
 */
import { Code, FolderTree, History, Play, Save, Sparkles, Star, Tag } from "lucide-react";
import React, { useState } from "react";
import { Badge, Button, Modal } from "../components/common";
import { PROMPT_TEMPLATES } from "../data/content";
import { NavigateExtra, NavTabId } from "../types";

export interface PromptHubViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const PromptHubView: React.FC<PromptHubViewProps> = ({ onShowToast }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PROMPT_TEMPLATES[0]!.id, // mock 常量数组恒非空，静态索引安全
  );
  const activeTemplate =
    PROMPT_TEMPLATES.find((p) => p.id === selectedTemplateId) || PROMPT_TEMPLATES[0];

  const [editorText, setEditorText] = useState(activeTemplate?.text ?? "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    preview: string;
  } | null>(null);

  // Variable mappings state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    gender: "Female",
    clothing_color: "dark navy",
    audio_emotion: "authoritative professional",
    influencer_name: "Luna",
  });

  // Version diff modal
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  // Batch test queue modal
  const [isBatchTestModalOpen, setIsBatchTestModalOpen] = useState(false);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = PROMPT_TEMPLATES.find((p) => p.id === id);
    if (tmpl) {
      setEditorText(tmpl.text);
      setTestResult(null);
    }
  };

  const handleRunTestInference = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        score: 95.4,
        preview: "/placeholders/person.svg",
      });
      onShowToast("success", "单步推理测试完成", "置信度评分: 95.4分，已生成低分辨率对比样张");
    }, 1500);
  };

  // 数据守卫：无匹配模板时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!activeTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#8a97a8] bg-[#0a1628]">
        暂无提示词模板数据
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a1628]">
      {/* Left Column: Template Tree (Width: 260px) */}
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
            const isSelected = tmpl.id === activeTemplate.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id)}
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
            onClick={() => setIsDiffModalOpen(true)}
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

      {/* Middle Column: Code Editor (Flex 1) */}
      <div className="flex-1 flex flex-col border-r border-[#1e2f47] overflow-hidden">
        {/* Editor Top Bar */}
        <div className="p-3 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#00e0b8]" />
            <span className="text-xs font-semibold text-[#e8f0f8]">{activeTemplate.name}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#15294a] text-[#8a97a8] border border-[#1e2f47]">
              {activeTemplate.version}
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
            <Button variant="secondary" size="xs" onClick={() => setIsBatchTestModalOpen(true)}>
              批量测试队列
            </Button>
            <Button
              variant="primary"
              size="xs"
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              loading={isTesting}
              onClick={handleRunTestInference}
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
            onChange={(e) => setEditorText(e.target.value)}
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

      {/* Right Column: Variable Mapping & Instant Testbench (Width: 340px) */}
      <div className="w-80 bg-[#0c1a30] flex flex-col flex-shrink-0 p-4 space-y-4 overflow-y-auto">
        {/* Variable Mapping Panel (Requirement 2.1) */}
        <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-[#e8f0f8]">
              <Tag className="w-3.5 h-3.5 text-[#00e0b8]" />
              <span>动态变量占位符映射</span>
            </div>
            <span className="text-[10px] font-mono text-[#00e0b8]">
              {activeTemplate.variables.length} 变量
            </span>
          </div>

          {activeTemplate.variables.length > 0 ? (
            <div className="space-y-2 text-xs">
              {activeTemplate.variables.map((v) => (
                <div key={v} className="space-y-1">
                  <span className="font-mono text-[11px] text-[#8a97a8]">{`{{${v}}}`}</span>
                  <input
                    type="text"
                    value={variableValues[v] || ""}
                    onChange={(e) =>
                      setVariableValues({
                        ...variableValues,
                        [v]: e.target.value,
                      })
                    }
                    className="w-full h-7 px-2 rounded bg-[#15294a] border border-[#1e2f47] text-xs text-[#e8f0f8] focus:outline-none focus:border-[#00e0b8]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5c697a]">当前模板无额外变量</p>
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
            <div className="aspect-video rounded-xl bg-[#15294a]/40 border border-dashed border-[#1e2f47] flex flex-col items-center justify-center p-6 text-center text-xs text-[#5c697a]">
              <span>点击「单步推理测试」</span>
              <span className="text-[11px] mt-1">即刻调用本地模型验证替换后效果</span>
            </div>
          )}
        </div>
      </div>

      {/* Version Diff Modal */}
      <Modal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        title="模板版本 Diff 对比 (Template Version Diff)"
        footer={
          <Button variant="ghost" size="sm" onClick={() => setIsDiffModalOpen(false)}>
            关闭
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-[#8a97a8]">
            <span>当前编辑版本 (v3.2)</span>
            <span>上一个基线版本 (v3.1)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#15294a] font-mono leading-relaxed space-y-1">
            <p className="text-[#00e0b8]">
              + Direct eye gaze at camera with gentle professional authority
            </p>
            <p className="text-[#ff7a45]">- Static eye gaze looking forward</p>
            <p className="text-[#e8f0f8]">
              {" "}
              Ultra-detailed facial epidermis pores, realistic 8k skin
            </p>
          </div>
        </div>
      </Modal>

      {/* Batch Test Queue Modal */}
      <Modal
        isOpen={isBatchTestModalOpen}
        onClose={() => setIsBatchTestModalOpen(false)}
        title="批量参数提示词测试队列 (Batch Inference Test)"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsBatchTestModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsBatchTestModalOpen(false);
                onShowToast("success", "已加入 4 组变量组合测试队列", "结果将在完成时通知");
              }}
            >
              启动批量测试
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#8a97a8]">自动交叉组合变量，生成 4 组测试样本进行对比：</p>
          <div className="p-3 rounded-lg bg-[#15294a] space-y-1 font-mono text-[11px]">
            <div>1. [Female, dark navy suit, authoritative]</div>
            <div>2. [Female, crimson suit, authoritative]</div>
            <div>3. [Male, dark navy suit, authoritative]</div>
            <div>4. [Male, charcoal suit, neutral]</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
