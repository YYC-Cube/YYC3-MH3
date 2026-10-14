/**
 * file: src/views/PlatformManagementView.tsx
 * description: YYC³ 功能视图 — 平台管理中心（四模块编排壳，区块组件化于 components/platform/）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-11
 * updated: 2026-10-12
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 平台管理中心 — 模块页签路由 + 状态持有（跨页签持久），展示下沉 platform/ 组件
 *
 * dependencies: react, lucide-react, ../components/common, ../components/platform/*, ../types
 * exports: PlatformManagementViewProps, PlatformManagementView
 */
import { FileSpreadsheet, Send } from "lucide-react"
import { useState, type FC } from "react"
import { Button, Modal } from "../components/common"
import { AnalyticsModule } from "../components/platform/AnalyticsModule"
import { ConfigModule } from "../components/platform/ConfigModule"
import { DispatchModule } from "../components/platform/DispatchModule"
import { MediaModule } from "../components/platform/MediaModule"
import { NewPushModal } from "../components/platform/NewPushModal"
import {
  MediaClipItem,
  NavTabId,
  NavigateExtra,
  PushTaskItem,
  ShowToast,
  SocialPlatformKey,
} from "../types"

/** 平台管理子模块页签 ID */
export type PlatformModule = "dispatch" | "media" | "analytics" | "config"

const MODULE_TABS: { id: PlatformModule; label: string }[] = [
  { id: "dispatch", label: "1. 生产调度台 (Task Dispatch & Push)" },
  { id: "media", label: "2. 媒体处理中心 (Media Timeline Studio)" },
  { id: "analytics", label: "3. 数据分析中心 (Data Analytics BI)" },
  { id: "config", label: "4. 系统配置管理 (System Config & Audits)" },
]

/** 推送任务演示快照（状态种子 — 存视图层，模块切换不重置） */
const INITIAL_PUSH_TASKS: PushTaskItem[] = [
  {
    id: "PUSH-20250412-01",
    title: "科技早报·AI创新周刊首期 4K",
    batchId: "BATCH-20250412-088",
    platforms: ["douyin", "channels", "bilibili", "nas"],
    status: "transferring",
    progress: 68,
    speed: "48.2 MB/s",
    estRemaining: "01:24",
    targetAccount: "@智见科技官方号",
    retryCount: 0,
  },
  {
    id: "PUSH-20250412-02",
    title: "金融快讯·早间汇市播报 1080P",
    batchId: "BATCH-20250412-089",
    platforms: ["channels", "redbook", "cloud"],
    status: "completed",
    progress: 100,
    speed: "54.0 MB/s",
    estRemaining: "00:00",
    targetAccount: "@财智领袖频道",
    retryCount: 0,
  },
  {
    id: "PUSH-20250412-03",
    title: "美妆达人新品测试短视频 60FPS",
    batchId: "BATCH-20250412-087",
    platforms: ["kuaishou", "douyin"],
    status: "queued",
    progress: 0,
    speed: "--",
    estRemaining: "排队中",
    targetAccount: "@美妆灵动官",
    retryCount: 0,
  },
]

/** 媒体片段演示快照（状态种子 — 存视图层，模块切换不重置） */
const INITIAL_CLIPS: MediaClipItem[] = [
  {
    id: "clip-1",
    name: "片段01·开场白与问候 (特写)",
    startSec: 0,
    endSec: 3.5,
    durationSec: 3.5,
    resolution: "1080x1920",
    aspectRatio: "9:16",
    audioAligned: true,
  },
  {
    id: "clip-2",
    name: "片段02·核心行业数据剖析 (中景)",
    startSec: 3.5,
    endSec: 7.8,
    durationSec: 4.3,
    resolution: "1080x1920",
    aspectRatio: "9:16",
    audioAligned: true,
  },
  {
    id: "clip-3",
    name: "片段03·结语倡议与互动 (全景)",
    startSec: 7.8,
    endSec: 10.0,
    durationSec: 2.2,
    resolution: "1080x1920",
    aspectRatio: "9:16",
    audioAligned: true,
  },
]

export interface PlatformManagementViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void
  onShowToast: ShowToast
}

export const PlatformManagementView: FC<PlatformManagementViewProps> = ({
  onShowToast,
}) => {
  const [activeModule, setActiveModule] = useState<PlatformModule>("dispatch")

  // Push Tasks（视图层持有 — 模块切换保持状态，与拆分前行为一致）
  const [pushTasks, setPushTasks] = useState<PushTaskItem[]>(INITIAL_PUSH_TASKS)

  // Media Clips（视图层持有 — 模块切换保持状态）
  const [clips] = useState<MediaClipItem[]>(INITIAL_CLIPS)
  const [activeClipId, setActiveClipId] = useState("clip-1")
  const [timelinePlayHead] = useState(4.2)

  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false)

  // New Push Job Modal（状态存视图层：头部与调度台双入口触发）
  const [isNewPushModalOpen, setIsNewPushModalOpen] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    SocialPlatformKey[]
  >(["douyin", "channels", "nas"])

  const togglePlatform = (p: SocialPlatformKey) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  const handleStartPush = () => {
    const newTask: PushTaskItem = {
      id: `PUSH-${Date.now().toString().slice(-6)}`,
      title: "手动分发任务·多平台矩阵",
      batchId: "BATCH-20250412-089",
      platforms: selectedPlatforms,
      status: "transferring",
      progress: 15,
      speed: "42.5 MB/s",
      estRemaining: "02:10",
      targetAccount: "@矩阵认证主理人",
      retryCount: 0,
    }
    setPushTasks((prev) => [newTask, ...prev])
    setIsNewPushModalOpen(false)
    onShowToast(
      "success",
      "已启动多平台一键分发任务",
      "推送任务已入本地队列异步执行（演示，无外部出站）",
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628]">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2f47]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#e8f0f8]">
              平台管理中心 · Platform Hub
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono">
              生产-编排-运维-管理-分析 全闭环
            </span>
          </div>
          <p className="text-xs text-[#8a97a8] mt-1">
            覆盖多平台分发矩阵、媒体后期多轨剪辑、全量生产大数据效能与系统全局配置
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-[#00e0b8]" />}
            onClick={() => setIsExportReportModalOpen(true)}
          >
            导出全景分析报表
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
            onClick={() => setIsNewPushModalOpen(true)}
          >
            + 发起一键推送分发
          </Button>
        </div>
      </div>

      {/* 4 Core Module Navigation Tabs */}
      <div className="border-b border-[#1e2f47] flex gap-8 text-xs select-none">
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveModule(tab.id)}
            className={`pb-3 font-medium transition-colors cursor-pointer relative ${activeModule === tab.id
              ? "text-[#00e0b8] font-semibold text-sm"
              : "text-[#8a97a8] hover:text-[#e8f0f8]"
              }`}
          >
            {tab.label}
            {activeModule === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00e0b8] shadow-[0_0_8px_rgba(0,224,184,0.6)]" />
            )}
          </button>
        ))}
      </div>

      {/* Module Router（展示下沉 components/platform/，状态全部留在本视图层） */}
      {activeModule === "dispatch" && (
        <DispatchModule
          pushTasks={pushTasks}
          onNewPushClick={() => setIsNewPushModalOpen(true)}
          onShowToast={onShowToast}
        />
      )}
      {activeModule === "media" && (
        <MediaModule
          clips={clips}
          activeClipId={activeClipId}
          onSelectClip={setActiveClipId}
          playhead={timelinePlayHead}
          onShowToast={onShowToast}
        />
      )}
      {activeModule === "analytics" && (
        <AnalyticsModule onShowToast={onShowToast} />
      )}
      {activeModule === "config" && <ConfigModule onShowToast={onShowToast} />}

      {/* New Push Job Modal */}
      <NewPushModal
        isOpen={isNewPushModalOpen}
        onClose={() => setIsNewPushModalOpen(false)}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={togglePlatform}
        onConfirm={handleStartPush}
      />

      {/* Export Report Modal */}
      <Modal
        isOpen={isExportReportModalOpen}
        onClose={() => setIsExportReportModalOpen(false)}
        title="导出全景生产运营与能效报表"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsExportReportModalOpen(false)
              onShowToast("success", "报表生成成功，已保存至本地")
            }}
          >
            下载报表包 (Excel + PDF)
          </Button>
        }
      >
        <p className="text-xs text-[#8a97a8]">
          包含生产效能、多平台分发回执、算力成本核算与 Seed 演进全量数据分析。
        </p>
      </Modal>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
