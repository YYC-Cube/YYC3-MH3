/**
 * file: src/views/DocsCenterView.tsx
 * description: YYC³ 功能视图 — DocsCenterView
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — DocsCenterView
 *
 * dependencies: react, ../data/content, ../types, lucide-react
 * exports: DocsCenterViewProps, DocsCenterView
 */
import { ArrowRight, BookOpen, Printer, Search } from "lucide-react";
import React, { useState } from "react";
import { Badge, Button } from "../components/common";
import { DOC_GUIDES } from "../data/content";
import { NavigateExtra, NavTabId } from "../types";

export interface DocsCenterViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const DocsCenterView: React.FC<DocsCenterViewProps> = ({ onNavigate, onShowToast }) => {
  const [selectedDocId, setSelectedDocId] = useState(DOC_GUIDES[1]!.id); // mock 常量数组恒非空，静态索引安全（02 五步闭环）
  const [searchDocQuery, setSearchDocQuery] = useState("");

  const filteredDocs = DOC_GUIDES.filter(
    (d) => !searchDocQuery || d.title.toLowerCase().includes(searchDocQuery.toLowerCase()),
  );

  const currentDoc = DOC_GUIDES.find((d) => d.id === selectedDocId) || DOC_GUIDES[1];

  // 数据守卫：无匹配文档时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!currentDoc) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#8b949e] bg-[#071425]">
        暂无文档数据
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#071425]">
      {/* Left Navigation Tree (Width: 280px) */}
      <div className="w-72 border-r border-[#30363d] bg-[#0c1a30] flex flex-col flex-shrink-0">
        <div className="p-3.5 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-[#e6edf3]">文档全量指南 (22篇)</span>
          </div>
          <Badge variant="brand" size="xs">
            离线内置
          </Badge>
        </div>

        <div className="p-2 border-b border-[#30363d]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input
              type="text"
              placeholder="搜索文档指南..."
              value={searchDocQuery}
              onChange={(e) => setSearchDocQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-2 rounded bg-[#122340] text-xs text-[#e6edf3] placeholder-[#5a6268] border border-[#30363d] focus:outline-none focus:border-[#00d4aa]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === currentDoc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? "bg-[#122340] border-[#00d4aa] text-[#00d4aa] font-semibold"
                    : "bg-[#0c1a30] border-[#30363d] text-[#e6edf3] hover:border-[#3d444d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{doc.title}</span>
                  <span className="text-[10px] text-[#8b949e] font-mono ml-2 flex-shrink-0">
                    {doc.readTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#30363d] bg-[#071425]/50 text-center">
          <Button
            variant="ghost"
            size="xs"
            className="w-full"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("info", "正在准备打印视图...")}
          >
            导出完整工程手册 (PDF)
          </Button>
        </div>
      </div>

      {/* Middle: Markdown Reading Area (Flex 1) */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl">
        <div className="space-y-2 border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="xs">
              核心生产标准规范
            </Badge>
            <span className="text-xs text-[#8b949e]">阅读耗时: 8 分钟 · 最后核准: 2025-04</span>
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">{currentDoc.title}</h1>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            深入剖析 MiniMax-H3 本地数字人从潜空间扩散采样、音素对齐评测到种子遗传迭代的 5
            步完整闭环机理。
          </p>
        </div>

        {/* Article Body */}
        <div className="space-y-6 text-xs text-[#e6edf3] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#00d4aa]">1. 五步闭环核心价值与架构</h2>
            <p className="text-[#8b949e] leading-relaxed">
              传统的 AI 数字人制作往往是「单向发射式」的：参数输入 →
              视频输出。若出现口型歪斜或时序撕裂，创作者只能盲目随机更换种子。 MiniMax-H3 创新提出了
              <strong className="text-[#e6edf3]">「端到端闭环流水线」</strong>：
            </p>

            <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#00d4aa]/40 space-y-3 font-mono text-[11px]">
              <div className="text-[#00d4aa] font-bold">流水线数据流转状态图 (State Flow)：</div>
              <div className="p-3 rounded bg-[#071425] border border-[#30363d] text-[#e6edf3] overflow-x-auto whitespace-pre">
                {`[Ref2VA/FL2VA 参数]
       ↓
1. 神经渲染 (DiffSynth H3 扩散采样 30 Steps)
       ↓ (输出 300 帧 4K 视频)
2. 口型初评 (SyncNet 音视频对齐，计算音素时延误差)
       ↓ (过滤低于 85分 样本)
3. 多模精评 (微表情/姿态稳定性/时序连续性 5维雷达)
       ↓
4. 缺陷归因 (聚类敏感特征，分析 CFG 溢出或降噪失衡)
       ↓
5. Seed 迭代回写 (沉淀为 S 级基线种子，自动变异微调)`}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#00b4d8]">2. 关键阶段操作要诀与排障</h2>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-[#0c1a30] border border-[#30363d]">
                <div className="font-semibold text-[#e6edf3] mb-1">
                  Q: 什么时候应该采纳并回写 Seed？
                </div>
                <p className="text-[#8b949e]">
                  当综合加权评分 ≥ 92 分，且「口型吻合度」高于 90 时，应当在工作台右侧点击
                  <strong className="text-[#00d4aa]">「采纳为优质 Seed 并回写种子库」</strong>
                  。系统会自动提取其潜变量坐标，并建立基线。
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1a30] border border-[#30363d]">
                <div className="font-semibold text-[#e6edf3] mb-1">
                  Q: 出现显存 OOM 崩溃如何配置？
                </div>
                <p className="text-[#8b949e]">
                  确保在参数栏勾选 <strong className="text-[#00d4aa]">FP8 TensorRT 显存加速</strong>
                  。24GB 的 RTX 4090 可将峰值显存由 22.8GB 压缩至 18.2GB，完全杜绝 OOM。
                </p>
              </div>
            </div>
          </section>

          <div className="pt-4 border-t border-[#30363d] flex items-center justify-between">
            <span className="text-[#8b949e]">遇到疑难问题？可随时查阅运维监控日志</span>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => onNavigate("workbench")}
            >
              立刻前往工作台实操
            </Button>
          </div>
        </div>
      </div>

      {/* Right Outline Index (Width: 200px) */}
      <div className="w-56 border-l border-[#30363d] bg-[#0c1a30] p-4 hidden xl:block text-xs">
        <span className="font-semibold text-[#8b949e] uppercase tracking-wider text-[10px]">
          本篇大纲索引
        </span>
        <div className="mt-3 space-y-2 text-[#8b949e]">
          <a href="#section-1" className="block text-[#00d4aa] hover:underline truncate">
            1. 五步闭环核心价值与架构
          </a>
          <a href="#section-2" className="block hover:text-[#e6edf3] truncate">
            2. 关键阶段操作要诀与排障
          </a>
          <a href="#section-3" className="block hover:text-[#e6edf3] truncate">
            3. Seed 基因遗传参数解析
          </a>
          <a href="#section-4" className="block hover:text-[#e6edf3] truncate">
            4. 硬件配置与 FP8 推荐值
          </a>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
