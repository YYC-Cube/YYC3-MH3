/**
 * file: src/views/ModelsView/parts/EnvChecklist.tsx
 * description: YYC³ 视图分区 — ModelsView 计算依赖栈自检诊断清单
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
 * brief: 从 ModelsView「计算依赖环境检测」页签逐字提取的诊断清单 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common
 * exports: EnvChecklist
 */
import React from "react";
import { Badge, Card } from "../../../components/common";

export const EnvChecklist: React.FC = () => {
  return (
    <Card title="计算依赖栈自检诊断 (Dependency Stack)">
      <div className="divide-y divide-[#1e2f47]/50 text-xs">
        {[
          {
            item: "PyTorch 核心运行时",
            ver: "2.4.0+cu124",
            status: "pass",
            note: "FlashAttention-2 已开启",
          },
          {
            item: "NVIDIA CUDA 驱动",
            ver: "12.4 (Driver 550.54)",
            status: "pass",
            note: "RTX 4090 24GB 支持正常",
          },
          {
            item: "TensorRT 推理加速引擎",
            ver: "10.2.0",
            status: "pass",
            note: "FP8 权重加速算子就绪",
          },
          {
            item: "FFmpeg 硬件编解码器",
            ver: "6.1.1 (h264_nvenc)",
            status: "pass",
            note: "NVENC 硬件加速启用",
          },
          {
            item: "本地遥测聚合服务",
            ver: "6.0 (Bun/Node 22)",
            status: "pass",
            note: "单端口 3031 监听中",
          },
        ].map((env, idx) => (
          <div key={idx} className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#e8f0f8]">{env.item}</span>
              <span className="font-mono text-[11px] text-[#00e0b8] ml-2">v{env.ver}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#8a97a8]">{env.note}</span>
              <Badge variant="brand" size="xs">
                健康 PASS
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
