/**
 * file: src/components/platform/AnalyticsModule.tsx
 * description: YYC³ 平台组件 — 数据分析中心模块（KPI/种子演化/成本核算/平台回执）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[platform],[analytics]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 数据分析 BI — 纯展示组件（演示快照本地化，语义归 05 Runbook）
 *
 * dependencies: react, lucide-react, ../common, ../../types
 * exports: AnalyticsModuleProps, AnalyticsModule
 */
import { Download, RefreshCw } from "lucide-react";
import { Badge, Button, Card } from "../common";
import { ShowToast } from "../../types";

export interface AnalyticsModuleProps {
  onShowToast: ShowToast;
}

/** 种子基因演化演示数据（五步闭环反哺基线） */
const SEED_EVOLUTION = [
  { round: "第1代 (初始)", score: 86.4, num: "Seed #1024" },
  { round: "第2代 (初评)", score: 89.2, num: "Seed #2048" },
  { round: "第3代 (微调)", score: 92.1, num: "Seed #3349" },
  { round: "第4代 (精评)", score: 95.4, num: "Seed #4892" },
  { round: "第5代 (宗师)", score: 96.8, num: "Seed #8192" },
];

/** 分发平台回执演示数据（展示态字符串口径，语义见 05 Runbook） */
const RECEIPT_ROWS = [
  {
    plat: "抖音 (短视频/带货)",
    acc: "@智见科技官方号",
    views: "48.2W",
    likes: "3.4W",
    shares: "4,280",
    sentiment: 96.4,
    feedbackSeed: "Seed #81923011 (已沉淀金牌基线)",
  },
  {
    plat: "微信视频号 (公私域)",
    acc: "@财智领袖频道",
    views: "26.5W",
    likes: "1.8W",
    shares: "3,120",
    sentiment: 98.2,
    feedbackSeed: "Seed #48920194 (已回写权威特征)",
  },
  {
    plat: "Bilibili (高画质长视频)",
    acc: "@前沿数字人实验室",
    views: "18.9W",
    likes: "2.1W 硬币",
    shares: "1,940",
    sentiment: 95.8,
    feedbackSeed: "Seed #33491820 (已沉淀高动态)",
  },
  {
    plat: "小红书 (美妆/穿搭)",
    acc: "@美妆灵动官",
    views: "14.2W",
    likes: "2.6W 收藏",
    shares: "2,890",
    sentiment: 97.5,
    feedbackSeed: "Seed #90184421 (微表情优选)",
  },
];

export function AnalyticsModule({ onShowToast }: AnalyticsModuleProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2">
          <span className="text-[#8a97a8]">累计产出数字人视频总长</span>
          <div className="font-mono text-2xl font-bold text-[#00e0b8]">42.8 小时</div>
          <div className="text-[11px] text-[#8a97a8]">本月环比 +28.4% · 累计 840 支视频</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2">
          <span className="text-[#8a97a8]">全周期综合达标率</span>
          <div className="font-mono text-2xl font-bold text-[#00b4d8]">98.6%</div>
          <div className="text-[11px] text-[#8a97a8]">五维加权得分 ≥85 分的合格样本占比</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2">
          <span className="text-[#8a97a8]">单批次平均生产能耗与算力</span>
          <div className="font-mono text-2xl font-bold text-[#e8f0f8]">0.14 度 / 批</div>
          <div className="text-[11px] text-[#8a97a8]">单视频算力成本仅 ¥0.08，极具竞争优势</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-2">
          <span className="text-[#8a97a8]">S级优质 Seed 储备池</span>
          <div className="font-mono text-2xl font-bold text-[#9d7cd8]">64 组</div>
          <div className="text-[11px] text-[#8a97a8]">已完成 180+ 次变异反哺闭环进化</div>
        </div>
      </div>

      {/* Section: Seed Evolution Analytics & Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
            <span className="font-semibold text-sm text-[#e8f0f8]">
              Seed 种子基因演化评分趋势 (Seed Evolution BI)
            </span>
            <Badge variant="brand" size="xs">
              持续正向反哺
            </Badge>
          </div>

          {/* Evolution curve visualization */}
          <div className="h-44 w-full flex items-end gap-3 pt-4">
            {SEED_EVOLUTION.map((item) => (
              <div key={item.num} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="font-mono text-[#00e0b8] font-bold text-xs">{item.score}</span>
                <div
                  className="w-full bg-gradient-to-t from-[#00b4d8] to-[#00e0b8] rounded-t transition-all group-hover:brightness-125 shadow-sm"
                  style={{ height: `${(item.score - 70) * 3}%` }}
                />
                <span className="font-mono text-[10px] text-[#e8f0f8] font-semibold">
                  {item.round}
                </span>
                <span className="font-mono text-[9px] text-[#8b949e]">{item.num}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#0a1628] border border-[#1e2f47] text-[11px] text-[#8a97a8] leading-relaxed">
            <strong>演化洞察：</strong>
            随着五步流水线持续采纳回写，高评分（≥95分）种子占比从最初的 12% 跃升至当前
            78.4%，口型时延方差降低 62%。
          </div>
        </div>

        {/* Quality & Cost Breakdown */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2f47]">
            <span className="font-semibold text-sm text-[#e8f0f8]">全生命周期成本与质量核算</span>
            <span className="font-mono text-[#00e0b8] text-[11px]">ROI 提升 340%</span>
          </div>

          <div className="space-y-3 font-mono">
            <div>
              <div className="flex justify-between text-[#8a97a8] mb-1">
                <span>本地电力能耗</span>
                <span className="text-[#e8f0f8]">¥ 240 / 月</span>
              </div>
              <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00e0b8] h-full" style={{ width: "25%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#8a97a8] mb-1">
                <span>NVMe 固态存储摊销</span>
                <span className="text-[#e8f0f8]">¥ 85 / 月</span>
              </div>
              <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00b4d8] h-full" style={{ width: "15%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#8a97a8] mb-1">
                <span>对比传统外采云端 API 节约</span>
                <span className="text-[#00e0b8] font-bold">已节省 ¥ 18,400</span>
              </div>
              <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00e0b8] h-full" style={{ width: "90%" }} />
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("success", "成本核算明细报表 (Excel) 已下载")}
          >
            导出财务与效益核算清单
          </Button>
        </div>
      </div>

      {/* Section: Social Platform API Webhook Receipts & Metric Backflow (Requirement 3) */}
      <Card
        title="分发平台 API 自动回执与数据回流看板 (Platform Receipts & Audience BI)"
        subtitle="分发回执经本地遥测聚合自动抓取播放、点赞与互动指标（演示数据）· 反哺回写 Seed 商业基线"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="xs">
              已自动同步 (每 30 分钟)
            </Badge>
            <Button
              variant="secondary"
              size="xs"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => onShowToast("success", "已触发多平台 Webhook 实时增量回执同步")}
            >
              立即拉取全网回执
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
                <th className="py-2.5 px-3">矩阵分发渠道</th>
                <th className="py-2.5 px-3">认证发布账号</th>
                <th className="py-2.5 px-3">全网播放量</th>
                <th className="py-2.5 px-3">点赞与收藏</th>
                <th className="py-2.5 px-3">转发与评论</th>
                <th className="py-2.5 px-3">观众正向情感度</th>
                <th className="py-2.5 px-3">反哺种子回写状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2f47]/50">
              {RECEIPT_ROWS.map((row) => (
                <tr key={row.plat} className="hover:bg-[#15294a]/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#e8f0f8] font-sans">{row.plat}</td>
                  <td className="py-2.5 px-3 text-[#00b4d8]">{row.acc}</td>
                  <td className="py-2.5 px-3 text-[#00e0b8] font-bold text-sm">{row.views}</td>
                  <td className="py-2.5 px-3 text-[#e8f0f8]">{row.likes}</td>
                  <td className="py-2.5 px-3 text-[#8a97a8]">{row.shares}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[#00e0b8] font-bold">{row.sentiment}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-[#00e0b8] font-sans text-[11px]">
                    {row.feedbackSeed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
