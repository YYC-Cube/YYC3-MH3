/**
 * file: src/views/ModelsView/parts/ModelsHeader.tsx
 * description: YYC³ 视图分区 — ModelsView 顶部标头（标题 + 本地安全隔离徽标 + 权重哈希校验）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[models],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 ModelsView 逐字提取的顶部标头 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types, lucide-react
 * exports: ModelsHeaderProps, ModelsHeader
 */
import { RefreshCw } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import type { ShowToast } from "../../../types";

export interface ModelsHeaderProps {
  onShowToast: ShowToast;
}

export const ModelsHeader: React.FC<ModelsHeaderProps> = ({ onShowToast }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#e8f0f8]">本地模型与计算资源管控 · Models & Resources</h1>
          <Badge variant="brand" size="xs">
            本地安全隔离
          </Badge>
        </div>
        <p className="text-xs text-[#8a97a8] mt-1">
          DiffSynth-MiniMax-H3 系列模型权重常驻、显存分级加载与本地依赖环境检测
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => onShowToast("info", "模型权重完整性校验完成 (SHA256 匹配)")}
        >
          校验权重哈希
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
