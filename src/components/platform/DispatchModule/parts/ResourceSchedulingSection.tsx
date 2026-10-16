/**
 * file: src/components/platform/DispatchModule/parts/ResourceSchedulingSection.tsx
 * description: YYC³ 平台分区 — DispatchModule 动态资源调度（账号授权状态 + 异常重试策略）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[platform],[part],[dispatch],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 DispatchModule「动态资源调度」逐字提取的双卡 JSX（零重设计）。
 *
 * dependencies: react, ../../../common, ../../../../types
 * exports: ResourceSchedulingSectionProps, ResourceSchedulingSection
 */
import React from "react";
import type { ShowToast } from "../../../../types";
import { Badge, Button } from "../../../common";

export interface ResourceSchedulingSectionProps {
  onShowToast: ShowToast;
}

export const ResourceSchedulingSection: React.FC<ResourceSchedulingSectionProps> = ({
  onShowToast,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#e8f0f8]">多平台账号授权认证状态</span>
          <span className="text-[10px] text-[#00e0b8] font-mono">5/5 授权有效</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center p-1.5 rounded bg-[#15294a]">
            <span className="text-[#e8f0f8]">抖音开放平台矩阵 (4号)</span>
            <Badge variant="brand" size="xs">
              已鉴权
            </Badge>
          </div>
          <div className="flex justify-between items-center p-1.5 rounded bg-[#15294a]">
            <span className="text-[#e8f0f8]">微信视频号创作者中心</span>
            <Badge variant="brand" size="xs">
              已鉴权
            </Badge>
          </div>
          <div className="flex justify-between items-center p-1.5 rounded bg-[#15294a]">
            <span className="text-[#e8f0f8]">Bilibili Open Platform</span>
            <Badge variant="brand" size="xs">
              已鉴权
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#e8f0f8]">推送异常自动重试策略</span>
          <Badge variant="brand" size="xs">
            自愈中
          </Badge>
        </div>
        <p className="text-xs text-[#8a97a8] leading-relaxed">
          网络抖动或平台限流时，采用指数退避算法（30s、60s、120s）自动重试，失败满 3
          次自动转入人工复核队列。
        </p>
        <Button
          variant="outline"
          size="xs"
          className="w-full"
          onClick={() => onShowToast("info", "策略已更新")}
        >
          配置重试超参数
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
