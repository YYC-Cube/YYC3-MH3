/**
 * file: src/views/ModelsView/parts/ModelsGrid.tsx
 * description: YYC³ 视图分区 — ModelsView 模型权重清单卡片网格（预热/显存释放交互）
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
 * brief: 从 ModelsView「模型权重清单」页签逐字提取的卡片网格 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types, lucide-react
 * exports: ModelsGridProps, ModelsGrid
 */
import { Play } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";
import type { ShowToast } from "../../../types";

export interface ModelsGridProps {
  onWarmup: (modelName: string) => void;
  onShowToast: ShowToast;
}

export const ModelsGrid: React.FC<ModelsGridProps> = ({ onWarmup, onShowToast }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        {
          name: "DiffSynth-MiniMax-H3-v2.1-HQ",
          desc: "最高精细度旗舰权重，支持 4K 超分与微表情高保真对齐",
          size: "14.8 GB",
          vram: "8.2 GB (FP8)",
          status: "loaded",
          isDefault: true,
        },
        {
          name: "DiffSynth-MiniMax-H3-v2.0-Fast",
          desc: "极速推理轻量化模型，适合短视频批量带货与快速预览",
          size: "9.2 GB",
          vram: "5.4 GB",
          status: "standby",
          isDefault: false,
        },
        {
          name: "SyncNet-v3-MultiLingual",
          desc: "多语种唇齿运动音视频对齐特征打分网络",
          size: "1.8 GB",
          vram: "1.2 GB",
          status: "loaded",
          isDefault: true,
        },
        {
          name: "FaceParsing-BiseNet-4K",
          desc: "面部五官超细粒度分割与边缘抗撕裂掩码模型",
          size: "640 MB",
          vram: "500 MB",
          status: "loaded",
          isDefault: true,
        },
      ].map((m, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-xs text-[#e8f0f8]">{m.name}</span>
              <div className="flex items-center gap-2">
                {m.isDefault && (
                  <Badge variant="brand" size="xs">
                    默认主干
                  </Badge>
                )}
                <Badge variant={m.status === "loaded" ? "brand" : "neutral"} size="xs">
                  {m.status === "loaded" ? "已常驻显存" : "就绪待命"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-[#8a97a8] leading-relaxed">{m.desc}</p>
          </div>

          <div className="pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between text-xs">
            <div className="font-mono text-[#8a97a8]">
              <span>文件: {m.size}</span>
              <span className="mx-2">·</span>
              <span className="text-[#00e0b8]">常驻: {m.vram}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                icon={<Play className="w-3 h-3 text-[#00e0b8]" />}
                onClick={() => onWarmup(m.name)}
              >
                预热测试
              </Button>
              <Button variant="secondary" size="xs" onClick={() => onShowToast("info", `${m.name} 状态已更新`)}>
                {m.status === "loaded" ? "释放显存" : "载入显存"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
