/**
 * file: src/views/BatchDetailView.tsx
 * description: YYC³ 功能视图 — BatchDetailView
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
 * brief: YYC³ 功能视图 — BatchDetailView
 *
 * dependencies: react, ../types, lucide-react, ../components/common
 * exports: BatchDetailViewProps, BatchDetailView
 */
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  Download,
  FileText,
  RotateCcw,
  Wrench,
  Zap,
  ZoomIn,
} from "lucide-react";
import React, { useState } from "react";
import { Badge, Button, Modal } from "../components/common";
import { RadarScoreChart } from "../components/pipeline/RadarScoreChart";
import { findCurrentBatch } from "../domains/batch";
import { BatchItem, NavigateExtra, NavTabId } from "../types";

/** 批次详情内容页签（timeline/artifacts/compare/mutation/anomalies） */
export type BatchDetailTab = "timeline" | "artifacts" | "compare" | "mutation" | "anomalies";

const BATCH_DETAIL_TABS: { id: BatchDetailTab; label: string }[] = [
  { id: "artifacts", label: "a. 生产产物矩阵 (5项)" },
  { id: "compare", label: "b. 多维雷达与基准对比" },
  { id: "mutation", label: "c. Seed 变异测试发射器" },
  { id: "anomalies", label: "d. 异常帧定位与标注工具" },
  { id: "timeline", label: "五阶段全流程时间轴" },
];

export interface BatchDetailViewProps {
  batchId?: string;
  batches: BatchItem[];
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const BatchDetailView: React.FC<BatchDetailViewProps> = ({
  batchId,
  batches,
  onNavigate,
  onShowToast,
}) => {
  const currentBatch = findCurrentBatch(batches, batchId);
  const [activeTab, setActiveTab] = useState<BatchDetailTab>("artifacts");

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Zoom artifact modal
  const [zoomedArtifact, setZoomedArtifact] = useState<{
    title: string;
    image: string;
    meta: string;
  } | null>(null);

  // Mutation launcher state
  const [mutationCount] = useState(4);
  const [isGeneratingMutations, setIsGeneratingMutations] = useState(false);

  // Anomalies list
  const [anomalies, setAnomalies] = useState([
    {
      frame: 142,
      issue: "第 142 帧微表情眨眼间隔偏长 (380ms vs 基线 250ms)",
      severity: "medium",
      fixed: false,
    },
    {
      frame: 218,
      issue: "第 218 帧唇齿音素轻微边界模糊 (SyncNet 时延 0.048s)",
      severity: "low",
      fixed: true,
    },
  ]);

  const handleLaunchMutations = () => {
    setIsGeneratingMutations(true);
    setTimeout(() => {
      setIsGeneratingMutations(false);
      onShowToast(
        "success",
        `成功生成 ${mutationCount} 组变异批次`,
        "已自动加入队列，包含 Seed±1 与 CFG±0.5 变异",
      );
    }, 1500);
  };

  const handleFixAnomaly = (frame: number) => {
    setAnomalies((prev) => prev.map((a) => (a.frame === frame ? { ...a, fixed: true } : a)));
    onShowToast("success", `第 ${frame} 帧异常已应用时序平滑补丁`, "微表情已重新对齐");
  };

  // 数据守卫：无匹配批次时渲染空态（mock 数据恒非空，此分支仅作类型兜底）
  if (!currentBatch) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#8a97a8] bg-[#0a1628]">
        暂无批次数据
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2f47]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => onNavigate("workbench", { batchId: currentBatch.id })}
          >
            返回工作台
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-[#00e0b8]">
                {currentBatch.id}
              </span>
              <Badge variant="brand">{currentBatch.mode}</Badge>
              <span className="text-xs text-[#8a97a8]">· Seed: {currentBatch.seed}</span>
            </div>
            <h1 className="text-base font-semibold text-[#e8f0f8] mt-0.5">{currentBatch.name}</h1>
          </div>
        </div>

        {/* Action Controls & Export Dropdown (Requirement 2.1) */}
        <div className="flex items-center gap-2 relative">
          <Button
            variant="secondary"
            size="sm"
            icon={<Archive className="w-3.5 h-3.5" />}
            onClick={() =>
              onShowToast(
                "success",
                "已归档至本地 NAS",
                `归档路径: /nas/archive/${currentBatch.id}`,
              )
            }
          >
            NAS 归档
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              iconRight={<ChevronDown className="w-3.5 h-3.5" />}
              onClick={() => setIsExportOpen((p) => !p)}
            >
              导出复盘报告
            </Button>

            {isExportOpen && (
              <div className="absolute right-0 top-10 w-44 rounded-xl bg-[#0c1a30] border border-[#1e2f47] shadow-xl p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95 backdrop-blur-md">
                <button
                  onClick={() => {
                    onShowToast("success", "PDF 格式生产质量全量报告已导出");
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#e8f0f8] hover:bg-[#15294a] hover:text-[#00e0b8] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>导出为 PDF 报告</span>
                </button>
                <button
                  onClick={() => {
                    onShowToast("success", "Markdown 格式报告与参数已导出");
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#e8f0f8] hover:bg-[#15294a] hover:text-[#00e0b8] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>导出为 Markdown</span>
                </button>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              onNavigate("workbench", { batchId: currentBatch.id });
              onShowToast("info", "已在工作台载入当前批次配置");
            }}
          >
            基于此重新生成
          </Button>
        </div>
      </div>

      {/* Meta Specs Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
          <span className="text-[#8a97a8]">总推理耗时</span>
          <div className="font-mono text-sm font-bold text-[#e8f0f8] mt-1">
            {currentBatch.duration}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
          <span className="text-[#8a97a8]">综合评分</span>
          <div className="font-mono text-sm font-bold text-[#00e0b8] mt-1">
            {currentBatch.score} 分
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
          <span className="text-[#8a97a8]">输出规格</span>
          <div className="font-mono text-sm font-bold text-[#e8f0f8] mt-1">
            {currentBatch.resolution} @ {currentBatch.fps}fps
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
          <span className="text-[#8a97a8]">显存占用峰值</span>
          <div className="font-mono text-sm font-bold text-[#00b4d8] mt-1">
            {currentBatch.vramUsageGb} GB
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
          <span className="text-[#8a97a8]">模型主干权重</span>
          <div className="font-mono text-[11px] font-semibold text-[#e8f0f8] mt-1 truncate">
            DiffSynth H3 v2.1
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1f38] border border-[#1e2f47]">
          <span className="text-[#8a97a8]">本地硬件设备</span>
          <div className="font-mono text-[11px] font-semibold text-[#00e0b8] mt-1">
            CUDA:0 (RTX 4090)
          </div>
        </div>
      </div>

      {/* 4 Tabs Menu (Requirement 2.1) */}
      <div className="border-b border-[#1e2f47]">
        <div className="flex gap-6 text-xs">
          {BATCH_DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
                activeTab === tab.id
                  ? "text-[#00e0b8] font-semibold"
                  : "text-[#8a97a8] hover:text-[#e8f0f8]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00e0b8]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB A: 5 Artifacts Matrix */}
      {activeTab === "artifacts" && (
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
                      setZoomedArtifact({
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
      )}

      {/* TAB B: Radar Comparison with Baseline */}
      {activeTab === "compare" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <RadarScoreChart />
          </div>
          <div className="lg:col-span-6 p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
              <h3 className="font-semibold text-sm text-[#e8f0f8]">
                历史 50 批次基准超参对比与差异百分比
              </h3>
              <Badge variant="brand" size="xs">
                领先基准 +5.4%
              </Badge>
            </div>

            <div className="space-y-2.5 text-[#8a97a8]">
              {[
                {
                  label: "口型吻合度 (Lip-Sync)",
                  curr: 95.8,
                  base: 88.4,
                  diff: "+8.3%",
                },
                {
                  label: "表情自然度 (Expression)",
                  curr: 92.4,
                  base: 89.1,
                  diff: "+3.7%",
                },
                {
                  label: "姿态稳定性 (Stability)",
                  curr: 97.2,
                  base: 92.0,
                  diff: "+5.6%",
                },
                {
                  label: "时序一致性 (Coherence)",
                  curr: 93.5,
                  base: 86.8,
                  diff: "+7.7%",
                },
                {
                  label: "超清真实感 (Fidelity)",
                  curr: 96.0,
                  base: 91.5,
                  diff: "+4.9%",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47]"
                >
                  <span className="font-medium text-[#e8f0f8]">{row.label}</span>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-[#00e0b8] font-bold">{row.curr}</span>
                    <span className="text-[#5c697a]">vs {row.base}</span>
                    <span className="text-[#00e0b8] font-bold">{row.diff}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[#0a1628] border border-[#00e0b8]/30 text-[11px] text-[#00e0b8] leading-relaxed">
              <strong>诊断结论：</strong>当前批次多项指标达到 S
              级基线门槛，特别是在时序连续性与口型贴合上表现突出。已推荐回写至种子库。
            </div>
          </div>
        </div>
      )}

      {/* TAB C: Mutation Launcher */}
      {activeTab === "mutation" && (
        <div className="p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-[#e8f0f8]">一键发起 Seed 参数微变异矩阵</h3>
            <p className="text-[#8a97a8] mt-1">
              基于当前高分基线 Seed #{currentBatch.seed}
              ，在近邻超参数空间微调，自动批量寻找更优表现点。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1">
              <span className="text-[#8a97a8]">变异维度 1: 种子抖动</span>
              <div className="font-mono text-sm text-[#00e0b8] font-bold">Seed ± 1, ± 10</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1">
              <span className="text-[#8a97a8]">变异维度 2: CFG 阶梯</span>
              <div className="font-mono text-sm text-[#00b4d8] font-bold">
                Guidance 7.0 / 7.5 / 8.0
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1">
              <span className="text-[#8a97a8]">变异维度 3: 降噪微调</span>
              <div className="font-mono text-sm text-[#9d7cd8] font-bold">
                Denoise 0.60 / 0.65 / 0.70
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#1e2f47]/60">
            <span className="text-[#8a97a8]">预计创建 4 组衍生测试批次，预计显存占用 19.4GB</span>
            <Button
              variant="primary"
              size="md"
              icon={<Zap className="w-4 h-4 fill-current" />}
              loading={isGeneratingMutations}
              onClick={handleLaunchMutations}
            >
              启动变异测试队列
            </Button>
          </div>
        </div>
      )}

      {/* TAB D: Anomaly Frame Locator & Annotator (Requirement 2.1) */}
      {activeTab === "anomalies" && (
        <div className="p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
            <div>
              <h3 className="text-sm font-semibold text-[#e8f0f8]">异常帧定位与缺陷标注工具</h3>
              <p className="text-[#8a97a8]">
                基于 SyncNet 误差阈值与面部关键点突变检测定位的问题帧
              </p>
            </div>
            <Badge variant="warning" size="xs">
              检测到 {anomalies.filter((a) => !a.fixed).length} 处待修复异常
            </Badge>
          </div>

          <div className="space-y-3">
            {anomalies.map((ano) => (
              <div
                key={ano.frame}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  ano.fixed
                    ? "bg-[#15294a]/40 border-[#1e2f47] opacity-60"
                    : "bg-[#15294a] border-[#ff7a45]/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#00e0b8]">
                    Frame #{ano.frame}
                  </span>
                  <div className="text-[#e8f0f8]">{ano.issue}</div>
                </div>

                <div className="flex items-center gap-2">
                  {ano.fixed ? (
                    <Badge variant="brand" size="xs">
                      已平滑修复
                    </Badge>
                  ) : (
                    <Button
                      variant="danger"
                      size="xs"
                      icon={<Wrench className="w-3.5 h-3.5" />}
                      onClick={() => handleFixAnomaly(ano.frame)}
                    >
                      一键应用平滑补丁
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB Timeline */}
      {activeTab === "timeline" && (
        <div className="p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
          <h3 className="font-semibold text-[#e8f0f8]">五阶段耗时分解与自检指标</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e2f47]">
            {[
              {
                stage: "Stage 1: 神经渲染 (DiffSynth H3 扩散采样)",
                time: "28.4s",
                desc: "30步 DDIM 采样完成，FP8 激活显存加速正常",
                status: "pass",
              },
              {
                stage: "Stage 2: 口型初评 (SyncNet 音视频对齐)",
                time: "3.2s",
                desc: "提取音素 MFCC 频谱，时延误差 0.042s (合格)",
                status: "pass",
              },
              {
                stage: "Stage 3: 多模精评 (表情/姿态/时序)",
                time: "5.1s",
                desc: "微表情自然度 92.4分，无发丝跳帧撕裂",
                status: "pass",
              },
              {
                stage: "Stage 4: 缺陷归因与聚类分析",
                time: "2.4s",
                desc: "第 142 帧轻微迟滞已被鲁棒滤波吸收",
                status: "pass",
              },
              {
                stage: "Stage 5: Seed 基因回写与沉淀",
                time: "0.3s",
                desc: "已提取 Seed #48920194 核心权重，沉淀为 S 级基线",
                status: "pass",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-[#0a1628] border-2 border-[#00e0b8] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#e8f0f8]">{item.stage}</span>
                  <span className="font-mono text-xs text-[#00e0b8] font-semibold">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-[#8a97a8] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Artifact Modal */}
      {zoomedArtifact && (
        <Modal
          isOpen={!!zoomedArtifact}
          onClose={() => setZoomedArtifact(null)}
          title={zoomedArtifact.title}
          maxWidth="2xl"
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={zoomedArtifact.image}
                alt={zoomedArtifact.title}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="text-xs text-[#8a97a8] font-mono">{zoomedArtifact.meta}</div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
