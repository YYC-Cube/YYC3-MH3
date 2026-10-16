/**
 * file: src/components/yyc3/YYC3FamilyModal/parts/MemberIcon.tsx
 * description: YYC³ AI Family 协同组件 — 成员角色图标渲染器
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[ai-family],[icon],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 按家庭成员 iconType 派发对应 lucide 角色图标（统一尺寸与着色）
 *
 * dependencies: react, lucide-react, ../../../../types
 * exports: renderMemberIcon
 */
import { Brain, Ear, Eye, GitBranch, Lightbulb, Scale, Shield, Star } from "lucide-react";
import type React from "react";
import type { YYC3Member } from "../../../../types";

export function renderMemberIcon(type: YYC3Member["iconType"], color: string): React.ReactNode {
  const iconProps = { className: "w-5 h-5", style: { color } };
  switch (type) {
    case "speech":
      return <Ear {...iconProps} />;
    case "brain":
      return <Brain {...iconProps} />;
    case "eye":
      return <Eye {...iconProps} />;
    case "star":
      return <Star {...iconProps} className="w-5 h-5 fill-current" />;
    case "tree":
      return <GitBranch {...iconProps} />;
    case "shield":
      return <Shield {...iconProps} />;
    case "balance":
      return <Scale {...iconProps} />;
    case "lightbulb":
      return <Lightbulb {...iconProps} />;
  }
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
