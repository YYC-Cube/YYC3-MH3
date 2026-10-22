/**
 * file: src/components/navigation/GlobalSearchModal/parts/SearchResults.tsx
 * description: YYC³ 导航组件 — GlobalSearchModal 搜索结果容器（页面/批次/Seed/模型/文档五组）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[search],[results],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: GlobalSearchModal 搜索结果容器 —— 按分类筛选渲染五类匹配集合，
 *        逐字搬移自原 GlobalSearchModal.tsx（Results Container）。
 *
 * dependencies: react, lucide-react, ../../../types, ../searchCategories, ../useGlobalSearch
 * exports: SearchResultsProps, SearchResults
 */
import { BookOpen, Cpu, Dna, HardDrive, LayoutDashboard } from "lucide-react";
import React from "react";
import { BatchItem, NavigateExtra, NavTabId, SeedItem } from "../../../../types";
import { SearchCategory } from "../searchCategories";
import { DocGuide, SearchModelMatch, SearchPageMatch } from "../useGlobalSearch";

export interface SearchResultsProps {
  searchCategory: SearchCategory;
  pageMatches: SearchPageMatch[];
  batchMatches: BatchItem[];
  seedMatches: SeedItem[];
  docMatches: DocGuide[];
  modelMatches: SearchModelMatch[];
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onClose: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchCategory,
  pageMatches,
  batchMatches,
  seedMatches,
  docMatches,
  modelMatches,
  onNavigate,
  onClose,
}) => {
  return (
    <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
      {/* Quick Pages */}
      {(searchCategory === "all" || searchCategory === "pages") && pageMatches.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider px-2 mb-1">
            功能页面 ({pageMatches.length})
          </div>
          <div className="space-y-1">
            {pageMatches.slice(0, 5).map((p) => (
              <div
                key={p.tab}
                onClick={() => {
                  onNavigate(p.tab);
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#8a97a8] group-hover:text-[#00e0b8]" />
                  <span className="font-medium">{p.title}</span>
                </div>
                <span className="text-[10px] text-[#8b949e] group-hover:text-[#8a97a8] font-mono">{p.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batches */}
      {(searchCategory === "all" || searchCategory === "batches") && batchMatches.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider px-2 mb-1">
            批次任务 ({batchMatches.length})
          </div>
          <div className="space-y-1">
            {batchMatches.slice(0, 4).map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  onNavigate("workbench", { batchId: b.id });
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00b4d8]" />
                  <span className="font-mono text-[#00e0b8] font-semibold">{b.id}</span>
                  <span className="truncate max-w-xs">{b.name}</span>
                </div>
                <span className="font-mono text-[11px] text-[#8a97a8]">Score: {b.score || "--"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seeds */}
      {(searchCategory === "all" || searchCategory === "seeds") && seedMatches.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider px-2 mb-1">
            Seed 种子 ({seedMatches.length})
          </div>
          <div className="space-y-1">
            {seedMatches.slice(0, 3).map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onNavigate("seed", { seedId: s.id });
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-[#9d7cd8]" />
                  <span className="font-mono text-[#9d7cd8] font-bold">#{s.seedNumber}</span>
                  <span className="truncate">{s.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00e0b8]/15 text-[#00e0b8] font-mono">
                  {s.tier} 级
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Models */}
      {(searchCategory === "all" || searchCategory === "models") && modelMatches.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider px-2 mb-1">
            模型权重 ({modelMatches.length})
          </div>
          <div className="space-y-1">
            {modelMatches.map((m) => (
              <div
                key={m.name}
                onClick={() => {
                  onNavigate("models");
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#00b4d8]" />
                  <span className="font-medium">{m.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[#8a97a8]">
                  {m.size} · {m.vram}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Docs */}
      {(searchCategory === "all" || searchCategory === "docs") && docMatches.length > 0 && (
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider px-2 mb-1">
            文档与指南 ({docMatches.length})
          </div>
          <div className="space-y-1">
            {docMatches.slice(0, 3).map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  onNavigate("docs", { docId: d.id });
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#15294a] cursor-pointer text-[#e8f0f8] group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#8a97a8]" />
                  <span className="truncate">{d.title}</span>
                </div>
                <span className="text-[10px] text-[#8b949e] font-mono">{d.readTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
