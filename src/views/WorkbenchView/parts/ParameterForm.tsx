/**
 * file: src/views/WorkbenchView/parts/ParameterForm.tsx
 * description: YYC³ 功能视图 — WorkbenchView DiffSynth 扩散采样参数配置表单
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 中栏参数面板（提示词 / 负向提示词 / Seed·Steps·CFG·降噪滑杆 /
 *        分辨率·帧率选择器 / FP8 显存加速开关 / 随机变异 Seed），逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: ParameterFormProps, ParameterForm
 */
import { RefreshCw, Sliders } from "lucide-react";
import React from "react";
import { Input, Select, Slider, Switch } from "../../../components/common";

export interface ParameterFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (prompt: string) => void;
  seedNumber: number;
  onSeedNumberChange: (seed: number) => void;
  steps: number;
  onStepsChange: (steps: number) => void;
  guidanceScale: number;
  onGuidanceScaleChange: (scale: number) => void;
  denoiseStrength: number;
  onDenoiseStrengthChange: (strength: number) => void;
  fps: number;
  onFpsChange: (fps: number) => void;
  resolution: string;
  onResolutionChange: (resolution: string) => void;
  fp8Optimization: boolean;
  onFp8OptimizationChange: (enabled: boolean) => void;
  onRandomSeed: () => void;
}

export const ParameterForm: React.FC<ParameterFormProps> = ({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  seedNumber,
  onSeedNumberChange,
  steps,
  onStepsChange,
  guidanceScale,
  onGuidanceScaleChange,
  denoiseStrength,
  onDenoiseStrengthChange,
  fps,
  onFpsChange,
  resolution,
  onResolutionChange,
  fp8Optimization,
  onFp8OptimizationChange,
  onRandomSeed,
}) => {
  return (
    <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00e0b8]" />
          <span className="text-xs font-semibold text-[#e8f0f8]">DiffSynth 扩散采样参数配置</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onRandomSeed}
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
          <span className="text-[11px] font-mono text-[#8b949e]">{prompt.length} 字符</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={2}
          className="w-full p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs text-[#e8f0f8] placeholder-[#8b949e] focus:outline-none focus:border-[#00e0b8] transition-colors leading-relaxed"
          placeholder="输入数字人面部特征、服饰、眼神光、肢体姿态与机位视角..."
        />
      </div>

      {/* Negative Prompt */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-[#8a97a8]">负向提示词 (Negative Prompt)</span>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          className="w-full h-8 px-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs text-[#8a97a8] focus:outline-none focus:border-[#00e0b8]"
        />
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <Input
          label="Seed 种子号"
          type="number"
          value={seedNumber}
          onChange={(e) => onSeedNumberChange(parseInt(e.target.value) || 0)}
          mono
        />

        <Slider
          label="采样步数 (Steps)"
          min={20}
          max={50}
          step={1}
          value={steps}
          onChange={onStepsChange}
        />

        <Slider
          label="CFG 强度 (Guidance)"
          min={3.0}
          max={15.0}
          step={0.5}
          value={guidanceScale}
          onChange={onGuidanceScaleChange}
        />

        <Slider
          label="降噪系数 (Denoise)"
          min={0.3}
          max={0.9}
          step={0.05}
          value={denoiseStrength}
          onChange={onDenoiseStrengthChange}
        />
      </div>

      {/* HW & Resolution Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1e2f47]/60 text-xs">
        <div className="flex items-center gap-4">
          <Select
            label="输出分辨率"
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value)}
            options={[
              { value: "1080x1920", label: "1080×1920 (9:16 竖屏高清)" },
              { value: "720x1280", label: "720×1280 (极速测试)" },
              { value: "1920x1080", label: "1920×1080 (16:9 横屏播报)" },
            ]}
          />
          <Select
            label="帧率 (FPS)"
            value={fps}
            onChange={(e) => onFpsChange(parseInt(e.target.value))}
            options={[
              { value: 30, label: "30 FPS (标准播报)" },
              { value: 60, label: "60 FPS (高动态流体)" },
            ]}
          />
        </div>

        <div className="pt-4">
          <Switch
            checked={fp8Optimization}
            onChange={onFp8OptimizationChange}
            label="启用 FP8 TensorRT 显存加速"
            description="显存占用从 22G 降至 18G，推理提速 32%"
          />
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
