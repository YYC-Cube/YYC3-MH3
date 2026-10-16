/**
 * file: src/views/BatchDetailView/parts/ZoomArtifactModal.tsx
 * description: YYC³ 功能视图 — BatchDetailView 产物放大查看弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[modal],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 产物放大查看弹窗（大图 + 元信息），
 *        逐字搬移自原 BatchDetailView.tsx（尾部件 Modal）。
 *
 * dependencies: react, ../../../components/common, ../useBatchDetailView
 * exports: ZoomArtifactModalProps, ZoomArtifactModal
 */
import React from "react";
import { Modal } from "../../../components/common";
import { ZoomedArtifact } from "../useBatchDetailView";

export interface ZoomArtifactModalProps {
  artifact: ZoomedArtifact;
  onClose: () => void;
}

export const ZoomArtifactModal: React.FC<ZoomArtifactModalProps> = ({ artifact, onClose }) => {
  return (
    <Modal isOpen={!!artifact} onClose={onClose} title={artifact.title} maxWidth="2xl">
      <div className="space-y-3">
        <div className="rounded-xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
          <img src={artifact.image} alt={artifact.title} className="w-full h-auto object-contain" />
        </div>
        <div className="text-xs text-[#8a97a8] font-mono">{artifact.meta}</div>
      </div>
    </Modal>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
