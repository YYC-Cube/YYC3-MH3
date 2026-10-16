/**
 * file: src/views/ModelsView/parts/BenchmarksTable.tsx
 * description: YYC³ 视图分区 — ModelsView 模型多分辨率性能基准对比表
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
 * brief: 从 ModelsView「性能基准多维对比」页签逐字提取的基准对比表 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common
 * exports: BenchmarksTable
 */
import React from "react";
import { Card } from "../../../components/common";

export const BenchmarksTable: React.FC = () => {
  return (
    <Card title="模型多分辨率性能基准对比 (Hardware Benchmark)">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
              <th className="py-2.5 px-3">模型权重</th>
              <th className="py-2.5 px-3">分辨率</th>
              <th className="py-2.5 px-3">推理速度 (s/step)</th>
              <th className="py-2.5 px-3">单批生成耗时</th>
              <th className="py-2.5 px-3">显存峰值 (FP8)</th>
              <th className="py-2.5 px-3">推荐场景</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2f47]/50">
            {[
              {
                name: "DiffSynth H3 v2.1-HQ",
                res: "1080x1920 (4K超分)",
                speed: "0.82s",
                total: "42.8s",
                vram: "19.4 GB",
                scene: "权威新闻早报、商业定制",
              },
              {
                name: "DiffSynth H3 v2.1-HQ",
                res: "720x1280 (高清)",
                speed: "0.45s",
                total: "24.1s",
                vram: "14.2 GB",
                scene: "社交媒体短视频、日常播报",
              },
              {
                name: "DiffSynth H3 v2.0-Fast",
                res: "1080x1920",
                speed: "0.52s",
                total: "28.5s",
                vram: "15.6 GB",
                scene: "电商带货高频产出",
              },
              {
                name: "DiffSynth H3 v2.0-Fast",
                res: "720x1280",
                speed: "0.28s",
                total: "14.8s",
                vram: "9.8 GB",
                scene: "极速预览、创意探索",
              },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-[#15294a]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#e8f0f8]">{row.name}</td>
                <td className="py-2.5 px-3 text-[#00b4d8]">{row.res}</td>
                <td className="py-2.5 px-3 text-[#00e0b8]">{row.speed}</td>
                <td className="py-2.5 px-3 text-[#e8f0f8]">{row.total}</td>
                <td className="py-2.5 px-3 text-[#00e0b8] font-bold">{row.vram}</td>
                <td className="py-2.5 px-3 text-[#8a97a8] font-sans">{row.scene}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
