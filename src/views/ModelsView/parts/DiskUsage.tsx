/**
 * file: src/views/ModelsView/parts/DiskUsage.tsx
 * description: YYC³ 视图分区 — ModelsView 本地 NVMe 存储划分与大文件清理
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
 * brief: 从 ModelsView「本地 NVMe 磁盘分配」页签逐字提取的存储分布 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../../../types
 * exports: DiskUsageProps, DiskUsage
 */
import React from "react";
import { Button, Card } from "../../../components/common";
import type { ShowToast } from "../../../types";

export interface DiskUsageProps {
  onShowToast: ShowToast;
}

export const DiskUsage: React.FC<DiskUsageProps> = ({ onShowToast }) => {
  return (
    <div className="space-y-4">
      <Card title="本地 NVMe 存储划分环形分布与大文件管理">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
          {/* Ring / Bar Distribution */}
          <div className="space-y-3">
            <div className="flex justify-between text-[#8a97a8]">
              <span>NVMe 固态硬盘总占用 (Samsung 990 PRO 2TB)</span>
              <span className="font-mono text-[#00e0b8] font-bold">642 GB / 1,860 GB (34.5%)</span>
            </div>
            <div className="w-full bg-[#15294a] h-3 rounded-full overflow-hidden flex">
              <div className="bg-[#00e0b8] h-full" style={{ width: "18%" }} title="模型权重 340GB" />
              <div className="bg-[#00b4d8] h-full" style={{ width: "10%" }} title="输出视频 180GB" />
              <div className="bg-[#ff7a45] h-full" style={{ width: "6.5%" }} title="临时切片 122GB" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2 rounded bg-[#15294a]">
                <div className="text-[10px] text-[#8a97a8]">模型权重</div>
                <div className="font-mono text-sm font-bold text-[#00e0b8]">340 GB</div>
              </div>
              <div className="p-2 rounded bg-[#15294a]">
                <div className="text-[10px] text-[#8a97a8]">输出视频</div>
                <div className="font-mono text-sm font-bold text-[#00b4d8]">180 GB</div>
              </div>
              <div className="p-2 rounded bg-[#15294a]">
                <div className="text-[10px] text-[#8a97a8]">临时缓存</div>
                <div className="font-mono text-sm font-bold text-[#ff7a45]">122 GB</div>
              </div>
            </div>
          </div>

          {/* Large File Cleaner List */}
          <div className="space-y-2">
            <span className="font-semibold text-[#e8f0f8]">大文件占用排行：</span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between p-2 rounded bg-[#15294a]">
                <span className="text-[#8a97a8] truncate max-w-xs">diffsynth-h3-v2.1.safetensors</span>
                <span className="text-[#00e0b8]">14.8 GB</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#15294a]">
                <span className="text-[#8a97a8] truncate max-w-xs">diffsynth-h3-v2.0-fast.bin</span>
                <span className="text-[#00e0b8]">9.2 GB</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#15294a]">
                <span className="text-[#8a97a8] truncate max-w-xs">eval-cache-temp-frames-4k.tar</span>
                <span className="text-[#ff7a45]">98.4 GB</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onShowToast("success", "已清理 98.4GB 临时评估切片缓存")}
              >
                一键清理评估切片缓存 (释放 98GB)
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
