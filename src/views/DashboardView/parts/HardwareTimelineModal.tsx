/**
 * file: src/views/DashboardView/parts/HardwareTimelineModal.tsx
 * description: YYC³ 功能视图 — DashboardView 24H 本地算力与显存时序监控大图弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[dashboard],[modal],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DashboardView 24 小时本地算力与显存详细时序监控大图弹窗，
 *        逐字搬移自原 DashboardView.tsx（尾部件 Modal）。
 *
 * dependencies: react, ../../../components/common
 * exports: HardwareTimelineModalProps, HardwareTimelineModal
 */
import React from "react";
import { Modal } from "../../../components/common";

export interface HardwareTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareTimelineModal: React.FC<HardwareTimelineModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="24小时本地算力与显存详细时序监控大图"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs font-mono">
        <div className="flex justify-between text-[#8a97a8]">
          <span>RTX 4090 显存波动走势</span>
          <span className="text-[#00e0b8]">峰值 22.8 GB · 均值 18.2 GB</span>
        </div>
        <div className="h-44 w-full bg-[#15294a] rounded-xl p-3 flex items-end gap-2 border border-[#1e2f47]">
          {[14, 18, 22.8, 16.8, 21.2, 17.5, 19.4].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#00e0b8] font-bold">{v}G</span>
              <div
                className="w-full bg-gradient-to-t from-[#00b4d8] to-[#00e0b8] rounded-t"
                style={{ height: `${(v / 24) * 100}%` }}
              />
              <span className="text-[9px] text-[#8a97a8]">0{i + 1}:00</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
