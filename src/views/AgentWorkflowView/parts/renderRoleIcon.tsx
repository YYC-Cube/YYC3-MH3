/**
 * file: src/views/AgentWorkflowView/parts/renderRoleIcon.tsx
 * description: YYC³ 功能视图 — AgentWorkflowView 角色图标渲染器
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[agent],[workflow],[icon],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 按 AI Family memberId 派发对应 lucide 角色图标（未知成员回退 Sparkles）
 *
 * dependencies: lucide-react
 * exports: renderRoleIcon
 */
import { Brain, Ear, Eye, GitBranch, Lightbulb, Scale, Shield, Sparkles, Star } from "lucide-react";
import type React from "react";

export function renderRoleIcon(memberId: string): React.ReactNode {
  switch (memberId) {
    case "yanqi":
      return <Ear className="w-3.5 h-3.5" />;
    case "yushu":
      return <Brain className="w-3.5 h-3.5" />;
    case "yujian":
      return <Eye className="w-3.5 h-3.5" />;
    case "qianli":
      return <Star className="w-3.5 h-3.5 fill-current" />;
    case "yuanqi":
      return <GitBranch className="w-3.5 h-3.5" />;
    case "zhiyun":
      return <Shield className="w-3.5 h-3.5" />;
    case "gewu":
      return <Scale className="w-3.5 h-3.5" />;
    case "chuangxiang":
      return <Lightbulb className="w-3.5 h-3.5" />;
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
