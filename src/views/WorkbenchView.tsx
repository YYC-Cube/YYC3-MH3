/**
 * file: src/views/WorkbenchView.tsx
 * description: YYC³ 功能视图 — WorkbenchView
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
 * brief: YYC³ 功能视图 — WorkbenchView
 *
 * dependencies: react, ../types, lucide-react, ../components/common
 * exports: WorkbenchViewProps, WorkbenchView
 */
import {
  Bookmark,
  Camera,
  CheckCircle2,
  Dna,
  History,
  Pause,
  Play,
  RefreshCw,
  Search,
  Sliders,
  Square,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge, Button, Input, Modal, Select, Slider, Switch } from "../components/common";
import { PipelineBar } from "../components/pipeline/PipelineBar";
import { RadarScoreChart } from "../components/pipeline/RadarScoreChart";
import { TerminalLogPanel } from "../components/pipeline/TerminalLogPanel";
import { VideoPreviewPlayer } from "../components/pipeline/VideoPreviewPlayer";
import { findCurrentBatch } from "../domains/batch";
import { advancePipeline } from "../domains/pipeline";
import { generateSeedNumber } from "../domains/seed";
import {
  BatchItem,
  BatchMode,
  KeyframePreview,
  LogEntry,
  ParameterTemplate,
  PipelineStageKey,
  SeedItem,
} from "../types";

export interface WorkbenchViewProps {
  batches: BatchItem[];
  activeBatchId?: string;
  onSelectBatch: (id: string) => void;
  onAdoptSeed: (seed: Partial<SeedItem>) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  initialLogs: LogEntry[];
}

const PRESET_TEMPLATES: ParameterTemplate[] = [
  {
    id: "tmpl-1",
    name: "4K播音权威主播 (S级基线)",
    mode: "Ref2VA",
    steps: 32,
    guidanceScale: 7.5,
    denoiseStrength: 0.65,
    resolution: "1080x1920",
    fps: 30,
    fp8: true,
    desc: "最适合金融新闻早报，口型时延极低 (<0.04s)",
  },
  {
    id: "tmpl-2",
    name: "60FPS 运动高动态长镜头",
    mode: "FL2VA",
    steps: 35,
    guidanceScale: 8.0,
    denoiseStrength: 0.68,
    resolution: "1080x1920",
    fps: 60,
    fp8: true,
    desc: "双关键帧插值，适合科技发布会与舞台演说",
  },
  {
    id: "tmpl-3",
    name: "电商带货高频微表情",
    mode: "Ref2VA",
    steps: 28,
    guidanceScale: 6.8,
    denoiseStrength: 0.7,
    resolution: "720x1280",
    fps: 30,
    fp8: false,
    desc: "极速生成，眼睑微表情自然，面部高饱和",
  },
];

const INITIAL_KEYFRAMES: KeyframePreview[] = [
  {
    frameNumber: 15,
    timeSec: 0.5,
    thumbnail: "/placeholders/person.svg",
    lipScore: 96.2,
    expressionScore: 94.0,
  },
  {
    frameNumber: 45,
    timeSec: 1.5,
    thumbnail: "/placeholders/person.svg",
    lipScore: 95.8,
    expressionScore: 93.5,
  },
  {
    frameNumber: 90,
    timeSec: 3.0,
    thumbnail: "/placeholders/person.svg",
    lipScore: 96.5,
    expressionScore: 95.0,
  },
  {
    frameNumber: 142,
    timeSec: 4.7,
    thumbnail: "/placeholders/person.svg",
    lipScore: 94.1,
    expressionScore: 89.2,
    anomaly: "微表情迟滞",
  },
  {
    frameNumber: 195,
    timeSec: 6.5,
    thumbnail: "/placeholders/person.svg",
    lipScore: 97.0,
    expressionScore: 96.1,
  },
  {
    frameNumber: 240,
    timeSec: 8.0,
    thumbnail: "/placeholders/person.svg",
    lipScore: 95.9,
    expressionScore: 94.5,
  },
];

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  batches,
  activeBatchId,
  onSelectBatch,
  onAdoptSeed,
  onShowToast,
  initialLogs,
}) => {
  const currentBatch = findCurrentBatch(batches, activeBatchId);

  // Parameters State
  const [mode, setMode] = useState<BatchMode>(currentBatch?.mode || "Ref2VA");
  const [prompt, setPrompt] = useState(currentBatch?.prompt ?? "");
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, deformed mouth, low resolution, bad teeth alignment, unnatural eye movement, flickering hair",
  );
  const [seedNumber, setSeedNumber] = useState(currentBatch?.seed ?? 0);
  const [steps, setSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [denoiseStrength, setDenoiseStrength] = useState(0.65);
  const [fps, setFps] = useState(currentBatch?.fps ?? 24);
  const [resolution, setResolution] = useState(currentBatch?.resolution ?? "1080p");
  const [fp8Optimization, setFp8Optimization] = useState(true);

  // Execution & Live Stream State
  const [isRunning, setIsRunning] = useState(currentBatch?.status === "running");
  const [currentStage, setCurrentStage] = useState<PipelineStageKey>(
    currentBatch?.currentStage ?? "generation",
  );
  const [progress, setProgress] = useState(currentBatch?.progress ?? 0);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [keyframes] = useState<KeyframePreview[]>(INITIAL_KEYFRAMES);

  // Review & Adoption State
  const [, setReviewScore] = useState(5);
  const [defectChecks, setDefectChecks] = useState<{ [key: string]: boolean }>({
    lipSyncAccurate: true,
    microExpressionNatural: true,
    noTemporalFlicker: true,
    edgeSharpened: true,
  });
  const [isAdopted, setIsAdopted] = useState(false);

  // Modals state
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  // Sync state when active batch changes
  useEffect(() => {
    if (currentBatch) {
      setMode(currentBatch.mode);
      setPrompt(currentBatch.prompt);
      setSeedNumber(currentBatch.seed);
      setFps(currentBatch.fps);
      setResolution(currentBatch.resolution);
      setCurrentStage(currentBatch.currentStage);
      setProgress(currentBatch.progress);
      setIsRunning(currentBatch.status === "running");
      setIsAdopted(false);
    }
  }, [currentBatch?.id]);

  // Simulated live execution loop
  useEffect(() => {
    let timer: number | null = null;
    if (isRunning && progress < 100) {
      timer = window.setInterval(() => {
        setProgress((prev) => {
          const { progress, stage, completed } = advancePipeline(prev);
          setCurrentStage(stage);
          if (completed) {
            setIsRunning(false);
            onShowToast(
              "success",
              "五步闭环流水线生成完毕",
              "已自动聚合多维评分，等待人工质检验收",
            );
          }
          return progress;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, progress]);

  // Template quick switch
  const handleApplyTemplate = (tmpl: ParameterTemplate) => {
    setMode(tmpl.mode);
    setSteps(tmpl.steps);
    setGuidanceScale(tmpl.guidanceScale);
    setDenoiseStrength(tmpl.denoiseStrength);
    setResolution(tmpl.resolution);
    setFps(tmpl.fps);
    setFp8Optimization(tmpl.fp8);
    onShowToast("info", `已载入模板: ${tmpl.name}`);
  };

  const handleToggleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      onShowToast("info", "流水线已暂停");
    } else {
      if (progress >= 100) setProgress(0);
      setIsRunning(true);
      onShowToast("success", "启动生成批次", `采用 Seed #${seedNumber} 进行五步闭环生产`);
      setLogs((prev) => [
        ...prev,
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: "info",
          stage: "生成引擎",
          message: `[DiffSynth] 接收到执行请求，参数：Steps=${steps}, CFG=${guidanceScale}, Seed=${seedNumber}`,
        },
      ]);
    }
  };

  const handleRandomSeed = () => {
    const newSeed = generateSeedNumber();
    setSeedNumber(newSeed);
    onShowToast("info", "已生成全新探索 Seed", `Seed: #${newSeed}`);
  };

  const handleAdoptSeed = () => {
    if (!currentBatch) return;
    setIsAdopted(true);
    onAdoptSeed({
      seedNumber,
      name: `${currentBatch.name.slice(0, 8)}-优质基因回写`,
      tier: "S",
      avgScore: currentBatch.score || 95.2,
      tags: ["人工复核通过", "口型S级", `${mode}基线`],
      params: {
        guidanceScale,
        steps,
        denoiseStrength,
        motionScale: 1.05,
        cfgLipSync: 8.8,
      },
    });
    onShowToast(
      "success",
      "优质 Seed 成功回写种子库！",
      `Seed #${seedNumber} 已作为基线沉淀，可随时发起衍生变异。`,
    );
  };

  const handleImportBatchJson = () => {
    try {
      onShowToast("success", "已批量导入 3 组批次参数", "已加入批次队列末尾");
      setIsImportModalOpen(false);
    } catch {
      onShowToast("error", "JSON 格式解析失败");
    }
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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a1628] relative">
      {/* Top Parameter Template Quick Switcher Bar */}
      <div className="px-4 py-2 bg-[#0c1a30] border-b border-[#1e2f47] flex items-center justify-between gap-4 text-xs select-none flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[#8a97a8] whitespace-nowrap text-[11px] font-medium flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-[#00e0b8]" />
            常用模板:
          </span>
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleApplyTemplate(tmpl)}
              className="px-2.5 py-1 rounded-full bg-[#15294a] hover:bg-[#182f54] text-[#8a97a8] hover:text-[#00e0b8] border border-[#1e2f47] hover:border-[#00e0b8]/40 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{tmpl.name}</span>
              <span className="text-[10px] text-[#5c697a] font-mono">{tmpl.mode}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="xs"
            icon={<History className="w-3.5 h-3.5" />}
            onClick={() => setIsDiffModalOpen(true)}
          >
            参数版本对比
          </Button>
          <Button
            variant="secondary"
            size="xs"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            批量参数导入
          </Button>
        </div>
      </div>

      {/* 3-Column Workspace Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Batch Queue (Width: 260px) */}
        <div className="w-64 border-r border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-[#1e2f47] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#e8f0f8]">批次任务队列</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15294a] text-[#00e0b8] border border-[#1e2f47]">
              {batches.length} 批次
            </span>
          </div>

          <div className="p-2 border-b border-[#1e2f47]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97a8]" />
              <input
                type="text"
                placeholder="筛选批次ID或名称..."
                className="w-full h-7 pl-8 pr-2 rounded-md bg-[#15294a] text-xs text-[#e8f0f8] placeholder-[#5c697a] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {batches.map((b) => {
              const isSelected = b.id === currentBatch.id;
              const isRunningCard = b.status === "running";

              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBatch(b.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                    isRunningCard
                      ? "card-running-shimmer bg-[#15294a]"
                      : isSelected
                        ? "bg-[#15294a] border-[#00e0b8] shadow-[0_0_12px_rgba(0,224,184,0.18)]"
                        : "bg-[#0f1f38] border-[#1e2f47] hover:border-[#294060]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-semibold text-[#00e0b8]">
                      {b.id}
                    </span>
                    <span className="text-[10px] text-[#8a97a8] font-mono">{b.duration}</span>
                  </div>
                  <div className="text-xs font-medium text-[#e8f0f8] truncate mb-1.5">{b.name}</div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono px-1.5 py-0.2 rounded bg-[#0a1628] text-[#00b4d8] border border-[#1e2f47]">
                      {b.mode}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        b.status === "running"
                          ? "text-[#00e0b8] animate-pulse"
                          : b.status === "completed"
                            ? "text-[#00e0b8]"
                            : b.status === "failed"
                              ? "text-[#ff7a45]"
                              : "text-[#ffb830]"
                      }`}
                    >
                      {b.status === "running" ? `${b.progress}% 运行中` : b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-[#1e2f47] bg-[#0a1628]/60 flex items-center justify-between text-[11px] text-[#8a97a8]">
            <span>提示: 双击直接载入参数</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#15294a] border border-[#1e2f47] text-[10px]">
              Ctrl+Enter
            </kbd>
          </div>
        </div>

        {/* MIDDLE COLUMN: Parameters + Controls + Terminal (Flex 1) */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 border-r border-[#1e2f47]">
          {/* Five-Stage Closed-Loop Pipeline Visualizer */}
          <PipelineBar
            currentStage={currentStage}
            progress={progress}
            isRunning={isRunning}
            onStageClick={(stage) => setCurrentStage(stage)}
          />

          {/* Mode Switch & Action Controller Bar */}
          <div className="p-3 rounded-xl bg-[#0f1f38] border border-[#1e2f47] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8a97a8]">驱动模式:</span>
              <div className="flex rounded-lg bg-[#15294a] p-0.5 border border-[#1e2f47]">
                <button
                  onClick={() => setMode("Ref2VA")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    mode === "Ref2VA"
                      ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                      : "text-[#8a97a8] hover:text-[#e8f0f8]"
                  }`}
                >
                  Ref2VA (单图音画对齐)
                </button>
                <button
                  onClick={() => setMode("FL2VA")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    mode === "FL2VA"
                      ? "bg-[#00e0b8] text-[#0a1628] font-bold shadow-xs"
                      : "text-[#8a97a8] hover:text-[#e8f0f8]"
                  }`}
                >
                  FL2VA (关键帧长镜头)
                </button>
              </div>
            </div>

            {/* Execution Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={isRunning ? "danger" : "primary"}
                size="sm"
                icon={
                  isRunning ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )
                }
                onClick={handleToggleRun}
              >
                {isRunning
                  ? "暂停生成 (Pause)"
                  : progress >= 100
                    ? "重新运行当前批次"
                    : "启动生成 (Ctrl+Enter)"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={<Square className="w-3.5 h-3.5" />}
                onClick={() => {
                  setIsRunning(false);
                  setProgress(0);
                  onShowToast("warning", "批次已重置终止");
                }}
              >
                终止
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<Bookmark className="w-3.5 h-3.5" />}
                onClick={() => onShowToast("success", "参数已保存为模板")}
              >
                保存模板
              </Button>
            </div>
          </div>

          {/* Form Parameters Section */}
          <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00e0b8]" />
                <span className="text-xs font-semibold text-[#e8f0f8]">
                  DiffSynth 扩散采样参数配置
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleRandomSeed}
                  className="text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  随机变异 Seed
                </button>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#8a97a8]">
                <span>提示词 (Prompt)</span>
                <span className="text-[11px] font-mono text-[#5c697a]">{prompt.length} 字符</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs text-[#e8f0f8] placeholder-[#5c697a] focus:outline-none focus:border-[#00e0b8] transition-colors leading-relaxed"
                placeholder="输入数字人面部特征、服饰、眼神光、肢体姿态与机位视角..."
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#8a97a8]">
                负向提示词 (Negative Prompt)
              </span>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs text-[#8a97a8] focus:outline-none focus:border-[#00e0b8]"
              />
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <Input
                label="Seed 种子号"
                type="number"
                value={seedNumber}
                onChange={(e) => setSeedNumber(parseInt(e.target.value) || 0)}
                mono
              />

              <Slider
                label="采样步数 (Steps)"
                min={20}
                max={50}
                step={1}
                value={steps}
                onChange={setSteps}
              />

              <Slider
                label="CFG 强度 (Guidance)"
                min={3.0}
                max={15.0}
                step={0.5}
                value={guidanceScale}
                onChange={setGuidanceScale}
              />

              <Slider
                label="降噪系数 (Denoise)"
                min={0.3}
                max={0.9}
                step={0.05}
                value={denoiseStrength}
                onChange={setDenoiseStrength}
              />
            </div>

            {/* HW & Resolution Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1e2f47]/60 text-xs">
              <div className="flex items-center gap-4">
                <Select
                  label="输出分辨率"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  options={[
                    { value: "1080x1920", label: "1080×1920 (9:16 竖屏高清)" },
                    { value: "720x1280", label: "720×1280 (极速测试)" },
                    { value: "1920x1080", label: "1920×1080 (16:9 横屏播报)" },
                  ]}
                />
                <Select
                  label="帧率 (FPS)"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  options={[
                    { value: 30, label: "30 FPS (标准播报)" },
                    { value: 60, label: "60 FPS (高动态流体)" },
                  ]}
                />
              </div>

              <div className="pt-4">
                <Switch
                  checked={fp8Optimization}
                  onChange={setFp8Optimization}
                  label="启用 FP8 TensorRT 显存加速"
                  description="显存占用从 22G 降至 18G，推理提速 32%"
                />
              </div>
            </div>
          </div>

          {/* Terminal Log Console */}
          <TerminalLogPanel
            logs={logs}
            onClear={() => setLogs([])}
            onTroubleshootFix={(action) => {
              onShowToast("success", "已触发排障修复", `已自动执行自愈动作: ${action}`);
            }}
          />
        </div>

        {/* RIGHT COLUMN: Video Preview + Real-time Keyframe Stream + Quality Review + Seed Adoption */}
        <div className="w-96 border-l border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
            <span className="text-xs font-semibold text-[#e8f0f8]">实时渲染产物与质量复核</span>
            <Badge variant="brand" size="xs">
              Score: {currentBatch.score} 分
            </Badge>
          </div>

          {/* Video Player */}
          <VideoPreviewPlayer
            posterUrl={currentBatch.previewThumbnail}
            batchId={currentBatch.id}
            seedNumber={seedNumber}
            score={currentBatch.score}
            onSnapshot={() => onShowToast("success", "截图已保存", "已添加至当前批次关键帧库")}
          />

          {/* Real-time Keyframe Streamer Strip (Requirement 2.1) */}
          <div className="p-3 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#e8f0f8]">
                <Camera className="w-3.5 h-3.5 text-[#00e0b8]" />
                <span>生成中实时抽帧流 (Keyframe Stream)</span>
              </div>
              <span className="font-mono text-[10px] text-[#00e0b8]">5s 抽样</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {keyframes.map((kf) => (
                <div
                  key={kf.frameNumber}
                  className="w-20 flex-shrink-0 rounded-lg bg-[#15294a] border border-[#1e2f47] overflow-hidden p-1 space-y-1 group hover:border-[#00e0b8]/40 transition-colors cursor-pointer"
                >
                  <div className="aspect-square rounded overflow-hidden relative">
                    <img
                      src={kf.thumbnail}
                      alt={`F${kf.frameNumber}`}
                      className="w-full h-full object-cover"
                    />
                    {kf.anomaly && (
                      <span
                        className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#ff7a45]"
                        title={kf.anomaly}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-[#8a97a8]">{kf.frameNumber}F</span>
                    <span className="text-[#00e0b8]">{kf.lipScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Dimension Radar Chart */}
          <RadarScoreChart />

          {/* Human Review & Defect Checklist */}
          <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e8f0f8]">人工复核与缺陷标记</span>
              <div className="flex items-center gap-1 text-[#ffb830]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewScore(star)}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8a97a8]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defectChecks.lipSyncAccurate}
                  onChange={(e) =>
                    setDefectChecks({
                      ...defectChecks,
                      lipSyncAccurate: e.target.checked,
                    })
                  }
                  className="rounded accent-[#00e0b8]"
                />
                <span>口型音素准确</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defectChecks.microExpressionNatural}
                  onChange={(e) =>
                    setDefectChecks({
                      ...defectChecks,
                      microExpressionNatural: e.target.checked,
                    })
                  }
                  className="rounded accent-[#00e0b8]"
                />
                <span>微表情自然</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defectChecks.noTemporalFlicker}
                  onChange={(e) =>
                    setDefectChecks({
                      ...defectChecks,
                      noTemporalFlicker: e.target.checked,
                    })
                  }
                  className="rounded accent-[#00e0b8]"
                />
                <span>无时序撕裂伪影</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defectChecks.edgeSharpened}
                  onChange={(e) =>
                    setDefectChecks({
                      ...defectChecks,
                      edgeSharpened: e.target.checked,
                    })
                  }
                  className="rounded accent-[#00e0b8]"
                />
                <span>毛发与下颌清晰</span>
              </label>
            </div>

            {/* The Key Closed-Loop Action: Adopt Seed & Write Back */}
            <div className="pt-2 border-t border-[#1e2f47]/60">
              <Button
                variant={isAdopted ? "outline" : "primary"}
                size="md"
                className="w-full"
                icon={
                  isAdopted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00e0b8]" />
                  ) : (
                    <Dna className="w-4 h-4" />
                  )
                }
                onClick={handleAdoptSeed}
                disabled={isAdopted}
              >
                {isAdopted ? "已成功采纳并沉淀回写" : "采纳为优质 Seed 并回写种子库"}
              </Button>
              <p className="text-[10px] text-[#5c697a] text-center mt-1.5">
                完成五步闭环：自动更新种子基因参数，反哺后续批次迭代
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Shortcut Hint Bar (Requirement 2.1) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#0c1a30]/90 border border-[#1e2f47] shadow-xl backdrop-blur-md flex items-center gap-4 text-[11px] text-[#8a97a8] pointer-events-none select-none z-20">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">
            Space
          </kbd>
          <span>播放/暂停</span>
        </span>
        <span className="text-[#1e2f47]">|</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">
            Ctrl+Enter
          </kbd>
          <span>启动生成</span>
        </span>
        <span className="text-[#1e2f47]">|</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">
            Ctrl+S
          </kbd>
          <span>保存模板</span>
        </span>
        <span className="text-[#1e2f47]">|</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1 py-0.2 rounded bg-[#15294a] text-[#00e0b8] font-mono text-[10px]">
            Ctrl+/
          </kbd>
          <span>YYC³ AI协同</span>
        </span>
      </div>

      {/* Parameter Version Diff Modal */}
      <Modal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        title="参数历史版本对比与回滚 (Parameter Version Diff)"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsDiffModalOpen(false)}>
              关闭
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSteps(32);
                setGuidanceScale(7.2);
                setIsDiffModalOpen(false);
                onShowToast("success", "已回滚到 v2.0 黄金基线参数");
              }}
            >
              一键回滚到此历史版本
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#8a97a8]">当前配置 vs 历史推荐基准 (v2.0 Benchmark)</p>
          <div className="p-3 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-2 font-mono">
            <div className="flex justify-between py-1 border-b border-[#1e2f47]/50">
              <span className="text-[#8a97a8]">参数项</span>
              <span className="text-[#e8f0f8]">当前值</span>
              <span className="text-[#00e0b8]">历史 v2.0 基准</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e2f47]/50 bg-[#ff7a45]/10 px-1 rounded">
              <span className="text-[#8a97a8]">Guidance Scale</span>
              <span className="text-[#ff7a45]">{guidanceScale} (偏高)</span>
              <span className="text-[#00e0b8]">7.2</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e2f47]/50 bg-[#ff7a45]/10 px-1 rounded">
              <span className="text-[#8a97a8]">Steps</span>
              <span className="text-[#ff7a45]">{steps}</span>
              <span className="text-[#00e0b8]">32</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e2f47]/50">
              <span className="text-[#8a97a8]">Denoise Strength</span>
              <span className="text-[#e8f0f8]">{denoiseStrength}</span>
              <span className="text-[#00e0b8]">{denoiseStrength}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Batch Parameter Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="批量参数导入 (Batch JSON Import)"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportBatchJson}>
              确认导入并生成批次队列
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#8a97a8]">
            支持粘贴包含多条批次参数的 JSON 数组，自动批量加入调度队列：
          </p>
          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            rows={6}
            placeholder={`[\n  {\n    "name": "批次01",\n    "seed": 48920194,\n    "mode": "Ref2VA",\n    "steps": 30\n  }\n]`}
            className="w-full p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs font-mono text-[#e8f0f8] focus:outline-none focus:border-[#00e0b8]"
          />
        </div>
      </Modal>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
