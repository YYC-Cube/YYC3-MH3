/**
 * file: src/views/PromptHubView/usePromptHub.ts
 * description: YYC³ 视图状态 — PromptHubView 提示词工程中心状态机（模板选择 / 变量映射 / 单步推理 / 双弹窗）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[hook],[state],[prompt],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: PromptHubView 唯一状态真值源 —— 从原视图逐字提取的状态与事件编排，零重设计。
 *
 * dependencies: react, ../../data/content, ../../types
 * exports: PromptTestResult, UsePromptHubReturn, usePromptHub
 */
import { useState } from "react";
import { PROMPT_TEMPLATES } from "../../data/content";
import type { ShowToast } from "../../types";

/** 单步推理测试结果（置信度评分 + 低分辨率对比样张） */
export interface PromptTestResult {
  score: number;
  preview: string;
}

/** PromptHubView 状态与事件编排的完整装配面 */
export interface UsePromptHubReturn {
  activeTemplate: (typeof PROMPT_TEMPLATES)[number] | undefined;
  editorText: string;
  setEditorText: (value: string) => void;
  isTesting: boolean;
  testResult: PromptTestResult | null;
  variableValues: Record<string, string>;
  handleVariableChange: (name: string, value: string) => void;
  isDiffModalOpen: boolean;
  openDiffModal: () => void;
  closeDiffModal: () => void;
  isBatchTestModalOpen: boolean;
  openBatchTestModal: () => void;
  closeBatchTestModal: () => void;
  handleSelectTemplate: (id: string) => void;
  handleRunTestInference: () => void;
}

export function usePromptHub(onShowToast: ShowToast): UsePromptHubReturn {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PROMPT_TEMPLATES[0]!.id, // mock 常量数组恒非空，静态索引安全
  );
  const activeTemplate = PROMPT_TEMPLATES.find((p) => p.id === selectedTemplateId) || PROMPT_TEMPLATES[0];

  const [editorText, setEditorText] = useState(activeTemplate?.text ?? "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<PromptTestResult | null>(null);

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

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues({ ...variableValues, [name]: value });
  };

  return {
    activeTemplate,
    editorText,
    setEditorText,
    isTesting,
    testResult,
    variableValues,
    handleVariableChange,
    isDiffModalOpen,
    openDiffModal: () => setIsDiffModalOpen(true),
    closeDiffModal: () => setIsDiffModalOpen(false),
    isBatchTestModalOpen,
    openBatchTestModal: () => setIsBatchTestModalOpen(true),
    closeBatchTestModal: () => setIsBatchTestModalOpen(false),
    handleSelectTemplate,
    handleRunTestInference,
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
