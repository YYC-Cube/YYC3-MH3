/**
 * file: src/views/NightlyConsoleView.tsx
 * description: YYC³ 功能视图 — NightlyConsoleView
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
 * brief: YYC³ 功能视图 — NightlyConsoleView
 *
 * dependencies: react, lucide-react, ../components/common, ../types
 * exports: NightlyConsoleViewProps, NightlyConsoleView
 */
import {
  Bell,
  Moon,
  Zap
} from "lucide-react"
import React, { useState } from "react"
import { Badge, Button, Card, Input, Switch } from "../components/common"
import { NavigateExtra, NavTabId } from "../types"

export interface NightlyConsoleViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    msg: string,
    sub?: string,
  ) => void
}

export const NightlyConsoleView: React.FC<NightlyConsoleViewProps> = ({
  onShowToast,
}) => {
  const [autoNas, setAutoNas] = useState(true)
  const [autoShutdown, setAutoShutdown] = useState(false)
  const [retryFp8, setRetryFp8] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState(
    "http://127.0.0.1:3031/hooks/nightly-report",
  )

  const nightlyBatches = [
    {
      id: "NIGHTLY-01",
      name: "金融早报长文本批量合成 (01~10讲)",
      start: "02:00",
      end: "02:45",
      duration: "45m",
      seed: 48920194,
      priority: "高",
    },
    {
      id: "NIGHTLY-02",
      name: "漫剧第一季第03集 18机位全渲染",
      start: "02:45",
      end: "04:05",
      duration: "1h 20m",
      seed: 81923011,
      priority: "高",
    },
    {
      id: "NIGHTLY-03",
      name: "S级种子极端爆破音口型压力测试 (变异50组)",
      start: "04:05",
      end: "06:15",
      duration: "2h 10m",
      seed: 33491820,
      priority: "中",
    },
    {
      id: "NIGHTLY-04",
      name: "全量模型权重碎片整理与快照备份",
      start: "06:15",
      end: "06:35",
      duration: "20m",
      seed: 0,
      priority: "低",
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#040c17]">
      {/* Top Banner with Low Lux Theme */}
      <div className="p-5 rounded-xl bg-[#081220] border border-[#1e2a38] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#00e0b8]" />
            <h1 className="text-base font-bold text-[#e8f0f8]">
              夜间批量无人值守控制台 · Nightly Console
            </h1>
            <Badge variant="brand" size="xs">
              低蓝光护眼暖色调
            </Badge>
          </div>
          <p className="text-xs text-[#8a97a8] mt-1">
            利用低峰夜间算力无人值守执行批量渲染与 Seed
            变异压测，支持错误自愈与完成后休眠
          </p>
        </div>

        {/* Smart Estimation Card */}
        <div className="flex items-center gap-4 bg-[#0c1828] p-2.5 rounded-xl border border-[#1e2a38]">
          <div className="text-right">
            <div className="text-[10px] text-[#8a97a8]">预计总产出时长</div>
            <div className="font-mono text-sm font-bold text-[#00e0b8]">
              4小时 35分钟
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Zap className="w-3.5 h-3.5 fill-current" />}
            onClick={() =>
              onShowToast(
                "success",
                "夜间计划已锁定",
                "将于凌晨 02:00 自动唤醒执行",
              )
            }
          >
            保存并锁定计划
          </Button>
        </div>
      </div>

      {/* Gantt-Chart Style Timeline Schedule Visualization (Requirement 2.2) */}
      <Card title="夜间任务甘特执行时间线 (Gantt Schedule 02:00 ~ 07:00)">
        <div className="space-y-3 text-xs">
          {/* Time ruler */}
          <div className="grid grid-cols-5 text-[#8a97a8] font-mono text-[11px] pb-1 border-b border-[#1e2a38]">
            <div>02:00</div>
            <div>03:00</div>
            <div>04:00</div>
            <div>05:00</div>
            <div>06:00 ~ 07:00</div>
          </div>

          {/* Gantt task bars */}
          <div className="space-y-2 pt-1">
            {nightlyBatches.map((task) => (
              <div
                key={task.id}
                className="p-2.5 rounded-lg bg-[#081220] border border-[#1e2a38] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#00e0b8] font-bold">
                    {task.id}
                  </span>
                  <span className="text-[#e8f0f8] font-medium">
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs">
                  <span className="text-[#8a97a8]">
                    {task.start} - {task.end} ({task.duration})
                  </span>
                  <Badge
                    variant={
                      task.priority === "高"
                        ? "brand"
                        : task.priority === "中"
                          ? "info"
                          : "neutral"
                    }
                    size="xs"
                  >
                    优先级 {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Execution Policies & Webhook Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card title="无人值守策略配置">
          <div className="space-y-3">
            <Switch
              checked={retryFp8}
              onChange={setRetryFp8}
              label="错误自愈：遇到 CUDA OOM 时自动切换 FP8 权重重试"
              description="若单次重试依然超标，跳过该任务并记录错误栈，不阻塞后续队列"
            />
            <Switch
              checked={autoNas}
              onChange={setAutoNas}
              label="生成产物自动打包归档至本地 NAS 存储"
              description="包括 4K 最终视频、多维评分报告与沉淀的 Seed 基因文件"
            />
            <Switch
              checked={autoShutdown}
              onChange={setAutoShutdown}
              label="任务全部完成后自动休眠主机"
              description="完成后向企业微信/飞书发送晨间简报，并安全卸载显存驱动"
            />
          </div>
        </Card>

        <Card title="晨间完成报告推送 (Webhook 推送通知)">
          <div className="space-y-3">
            <p className="text-[#8a97a8]">
              任务完成或遇异常时，向本地通知服务回环地址推送晨间简报（不出公网）：
            </p>
            <Input
              label="本地 Webhook 地址（演示初始值，可改为自建服务）"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              mono
            />
            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="xs"
                icon={<Bell className="w-3.5 h-3.5 text-[#00e0b8]" />}
                onClick={() =>
                  onShowToast("success", "已发送测试推送消息至 Webhook")
                }
              >
                发送测试通知
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
