/**
 * file: src/components/platform/DispatchModule.tsx
 * description: YYC³ 平台组件 — 生产调度台模块（推送矩阵/多卡算力槽位/音素字典/资源调度）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[platform],[dispatch]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 生产调度台 — 纯展示组件，推送任务列表经 props 注入（状态存视图层跨页签持久）
 *
 * dependencies: react, lucide-react, ../common, ./PlatformBadge, ../../types
 * exports: DispatchModuleProps, DispatchModule
 */
import { Cpu, Download, RefreshCw, Send } from "lucide-react"
import { PushTaskItem, ShowToast } from "../../types"
import { Badge, Button, Card } from "../common"
import { PlatformBadge } from "./PlatformBadge"

export interface DispatchModuleProps {
  pushTasks: PushTaskItem[]
  /** 打开新建推送作业弹窗（弹窗状态存视图层） */
  onNewPushClick: () => void
  onShowToast: ShowToast
}

/** 多卡算力槽位展示元数据（与 GpuSlot 契约互补的展示字段：配色/状态文案/功耗） */
const GPU_SLOT_RENDER_META = [
  {
    device: "CUDA:0 (RTX 4090)",
    accent: "text-[#00e0b8]",
    barColor: "bg-[#00e0b8]",
    variant: "brand" as const,
    statusLabel: "渲染中",
    power: "340W",
    job: "BATCH-089 (金融早报)",
    usedGb: 19.4,
    totalGb: 24.0,
    utilization: 91,
    temperature: 68,
    shimmer: true,
  },
  {
    device: "CUDA:1 (RTX 4090)",
    accent: "text-[#00b4d8]",
    barColor: "bg-[#00b4d8]",
    variant: "info" as const,
    statusLabel: "长镜头",
    power: "280W",
    job: "BATCH-088 (CEO演说)",
    usedGb: 14.2,
    totalGb: 24.0,
    utilization: 62,
    temperature: 62,
    shimmer: true,
  },
  {
    device: "CUDA:2 (RTX 4080)",
    accent: "text-[#9d7cd8]",
    barColor: "bg-[#9d7cd8]",
    variant: "purple" as const,
    statusLabel: "转码待命",
    power: "190W",
    job: "超分与背景转码池",
    usedGb: 6.8,
    totalGb: 16.0,
    utilization: 45,
    temperature: 54,
    shimmer: false,
  },
]

/** 多语种音素字典展示数据（展示语义与 PhonemeLanguage 契约存在措辞差异，如实本地化） */
const PHONEME_DICT = [
  {
    name: "中文普通话 (Mandarin Pro)",
    code: "zh-CN",
    count: "412 音素",
    acc: "98.4%",
    status: "已常驻",
  },
  {
    name: "英语 (US English Studio)",
    code: "en-US",
    count: "48 纯正音素",
    acc: "97.8%",
    status: "已优化",
  },
  {
    name: "日语 (Japanese Kana/Moras)",
    code: "ja-JP",
    count: "112 音拍",
    acc: "96.5%",
    status: "已就绪",
  },
  {
    name: "西班牙语 (Spanish Castilian)",
    code: "es-ES",
    count: "64 重音特征",
    acc: "95.8%",
    status: "可加载",
  },
]

export function DispatchModule({
  pushTasks,
  onNewPushClick,
  onShowToast,
}: DispatchModuleProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section: One-Click Push & Distribution Matrix */}
      <Card
        title="多平台账号矩阵分发看板 (Multi-Platform Matrix Push)"
        subtitle="支持一键推送到本地 NAS、云端存储与多平台分发 (抖音/视频号/B站/快手/小红书)"
        action={
          <Button
            variant="primary"
            size="xs"
            icon={<Send className="w-3.5 h-3.5" />}
            onClick={onNewPushClick}
          >
            新建推送作业
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
                <th className="py-2.5 px-3">作业ID / 成片标题</th>
                <th className="py-2.5 px-3">对应批次</th>
                <th className="py-2.5 px-3">目标分发渠道</th>
                <th className="py-2.5 px-3">推送账号</th>
                <th className="py-2.5 px-3">传输进度</th>
                <th className="py-2.5 px-3">实时速率</th>
                <th className="py-2.5 px-3">预计剩余</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2f47]/50">
              {pushTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-[#15294a]/40 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-mono text-[#00e0b8] font-bold">
                      {task.id}
                    </div>
                    <div className="text-[#e8f0f8] font-medium truncate max-w-xs">
                      {task.title}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#8a97a8]">
                    {task.batchId}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {task.platforms.map((p) => (
                        <PlatformBadge key={p} platform={p} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#e8f0f8]">
                    {task.targetAccount}
                  </td>
                  <td className="py-3 px-3 w-40">
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span
                          className={
                            task.status === "completed"
                              ? "text-[#00e0b8]"
                              : "text-[#8a97a8]"
                          }
                        >
                          {task.status === "completed" ? "已完成" : "传输中"}
                        </span>
                        <span className="text-[#00e0b8] font-bold">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00e0b8] h-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#00b4d8]">
                    {task.speed}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#8a97a8]">
                    {task.estRemaining}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() =>
                          onShowToast("info", `已查看推送日志: ${task.id}`)
                        }
                      >
                        日志
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          onShowToast("success", `已重新分发作业: ${task.id}`)
                        }
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section: Multi-GPU Distributed Parallel Scheduling Slots (Requirement 1) */}
      <Card
        title="多卡分布式算力调度槽位 (Multi-GPU Distributed Slots)"
        subtitle="支持 CUDA:0 / CUDA:1 / CUDA:2 多卡并行调度与动态抢占 · 显存实时分级管控"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="xs">
              3 卡在线负载均衡
            </Badge>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onShowToast("info", "多卡并行负载已自动再平衡")}
            >
              算力动态再平衡
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {GPU_SLOT_RENDER_META.map((slot) => (
            <div
              key={slot.device}
              className={`p-3.5 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-2${slot.shimmer ? " card-running-shimmer" : ""}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-bold text-[#e8f0f8]">
                  <Cpu className={`w-4 h-4 ${slot.accent}`} />
                  <span>{slot.device}</span>
                </div>
                <Badge variant={slot.variant} size="xs">
                  {slot.utilization}% {slot.statusLabel}
                </Badge>
              </div>
              <div className="space-y-1 text-[11px] text-[#8a97a8]">
                <div className="flex justify-between">
                  <span>显存使用:</span>
                  <span className={`${slot.accent} font-bold`}>
                    {slot.usedGb.toFixed(1)} / {slot.totalGb.toFixed(1)} GB
                  </span>
                </div>
                <div className="w-full bg-[#0a1628] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${slot.barColor} h-full`}
                    style={{ width: `${(slot.usedGb / slot.totalGb) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between pt-1">
                  <span>绑定作业:</span>
                  <span className="text-[#e8f0f8] font-sans">{slot.job}</span>
                </div>
                <div className="flex justify-between">
                  <span>温度/功耗:</span>
                  <span className="text-[#e8f0f8]">
                    {slot.temperature}°C · {slot.power}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section: Multi-Language Phoneme Dictionary Center (Requirement 2) */}
      <Card
        title="多语种唇形音素字典中心 (言启·千行节点赋能)"
        subtitle="支持跨语种音素频谱特征对齐 · 支撑出海与多语言矩阵数字人生产"
        action={
          <Button
            variant="secondary"
            size="xs"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("success", "已检查全语言音素词典更新")}
          >
            同步最新词典包
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {PHONEME_DICT.map((lang) => (
            <div
              key={lang.code}
              className="p-3 rounded-lg bg-[#15294a] border border-[#1e2f47] space-y-1.5"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#e8f0f8] font-sans">
                  {lang.name}
                </span>
                <Badge variant="brand" size="xs">
                  {lang.code}
                </Badge>
              </div>
              <div className="flex justify-between font-mono text-[11px] text-[#8a97a8]">
                <span>{lang.count}</span>
                <span className="text-[#00e0b8] font-bold">
                  精度 {lang.acc}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#1e2f47]/50 text-[10px]">
                <span className="text-[#5c697a]">{lang.status}</span>
                <button
                  onClick={() =>
                    onShowToast(
                      "success",
                      `已切换 ${lang.name} 作为当前对齐基准`,
                    )
                  }
                  className="text-[#00e0b8] hover:underline cursor-pointer"
                >
                  设为主词典
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section: Dynamic Resource Scheduling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#e8f0f8]">
              多平台账号授权认证状态
            </span>
            <span className="text-[10px] text-[#00e0b8] font-mono">
              5/5 授权有效
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center p-1.5 rounded bg-[#15294a]">
              <span className="text-[#e8f0f8]">抖音开放平台矩阵 (4号)</span>
              <Badge variant="brand" size="xs">
                已鉴权
              </Badge>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-[#15294a]">
              <span className="text-[#e8f0f8]">微信视频号创作者中心</span>
              <Badge variant="brand" size="xs">
                已鉴权
              </Badge>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-[#15294a]">
              <span className="text-[#e8f0f8]">Bilibili Open Platform</span>
              <Badge variant="brand" size="xs">
                已鉴权
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#e8f0f8]">
              推送异常自动重试策略
            </span>
            <Badge variant="brand" size="xs">
              自愈中
            </Badge>
          </div>
          <p className="text-xs text-[#8a97a8] leading-relaxed">
            网络抖动或平台限流时，采用指数退避算法（30s、60s、120s）自动重试，失败满
            3 次自动转入人工复核队列。
          </p>
          <Button
            variant="outline"
            size="xs"
            className="w-full"
            onClick={() => onShowToast("info", "策略已更新")}
          >
            配置重试超参数
          </Button>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
