/**
 * file: src/views/BatchDetailView/parts/ArtifactsPanel.tsx
 * description: YYC³ 功能视图 — BatchDetailView 页签 A · 生产产物矩阵（5 项）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[artifacts],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 页签 A 生产产物矩阵（渲染视频/关键点/热力图/频谱/深度图），
 *        逐字搬移自原 BatchDetailView.tsx（TAB A）。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types, ../useBatchDetailView
 * exports: ArtifactsPanelProps, ArtifactsPanel
 */
import { ZoomIn } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { BatchItem } from "../../../types";
import { ZoomedArtifact } from "../useBatchDetailView";

export interface ArtifactsPanelProps {
  currentBatch: BatchItem;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  onZoomArtifact: (artifact: ZoomedArtifact) => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  currentBatch,
  onShowToast,
  onZoomArtifact,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {
          title: "1. 最终 4K 神经渲染视频 (MP4)",
          meta: "codec: h264 · 1080x1920 30fps · 10.0s",
          thumb: currentBatch.previewThumbnail,
        },
        {
          title: "2. Frame 0 关键面容与特征对齐点 (Landmark)",
          meta: "468 特征关键点向量置信度 99.4%",
          thumb: currentBatch.previewThumbnail,
        },
        {
          title: "3. SyncNet 唇齿微运动时序热力图",
          meta: "音视频唇形对齐平均误差 0.042s (合格)",
          thumb: "/placeholders/person.svg",
        },
        {
          title: "4. 48kHz 音频 PCM 声学特征频谱",
          meta: "MFCC 13维倒谱系数 · 音素边界标定",
          thumb: "/placeholders/person.svg",
        },
        {
          title: "5. 帧间时序连续性光流深度图 (Depth Map)",
          meta: "MiDaS v3 深度估计 · 帧间平滑度 93.5",
          thumb: "/placeholders/person.svg",
        },
      ].map((item, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2 group hover:border-[#00e0b8]/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#e8f0f8]">{item.title}</span>
              <button
                onClick={() =>
                  onZoomArtifact({
                    title: item.title,
                    image: item.thumb,
                    meta: item.meta,
                  })
                }
                className="text-[#8a97a8] hover:text-[#00e0b8] transition-colors p-1"
                title="点击放大查看"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="aspect-video rounded-lg bg-black overflow-hidden relative">
              <img
                src={item.thumb}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between text-[11px] text-[#8a97a8] font-mono">
            <span className="truncate">{item.meta}</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onShowToast("success", `已下载产物: ${item.title}`)}
            >
              下载
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
