/**
 * file: src/views/DesignSystemView.tsx
 * description: YYC³ 功能视图 — DesignSystemView
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
 * brief: YYC³ 功能视图 — DesignSystemView
 *
 * dependencies: react, ../data/design, ../domains/pipeline, ../types, ../components/common, ../components/pipeline/PipelineBar
 * exports: DesignSystemViewProps, DesignSystemView
 */
import {
  Activity,
  Check,
  Code2,
  Copy,
  Layers,
  Palette,
  Sliders,
  Sparkles,
  Type,
} from "lucide-react";
import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  Input,
  Modal,
  Select,
  Slider,
  Switch,
  Tabs,
} from "../components/common";
import { PipelineBar } from "../components/pipeline/PipelineBar";
import { RadarScoreChart } from "../components/pipeline/RadarScoreChart";
import { TerminalLogPanel } from "../components/pipeline/TerminalLogPanel";
import { VideoPreviewPlayer } from "../components/pipeline/VideoPreviewPlayer";
import { DESIGN_SYSTEM_COLORS, DESIGN_SYSTEM_TYPOGRAPHY } from "../data/design";
import { getNextStage } from "../domains/pipeline";
import { LogEntry, PipelineStageKey } from "../types";

/** 设计系统分区页签 ID */
export type DesignTab = "tokens" | "atoms" | "business" | "prompts";

export interface DesignSystemViewProps {
  onOpenYYC3?: () => void;
  onOpenLogin?: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
  logs: LogEntry[];
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({
  onOpenYYC3,
  onOpenLogin,
  onShowToast,
  logs,
}) => {
  const [activeTab, setActiveTab] = useState<DesignTab>("tokens");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Form states in demo
  const [demoInput, setDemoInput] = useState("DiffSynth-MiniMax-H3-v2.1-HQ");
  const [demoInputErr, setDemoInputErr] = useState("");
  const [demoSelect, setDemoSelect] = useState("Ref2VA");
  const [demoSlider, setDemoSlider] = useState(7.5);
  const [demoSwitch1, setDemoSwitch1] = useState(true);
  const [demoSwitch2, setDemoSwitch2] = useState(false);
  const [demoBtnLoading, setDemoBtnLoading] = useState(false);

  // Modal / Drawer demo states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pipeline demo state
  const [demoPipelineStage, setDemoPipelineStage] = useState<PipelineStageKey>("fine_eval");
  const [demoPipelineProgress, setDemoPipelineProgress] = useState(68);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onShowToast("success", `已复制色值 ${hex}`, "可直接粘贴到 CSS 或 Figma 中");
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyPromptText = (title: string, text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(
      "success",
      `已复制 ${title} 提示词`,
      "已放入剪贴板，可直接发送给 AI 绘图/代码生成器",
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#071425]">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1a30] via-[#122340] to-[#0c1a30] p-6 border border-[#30363d] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d4aa]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40">
                Design System v2.0
              </span>
              <span className="text-xs text-[#8b949e]">
                · 深色科技生产力风格 · 本地闭环AI流水线专属
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">
              MiniMax-H3 本地数字人生产线 · UI设计系统与组件规范
            </h1>
            <p className="text-xs text-[#8b949e] mt-1.5 max-w-2xl leading-relaxed">
              严格遵循工业级深色科技规范，以冷静深空蓝为底、青绿为光，兼具微玻璃拟态与低延时交互，为专业数字人音画对齐与
              Seed 迭代沉淀极致生产力体验。
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() =>
                onShowToast("info", "设计规范已就绪", "当前系统遵循五步闭环流水线标准设计")
              }
            >
              导出设计规范 (JSON)
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 pt-4 border-t border-[#30363d]/60">
          <Tabs<DesignTab>
            tabs={[
              {
                id: "tokens",
                label: "设计色彩与排版规范 (Tokens)",
                icon: <Palette className="w-3.5 h-3.5" />,
              },
              {
                id: "atoms",
                label: "通用原子与交互组件 (Atoms)",
                icon: <Layers className="w-3.5 h-3.5" />,
              },
              {
                id: "business",
                label: "业务专属生产力组件 (Business)",
                icon: <Activity className="w-3.5 h-3.5" />,
              },
              {
                id: "prompts",
                label: "分场景 AI 设计提示词库 (Prompts)",
                icon: <Code2 className="w-3.5 h-3.5" />,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* TAB 1: DESIGN TOKENS */}
      {activeTab === "tokens" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Section: Colors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#00d4aa]" />
                  色彩体系规范 (Color System Tokens)
                </h2>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  以深空蓝底色为基石，青绿为功能高亮，分层清晰，保障长时间监视与生产作业的视觉舒适度
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {DESIGN_SYSTEM_COLORS.map((c) => {
                const isCopied = copiedHex === c.hex;
                return (
                  <div
                    key={c.hex}
                    onClick={() => handleCopyColor(c.hex)}
                    className="p-3 rounded-xl bg-[#0c1a30] border border-[#30363d] hover:border-[#00d4aa]/60 transition-all cursor-pointer group hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-10 h-10 rounded-lg border border-white/10 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          <span className="text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-1 rounded text-white">
                            {isCopied ? (
                              <Check className="w-3 h-3 text-[#00d4aa]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#e6edf3] group-hover:text-[#00d4aa] transition-colors">
                          {c.hex}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#e6edf3] truncate">{c.name}</div>
                      <div className="text-[11px] text-[#8b949e] mt-1 leading-relaxed line-clamp-2">
                        {c.role}
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#30363d]/60 flex items-center justify-between text-[10px] text-[#5a6268]">
                      <span>点击复制 HEX</span>
                      <span className="font-mono text-[#8b949e]">{c.sample}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Typography */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
                <Type className="w-4 h-4 text-[#00b4d8]" />
                排版与字体系统规范 (Typography System)
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                英文与数字基准 Inter，中文思源黑体，终端与数值统一采用 JetBrains Mono
              </p>
            </div>

            <div className="rounded-xl bg-[#0c1a30] border border-[#30363d] overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 bg-[#122340] text-[11px] font-semibold text-[#8b949e] border-b border-[#30363d]">
                <div className="col-span-3">层级名称</div>
                <div className="col-span-2">字号 / 字重</div>
                <div className="col-span-2">字体系列</div>
                <div className="col-span-5">界面实景预览</div>
              </div>
              <div className="divide-y divide-[#30363d]/60">
                {DESIGN_SYSTEM_TYPOGRAPHY.map((t, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-[#122340]/40 transition-colors"
                  >
                    <div className="col-span-3 font-medium text-[#e6edf3]">{t.level}</div>
                    <div className="col-span-2 font-mono text-[#00d4aa] text-[11px]">
                      {t.size} · {t.weight}
                    </div>
                    <div className="col-span-2 text-[#8b949e] text-[11px]">{t.font}</div>
                    <div
                      className="col-span-5 text-[#e6edf3] truncate"
                      style={{ fontSize: t.size }}
                    >
                      {t.sample}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Motion & Elevation Tokens */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9B59B6]" />
                动效与质感系统 (Motion & Elevation Tokens)
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                克制高效，服务反馈，微玻璃拟态 + 细边框分层，无冗余打扰动效
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] space-y-2">
                <span className="text-xs font-semibold text-[#00d4aa]">微动效时长 (0.15s)</span>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  用于按钮 hover/active、输入框聚焦光圈、Tooltip
                  滑出与下拉箭头展开，提供即时敏捷的操作触觉反馈。
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Button variant="secondary" size="xs">
                    0.15s 反馈示例
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] space-y-2">
                <span className="text-xs font-semibold text-[#00b4d8]">面板切换过渡 (0.25s)</span>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  用于右侧抽屉滑入、模态框中心缩放淡出、标签页指示条平滑滑移。曲线采用
                  ease-out-cubic。
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Button variant="outline" size="xs" onClick={() => setIsModalOpen(true)}>
                    模态框进入体验
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] space-y-2">
                <span className="text-xs font-semibold text-[#9B59B6]">
                  流水线粒子流 (2.5s 恒流)
                </span>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  用于五阶段执行进度条的光流通道与节点呼吸灯，直观表达后台 CUDA 神经渲染工作状态。
                </p>
                <div className="pt-2">
                  <div className="h-2 rounded-full pipeline-flowing w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATOMS & MOLECULES */}
      {activeTab === "atoms" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Buttons Showcase */}
          <Card
            title="按钮组件体系 (Buttons)"
            subtitle="包含 6 种类型与 Default/Hover/Active/Loading/Disabled 全态"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={() => onShowToast("success", "主按钮已触发")}>
                  主按钮 (Primary)
                </Button>
                <Button variant="secondary" onClick={() => onShowToast("info", "次级按钮点击")}>
                  次级按钮 (Secondary)
                </Button>
                <Button variant="outline">边框按钮 (Outline)</Button>
                <Button variant="purple">流程紫色 (Purple)</Button>
                <Button variant="danger" onClick={() => onShowToast("error", "危险按钮已触发")}>
                  警示危险 (Danger)
                </Button>
                <Button variant="ghost">幽灵按钮 (Ghost)</Button>
                <Button
                  variant="primary"
                  loading={demoBtnLoading}
                  onClick={() => {
                    setDemoBtnLoading(true);
                    setTimeout(() => setDemoBtnLoading(false), 2000);
                  }}
                >
                  {demoBtnLoading ? "处理中..." : "点击触发 Loading"}
                </Button>
                <Button variant="primary" disabled>
                  禁用状态 (Disabled)
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-[#8b949e]">尺寸规格：</span>
                <Button size="xs" variant="secondary">
                  Extra Small
                </Button>
                <Button size="sm" variant="secondary">
                  Small
                </Button>
                <Button size="md" variant="secondary">
                  Medium (Default)
                </Button>
                <Button size="lg" variant="primary">
                  Large Action
                </Button>
              </div>
            </div>
          </Card>

          {/* Form Controls Showcase */}
          <Card
            title="表单输入组件体系 (Form Controls)"
            subtitle="实时校验、格式化输入、极细滑块与选择器"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="模型权重路径 (Model Weight Path)"
                hint="支持绝对路径或符号链接"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                mono
              />

              <Input
                label="带错误校验输入框 (Input with Error)"
                value={demoInputErr}
                onChange={(e) => {
                  setDemoInputErr(e.target.value);
                }}
                error={demoInputErr.length < 5 ? "提示词字符数不能低于 5 个字符" : undefined}
                placeholder="输入少于5个字符测试错误态..."
              />

              <Select
                label="数字人驱动模式 (Inference Mode)"
                hint="Ref2VA 或 FL2VA"
                value={demoSelect}
                onChange={(e) => setDemoSelect(e.target.value)}
                options={[
                  {
                    value: "Ref2VA",
                    label: "Ref2VA (单参考图面容对齐)",
                    badge: "推荐",
                  },
                  { value: "FL2VA", label: "FL2VA (首尾双关键帧插值)" },
                ]}
              />

              <Slider
                label="无分类器引导缩放 (Guidance Scale)"
                hint="CFG 强度"
                min={1.0}
                max={15.0}
                step={0.5}
                value={demoSlider}
                onChange={setDemoSlider}
              />

              <div className="space-y-3 pt-2">
                <Switch
                  checked={demoSwitch1}
                  onChange={setDemoSwitch1}
                  label="启用 FP8 激活值极致缓存"
                  description="节省 4.2GB 显存，大幅提升推理帧率"
                />
                <Switch
                  checked={demoSwitch2}
                  onChange={setDemoSwitch2}
                  label="启用 SyncNet 实时逐帧多进程打分"
                  description="生成完毕自动触发 5 维雷达图"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#8b949e]">
                  弹窗与抽屉容器触发 (Containers)
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                    打开模态框 (Modal)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(true)}>
                    打开侧滑抽屉 (Drawer)
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Badges & Status Tags Showcase */}
          <Card
            title="状态徽标与标签 (Badges & Status Tags)"
            subtitle="语义化色彩，支持运行呼吸灯与微型点"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="brand" pulse>
                运行中 (Running)
              </Badge>
              <Badge variant="brand">已完成 (Success)</Badge>
              <Badge variant="info">信息流 (Info)</Badge>
              <Badge variant="purple">流水线节点 (Process)</Badge>
              <Badge variant="warning">排队等待 (Queued)</Badge>
              <Badge variant="danger">异常告警 (Error)</Badge>
              <Badge variant="neutral">已归档 (Archived)</Badge>
            </div>
          </Card>

          {/* Login Component & 6-Node Closed-Loop Verification Showcase */}
          <Card
            title="登录页面组件与六步闭环审核体系 (Login Component & 6-Node Security Pipeline)"
            subtitle="兼顾「本地离线认证」与「团队云端权限认证」双模式 · 传递数据主权核心调性"
            action={
              <Button
                variant="primary"
                size="xs"
                icon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={onOpenLogin}
              >
                模拟进入登录准入大厅
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2">
                <span className="font-semibold text-[#00e0b8]">模式 1: 本地离线认证</span>
                <p className="text-[11px] text-[#8a97a8] leading-relaxed">
                  纯本地 Argon2id 加密比对，数据不出设备，单端口 3031
                  环回通信，默认赋予全流水线超级管理员权限。
                </p>
                <Badge variant="brand" size="xs">
                  100% 离线主权
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2">
                <span className="font-semibold text-[#00b4d8]">模式 2: 团队云端认证</span>
                <p className="text-[11px] text-[#8a97a8] leading-relaxed">
                  支持企业 SAML 2.0 / OIDC
                  单点登录与移动端（飞书/企微）扫码准入，支持细粒度操作员与审片角色匹配。
                </p>
                <Badge variant="info" size="xs">
                  企业 SSO / 扫码
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2">
                <span className="font-semibold text-[#9d7cd8]">6 节点全闭环审核</span>
                <div className="text-[10px] text-[#8a97a8] font-mono space-y-0.5">
                  <div>1. 前端格式实时拦截</div>
                  <div>2. Argon2id 凭证哈希比对</div>
                  <div>3. 角色权限矩阵匹配</div>
                  <div>4. CUDA/显存环境自检修复</div>
                  <div>5. 本地安全审计留痕 (WAL)</div>
                  <div>6. 会话初始化与平滑跳转</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: BUSINESS SPECIFIC COMPONENTS */}
      {activeTab === "business" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 1. Five-stage Pipeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#e6edf3]">
                  1. 五步闭环流水线组件 (Five-Stage Closed-Loop Pipeline)
                </h3>
                <p className="text-xs text-[#8b949e]">
                  生成(DiffSynth) → 评分(SyncNet) → 精评(多模态) → 分析(缺陷归因) → Seed 迭代
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => {
                    // 循环推进规则由领域层提供（seed_iter 闭环回 generation）
                    setDemoPipelineStage(getNextStage(demoPipelineStage));
                    setDemoPipelineProgress(Math.floor(Math.random() * 80) + 20);
                  }}
                >
                  模拟推进下一个阶段
                </Button>
              </div>
            </div>
            <PipelineBar
              currentStage={demoPipelineStage}
              progress={demoPipelineProgress}
              isRunning={true}
              onStageClick={(st) => {
                setDemoPipelineStage(st);
                onShowToast("info", `已切换至流水线阶段: ${st}`);
              }}
            />
          </div>

          {/* 2. Video Player & Radar Chart Dual View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#e6edf3]">
                  2. 视频预览播放器 (Video Preview Player)
                </h3>
                <span className="text-[11px] text-[#8b949e]">
                  逐帧步进 · 0.5x~2x倍速 · 截图 · 快捷键 Space
                </span>
              </div>
              <VideoPreviewPlayer
                onSnapshot={() =>
                  onShowToast("success", "样张已捕获", "已保存至本地 runs/snapshots/ 目录")
                }
              />
            </div>

            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#e6edf3]">
                  3. 口型评分雷达图 (5-Dimension Radar Chart)
                </h3>
                <span className="text-[11px] text-[#8b949e]">五维度 · 历史均值叠层 · 告警建议</span>
              </div>
              <RadarScoreChart />
            </div>
          </div>

          {/* 4. Terminal Log Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#e6edf3]">
                4. 本地终端日志面板 (Terminal Log Console)
              </h3>
              <span className="text-[11px] text-[#8b949e]">
                Info/Warn/Error分色 · 错误排障建议入口
              </span>
            </div>
            <TerminalLogPanel
              logs={logs}
              onTroubleshootFix={(action) => {
                onShowToast("success", "已触发排障动作", `执行动作: ${action}`);
              }}
            />
          </div>

          {/* 5. YYC3 AI Family Global System */}
          <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#e8f0f8] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00e0b8]" />
                  5. YYC³ AI Family 智能协同生产系统 (Global Floating AI Center)
                </h3>
                <p className="text-xs text-[#8a97a8] mt-0.5">
                  融合环形时钟架构与 8 位全职能 AI 代理，常驻右下角浮窗，支持快捷键 Ctrl+/ 全域唤起
                </p>
              </div>
              <Button
                variant="primary"
                size="xs"
                icon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={onOpenYYC3}
              >
                即刻体验环形时钟浮窗 (Ctrl+/)
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              {[
                {
                  name: "言启·千行 (06:00)",
                  role: "意图路由与语音音素",
                  color: "text-[#FFD700]",
                },
                {
                  name: "语枢·万物 (07:30)",
                  role: "数据分析与多维指标",
                  color: "text-[#FF69B4]",
                },
                {
                  name: "预见·先知 (09:00)",
                  role: "显存预测与趋势前瞻",
                  color: "text-[#00BFFF]",
                },
                {
                  name: "千里·伯乐 (10:30)",
                  role: "优质种子优选与沉淀",
                  color: "text-white",
                },
                {
                  name: "元启·天枢 (12:00)",
                  role: "全局调度总指挥中枢",
                  color: "text-[#00e0b8]",
                },
                {
                  name: "智云·守护 (13:30)",
                  role: "安全探活与看门狗自愈",
                  color: "text-[#9d7cd8]",
                },
                {
                  name: "格物·宗师 (15:00)",
                  role: "质量标准黄金裁判官",
                  color: "text-[#C0C0C0]",
                },
                {
                  name: "创想·灵韵 (16:30)",
                  role: "创意提示词与分镜灵感",
                  color: "text-[#FF7A5C]",
                },
              ].map((ag, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-[#15294a] border border-[#1e2f47] space-y-0.5"
                >
                  <div className={`font-bold ${ag.color}`}>{ag.name}</div>
                  <div className="text-[10px] text-[#8a97a8] font-sans truncate">{ag.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI PROMPTS */}
      {activeTab === "prompts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00d4aa]" />
              分场景 AI 设计系统生成提示词集 (AI Design Prompts)
            </h2>
            <p className="text-xs text-[#8b949e] mt-0.5">
              内置规范所要求的全局系统、总览驾驶舱、流水线工作台、Agent编排与运维大屏的高保真提示词，支持一键复制
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prompt Card 1 */}
            <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#00d4aa]">
                    1. 全局设计系统生成提示词
                  </span>
                  <Badge variant="brand" size="xs">
                    全局规范
                  </Badge>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  角色设定为资深B端UI设计师，输出完整设计系统规范与色板、字体规范和组件样式。
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() =>
                  copyPromptText(
                    "全局设计系统",
                    `# 角色\n资深B端产品UI设计师，专注AI生产力工具界面设计，精通深色科技风格与设计系统搭建\n\n# 任务\n为「MiniMax-H3 本地AI数字人生产线」设计完整UI设计系统，输出统一的设计规范与组件库\n\n# 设计要求\n1. 风格：深色科技风，专业生产力工具质感，冷静精准，克制的未来感\n2. 色彩：深空蓝底色#071425，主品牌色青绿色#00d4aa，辅助色信息蓝#00b4d8、流程紫#9B59B6，警示橙红#EE4C2C`,
                  )
                }
              >
                复制全局设计系统提示词
              </Button>
            </div>

            {/* Prompt Card 2 */}
            <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#00b4d8]">
                    2. 总览驾驶舱高保真提示词
                  </span>
                  <Badge variant="info" size="xs">
                    Dashboard
                  </Badge>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  四指标卡片、5节点闭环流水线桑基流转图、资源监控环形仪表盘与最近批次表格。
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() =>
                  copyPromptText(
                    "总览驾驶舱",
                    `# 页面：总览驾驶舱 Dashboard\n# 产品：MiniMax-H3 AI数字人生产线\n# 风格：深色科技风，专业B端工具，深空蓝底色，青绿色主色\n\n# 布局\n- 顶部：全局导航栏，搜索，通知\n- 第一行：4个指标卡片（今日完成批次、成功率、平均推理时长、内存占用）\n- 第二行左侧：5节点闭环流水线实时状态\n- 第二行右侧：资源监控环形仪表盘（GPU/内存/磁盘）\n- 第三行：最近批次表格`,
                  )
                }
              >
                复制总览驾驶舱提示词
              </Button>
            </div>

            {/* Prompt Card 3 */}
            <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#00d4aa]">
                    3. 流水线工作台高保真提示词
                  </span>
                  <Badge variant="brand" size="xs">
                    Workbench 核心
                  </Badge>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  三栏布局：左栏批次队列，中间Ref2VA/FL2VA配置与终端日志，右栏视频预览与口型评分雷达。
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() =>
                  copyPromptText(
                    "流水线工作台",
                    `# 页面：流水线工作台 Workbench\n# 产品：MiniMax-H3 AI数字人生产线\n# 布局：三栏式，左右窄中间宽\n- 左栏：批次任务列表，搜索筛选\n- 中间栏：Ref2VA/FL2VA切换，参数配置表单，五阶段进度条+终端日志面板\n- 右栏：视频预览播放器+口型评分雷达图+人工复核与Seed回写`,
                  )
                }
              >
                复制流水线工作台提示词
              </Button>
            </div>

            {/* Prompt Card 4 */}
            <div className="p-4 rounded-xl bg-[#0c1a30] border border-[#30363d] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#EE4C2C]">
                    4. 系统运维监控高保真提示词
                  </span>
                  <Badge variant="danger" size="xs">
                    Ops Monitor
                  </Badge>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  4个实时折线图（CPU、内存、GPU、磁盘），看门狗服务状态列表，倒序告警与一键自愈。
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() =>
                  copyPromptText(
                    "系统运维监控",
                    `# 页面：系统运维监控 Ops Monitor\n# 产品：MiniMax-H3 AI数字人生产线\n# 风格：监控大屏风格，专业严谨\n- 上半部分：4个实时折线图（CPU、内存、GPU、磁盘），超标阈值告警\n- 下半部分左侧：服务状态列表（看门狗、Agent、模型服务）\n- 下半部分右侧：告警列表，带级别标签，未处理置顶`,
                  )
                }
              >
                复制系统运维监控提示词
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="二次确认：终止当前批次推理"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                onShowToast("error", "批次已强制终止", "显存资源已成功释放");
              }}
            >
              确认终止并释放 VRAM
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#8b949e] leading-relaxed">
          正在执行的批次为 <span className="font-mono text-[#00d4aa]">BATCH-20250412-089</span>
          。强制终止会导致未完成的 SyncNet 唇形精评数据丢失，并立即清空 CUDA 缓存，确定要执行吗？
        </p>
      </Modal>

      {/* Interactive Drawer Demo */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Seed 种子详细基因参数"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(false)}>
            应用到工作台
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#122340] border border-[#30363d] space-y-1">
            <span className="text-[#8b949e]">种子代号</span>
            <div className="font-mono text-base font-bold text-[#00d4aa]">81923011</div>
            <div className="text-[11px] text-[#8b949e]">钛极超稳态·CEO领袖种子 (S级)</div>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-[#e6edf3]">关键扩散特征参数</span>
            <div className="space-y-1 font-mono text-[11px] text-[#8b949e]">
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>Guidance Scale</span>
                <span className="text-[#00d4aa]">7.2</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>Steps</span>
                <span className="text-[#00d4aa]">32</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>Denoise Strength</span>
                <span className="text-[#00d4aa]">0.68</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-[#071425]">
                <span>CFG LipSync</span>
                <span className="text-[#00d4aa]">8.5</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
