/**
 * file: src/views/SeedVaultView/parts/SeedList.tsx
 * description: YYC³ 视图分区 — SeedVaultView 列表视图（种子多维表格 + 行内操作）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[seed],[list],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 SeedVaultView 逐字提取的列表视图 JSX（零重设计）。
 *
 * dependencies: react, ../../../components/common, ../useSeedVaultView
 * exports: SeedListProps, SeedList
 */
import React from "react";
import { Badge, Button } from "../../../components/common";
import type { SeedVaultState } from "../useSeedVaultView";

export interface SeedListProps {
  state: SeedVaultState;
}

export const SeedList: React.FC<SeedListProps> = ({ state }) => {
  const { filteredSeeds, compareSeedIds, toggleCompareSeed, handleOpenDetail, handleApply } = state;

  return (
    <div className="rounded-xl bg-[#0c1a30] border border-[#1e2f47] overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
            <th className="py-2.5 px-4">对比</th>
            <th className="py-2.5 px-4">种子号 / 名称</th>
            <th className="py-2.5 px-4">评级</th>
            <th className="py-2.5 px-4">历史均分</th>
            <th className="py-2.5 px-4">衍生批次</th>
            <th className="py-2.5 px-4">最近使用</th>
            <th className="py-2.5 px-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2f47]/50">
          {filteredSeeds.map((seed) => (
            <tr key={seed.id} className="hover:bg-[#15294a]/40 transition-colors">
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={compareSeedIds.includes(seed.id)}
                  onChange={() => toggleCompareSeed(seed.id)}
                  className="rounded accent-[#00e0b8] cursor-pointer"
                />
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-[#00e0b8] font-bold">#{seed.seedNumber}</span>
                <span className="text-[#e8f0f8] font-medium ml-2">{seed.name}</span>
              </td>
              <td className="py-3 px-4">
                <Badge variant={seed.tier === "S" ? "brand" : "info"} size="xs">
                  {seed.tier} 级
                </Badge>
              </td>
              <td className="py-3 px-4 font-mono font-semibold text-[#00e0b8]">{seed.avgScore} 分</td>
              <td className="py-3 px-4 font-mono text-[#8a97a8]">{seed.generationCount} 批</td>
              <td className="py-3 px-4 text-[#8a97a8]">{seed.lastUsed}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="xs" onClick={() => handleOpenDetail(seed)}>
                    基因谱系
                  </Button>
                  <Button variant="primary" size="xs" onClick={() => handleApply(seed)}>
                    载入工作台
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
