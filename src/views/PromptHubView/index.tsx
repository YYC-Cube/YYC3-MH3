/**
 * file: src/views/PromptHubView/index.tsx
 * description: YYC³ 功能视图 — PromptHubView 入口容器（三栏装配 + 双弹窗编排）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[prompt],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 提示词工程中心入口 —— 收敛模板/编辑器/变量/测试/弹窗单一真值（usePromptHub），
 *        装配左中右三栏与双弹窗；大块栏位 JSX 分别下沉至 parts（TemplateTree /
 *        PromptEditor / TestSidebar / DiffModal / BatchTestModal）。
 *
 * dependencies: react, ../../types, ./usePromptHub, ./parts/TemplateTree, ./parts/PromptEditor, ./parts/TestSidebar, ./parts/DiffModal, ./parts/BatchTestModal
 * exports: PromptHubViewProps, PromptHubView
 */
import React from "react";
import type { NavTabId, NavigateExtra } from "../../types";
import { usePromptHub } from "./usePromptHub";
import { BatchTestModal } from "./parts/BatchTestModal";
import { DiffModal } from "./parts/DiffModal";
import { PromptEditor } from "./parts/PromptEditor";
import { TemplateTree } from "./parts/TemplateTree";
import { TestSidebar } from "./parts/TestSidebar";

export interface PromptHubViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const PromptHubView: React.FC<PromptHubViewProps> = ({ onShowToast }) => {
  const view = usePromptHub(onShowToast);

  // 数据守卫：无匹配模板时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!view.activeTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#8a97a8] bg-[#0a1628]">
        暂无提示词模板数据
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a1628]">
      <TemplateTree
        activeTemplateId={view.activeTemplate.id}
        onSelectTemplate={view.handleSelectTemplate}
        onOpenDiff={view.openDiffModal}
        onShowToast={onShowToast}
      />

      <PromptEditor
        templateName={view.activeTemplate.name}
        templateVersion={view.activeTemplate.version}
        editorText={view.editorText}
        onChangeText={view.setEditorText}
        isTesting={view.isTesting}
        onRunTest={view.handleRunTestInference}
        onOpenBatchTest={view.openBatchTestModal}
        onShowToast={onShowToast}
      />

      <TestSidebar
        variables={view.activeTemplate.variables}
        variableValues={view.variableValues}
        onVariableChange={view.handleVariableChange}
        isTesting={view.isTesting}
        testResult={view.testResult}
        onShowToast={onShowToast}
      />

      <DiffModal isOpen={view.isDiffModalOpen} onClose={view.closeDiffModal} />

      <BatchTestModal
        isOpen={view.isBatchTestModalOpen}
        onClose={view.closeBatchTestModal}
        onShowToast={onShowToast}
      />
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
