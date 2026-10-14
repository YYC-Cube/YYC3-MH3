/**
 * file: src/views/SettingsView.tsx
 * description: YYC³ 功能视图 — SettingsView
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — SettingsView
 *
 * dependencies: react, lucide-react, ../components/common, ../types
 * exports: SettingsCategory, SETTINGS_TABS, SettingsViewProps, SettingsView
 */
import {
  CheckCircle2,
  RotateCcw
} from "lucide-react"
import React, { useState } from "react"
import {
  Badge,
  Button,
  Card,
  Input,
  Slider,
  Switch,
} from "../components/common"

/** 设置中心分类页签 ID */
export type SettingsCategory = "perf" | "paths" | "hotkeys" | "appearance"

const SETTINGS_TABS: { id: SettingsCategory; label: string }[] = [
  { id: "hotkeys", label: "全局快捷键速查表 (Hotkeys)" },
  { id: "perf", label: "算力与 VRAM 显存配置" },
  { id: "paths", label: "本地存储与模型路径" },
  { id: "appearance", label: "深色科技外观质感" },
]

export interface SettingsViewProps {
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    msg: string,
    sub?: string,
  ) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategory>("hotkeys")

  // Form states
  const [vramLimit, setVramLimit] = useState(21.5)
  const [concurrentBatches, setConcurrentBatches] = useState(1)
  const [autoPurgeCache, setAutoPurgeCache] = useState(true)
  const [weightsPath, setWeightsPath] = useState(
    "/data/models/diffsynth-minimax-h3",
  )
  const [outputPath, setOutputPath] = useState("/data/outputs/renders")

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#071425]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#e6edf3]">
              系统设置与硬件配置 · System Settings
            </h1>
            <Badge variant="brand" size="xs">
              实时生效
            </Badge>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            个性化外观偏好、本地 NVMe 存储路径、RTX 显存阈值限制与全局快捷键
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("info", "所有设置已恢复出厂默认值")}
          >
            恢复默认配置
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              onShowToast("success", "全局配置已持久化至本地 IndexedDB")
            }
          >
            保存配置
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d] flex gap-6 text-xs">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${activeCategory === tab.id
                ? "text-[#00d4aa] font-semibold"
                : "text-[#8b949e] hover:text-[#e6edf3]"
              }`}
          >
            {tab.label}
            {activeCategory === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d4aa]" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Hotkeys */}
      {activeCategory === "hotkeys" && (
        <Card
          title="系统全域快捷键速查表"
          subtitle="大幅提高长时间生产作业操作效率"
        >
          <div className="divide-y divide-[#30363d]/50 text-xs">
            {[
              {
                key: "Ctrl + K",
                desc: "唤起全局极速搜索（跨页面、批次、Seed与文档）",
                scope: "全局",
              },
              {
                key: "Ctrl + B",
                desc: "切换左侧导航栏展开 / 折叠",
                scope: "全局",
              },
              {
                key: "Ctrl + Enter",
                desc: "启动当前选中的批次五步生成",
                scope: "流水线工作台 / 批次详情",
              },
              {
                key: "Space (空格)",
                desc: "播放 / 暂停视频预览",
                scope: "视频预览播放器",
              },
              {
                key: "Ctrl + S",
                desc: "保存当前配置表单为常用模板",
                scope: "工作台 / 提示词中心",
              },
              {
                key: "Esc",
                desc: "关闭弹窗 / 退出全屏 / 关闭抽屉",
                scope: "全局",
              },
            ].map((hk, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <kbd className="px-2.5 py-1 rounded bg-[#122340] border border-[#30363d] text-[#00d4aa] font-mono font-bold text-xs shadow-xs">
                    {hk.key}
                  </kbd>
                  <span className="text-[#e6edf3] font-medium">{hk.desc}</span>
                </div>
                <span className="text-xs text-[#8b949e] font-mono px-2 py-0.5 rounded bg-[#071425]">
                  {hk.scope}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: Perf */}
      {activeCategory === "perf" && (
        <Card title="硬件算力与显存上限调优">
          <div className="space-y-4 text-xs max-w-xl">
            <Slider
              label="最大允许 VRAM 占用阈值"
              hint="到达此阈值自动启动 FP8 量化并报警"
              min={12.0}
              max={24.0}
              step={0.5}
              value={vramLimit}
              onChange={setVramLimit}
              unit=" GB"
            />

            <Slider
              label="最大并发生成批次数 (Concurrency)"
              hint="单卡推荐 1，多卡可调高"
              min={1}
              max={4}
              step={1}
              value={concurrentBatches}
              onChange={setConcurrentBatches}
            />

            <div className="pt-2">
              <Switch
                checked={autoPurgeCache}
                onChange={setAutoPurgeCache}
                label="生成完毕后自动释放显存中间激活值"
                description="防止连续高频跑图时产生 CUDA 内存碎片"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: Paths */}
      {activeCategory === "paths" && (
        <Card title="本地 NVMe 文件系统绝对路径">
          <div className="space-y-4 text-xs max-w-xl">
            <Input
              label="DiffSynth 模型权重存放目录"
              value={weightsPath}
              onChange={(e) => setWeightsPath(e.target.value)}
              mono
              suffixIcon={<CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />}
              hint="路径有效，检测到 4 套可用权重"
            />

            <Input
              label="4K 视频渲染输出与快照目录"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              mono
              suffixIcon={<CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />}
              hint="当前可用空间: 1,218 GB"
            />
          </div>
        </Card>
      )}

      {/* TAB 4: Appearance */}
      {activeCategory === "appearance" && (
        <Card title="深色科技 UI 外观偏好">
          <div className="space-y-3 text-xs max-w-xl">
            <div className="p-3 rounded-lg bg-[#122340] border border-[#30363d] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#e6edf3]">
                  主品牌主题色
                </span>
                <p className="text-[11px] text-[#8b949e]">
                  默认工业级青绿色 (#00d4aa)
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#00d4aa] border-2 border-white shadow-sm" />
            </div>

            <div className="p-3 rounded-lg bg-[#122340] border border-[#30363d] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#e6edf3]">
                  微玻璃拟态与阴影强度
                </span>
                <p className="text-[11px] text-[#8b949e]">
                  微玻璃拟态 (Blur: 12px, 弱边缘细边框)
                </p>
              </div>
              <Badge variant="brand" size="xs">
                已开启
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
