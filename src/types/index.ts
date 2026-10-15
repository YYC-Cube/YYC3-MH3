/**
 * file: src/types/index.ts
 * description: 全局类型唯一来源 · 领域模型与 UI 契约
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [type],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 全局类型唯一来源 · 领域模型与 UI 契约
 *
 * dependencies: —
 * exports: NavTabId, PipelineStageKey, PipelineStage, BatchStatus, BatchMode
 */
// MiniMax-H3 Local AI Digital Human Production Line Type Definitions - v2.1 PRO

export type NavTabId =
  | "design-system"
  | "dashboard"
  | "workbench"
  | "batch-detail"
  | "seed"
  | "prompt"
  | "models"
  | "agent"
  | "platform"
  | "ops"
  | "nightly"
  | "docs"
  | "settings";

/**
 * 全局导航扩展参数：跨视图跳转时携带目标定位 ID。
 * 消费方：App.handleNavigate（当前收敛 batchId，seedId/docId 由后续视图选中逻辑消费）。
 */
export interface NavigateExtra {
  batchId?: string;
  seedId?: string;
  docId?: string;
}

export type PipelineStageKey = "generation" | "scoring" | "fine_eval" | "analysis" | "seed_iter";

export interface PipelineStage {
  id: PipelineStageKey;
  label: string;
  subLabel: string;
  status: "idle" | "running" | "completed" | "failed" | "warning";
  progress: number; // 0 - 100
  durationSec?: number;
  metric?: string;
  errorMsg?: string;
}

export type BatchStatus = "running" | "completed" | "failed" | "queued" | "paused";
export type BatchMode = "Ref2VA" | "FL2VA";

export interface KeyframePreview {
  frameNumber: number;
  timeSec: number;
  thumbnail: string;
  lipScore: number;
  expressionScore: number;
  anomaly?: string;
}

export interface BatchItem {
  id: string;
  name: string;
  mode: BatchMode;
  seed: number;
  prompt: string;
  negativePrompt?: string;
  status: BatchStatus;
  progress: number;
  currentStage: PipelineStageKey;
  startTime: string;
  duration: string;
  score: number; // 0 - 100
  lipSyncScore: number;
  expressionScore: number;
  stabilityScore: number;
  coherenceScore: number;
  fidelityScore: number;
  resolution: string;
  fps: number;
  vramUsageGb: number;
  previewThumbnail: string;
  outputVideoUrl?: string;
  tags: string[];
  keyframes?: KeyframePreview[];
  anomalies?: {
    frame: number;
    issue: string;
    severity: "low" | "medium" | "high";
    fixed: boolean;
  }[];
}

export interface SeedItem {
  id: string;
  seedNumber: number;
  name: string;
  tier: "S" | "A" | "B" | "Experimental";
  avgScore: number;
  generationCount: number;
  lastUsed: string;
  tags: string[];
  recommendedModel: string;
  version?: string;
  history?: {
    version: string;
    date: string;
    score: number;
    changeNote: string;
  }[];
  params: {
    guidanceScale: number;
    steps: number;
    denoiseStrength: number;
    motionScale: number;
    cfgLipSync: number;
  };
  notes: string;
  isFavorite: boolean;
}

export interface ParameterTemplate {
  id: string;
  name: string;
  mode: BatchMode;
  steps: number;
  guidanceScale: number;
  denoiseStrength: number;
  resolution: string;
  fps: number;
  fp8: boolean;
  desc: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  stage: string;
  message: string;
  suggestion?: string;
  actionable?: {
    actionLabel: string;
    actionType: string;
  };
}

/** AgentNode.config 展示键值对（消费点仅 Object.entries 渲染 String(v)，值域锁定原始类型防类型后门） */
export type AgentNodeConfig = Record<string, string | number | boolean>;

export interface AgentNode {
  id: string;
  label: string;
  role: string;
  roleColor: string;
  memberId: string; // aligned with YYC3Member id (yanqi, yushu, etc.)
  type:
    | "script"
    | "storyboard"
    | "voice"
    | "diffsynth"
    | "quality"
    | "predict"
    | "recommend"
    | "security";
  x: number;
  y: number;
  status: "idle" | "active" | "success" | "error";
  inputs: string[];
  outputs: string[];
  config: AgentNodeConfig;
}

export interface OpsMetric {
  time: string;
  gpuVram: number; // GB
  gpuUtil: number; // %
  cpuUtil: number; // %
  memUtil: number; // GB
  diskIops: number; // MB/s
  temp: number; // deg C
}

export interface ServiceStatus {
  name: string;
  serviceId: string;
  port?: number;
  status: "online" | "warning" | "offline";
  uptime: string;
  pids: number;
  memory: string;
  stabilityHistory?: number[]; // last 7 days stability %
}

export interface AlarmItem {
  id: string;
  level: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  recommendation: string;
  actionLabel?: string;
}

export interface NotificationItem {
  id: string;
  type: "alarm" | "completed" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetTab?: NavTabId;
  targetId?: string;
}

// YYC3 AI Family Member Specification
export interface YYC3Member {
  id: string;
  name: string;
  metaName: string;
  clockPosition: string; // e.g. "12:00", "06:00"
  angle: number; // 0 - 360 deg
  roleColor: string;
  iconType: "speech" | "brain" | "eye" | "star" | "tree" | "shield" | "balance" | "lightbulb";
  quote: string;
  roleDefinition: string;
  responsibilities: string[];
  capabilities: string[];
  metrics: {
    todayTasks: number;
    avgLatencyMs: number;
    accuracyRate: number;
    collabCalls: number;
  };
  isOnline: boolean;
  isSpeaking: boolean;
}

// Platform Management Types
export type SocialPlatformKey =
  | "douyin"
  | "channels"
  | "bilibili"
  | "kuaishou"
  | "redbook"
  | "nas"
  | "cloud";

export interface PushTaskItem {
  id: string;
  title: string;
  batchId: string;
  platforms: SocialPlatformKey[];
  status: "queued" | "transferring" | "completed" | "failed";
  progress: number;
  speed: string;
  estRemaining: string;
  targetAccount: string;
  scheduledTime?: string;
  retryCount: number;
}

export interface MediaClipItem {
  id: string;
  name: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  resolution: string;
  aspectRatio: string;
  audioAligned: boolean;
}

/** 登录角色（LoginView 角色选择器与 AuthUser.role 的单一事实来源） */
export type UserRole = "admin" | "operator" | "guest";

/** 认证模式：本地离线 / 团队协同 */
export type AuthMode = "local" | "team";

export interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
  mode: AuthMode;
  lastLogin: string;
  avatar?: string;
  token: string;
  permissions: string[];
  ipAddress?: string;
  device?: string;
}

export interface GpuSlot {
  id: string;
  cudaDevice: string;
  name: string;
  totalVramGb: number;
  usedVramGb: number;
  status: "active" | "idle" | "throttled";
  assignedBatchId?: string;
  temperature: number;
  utilization: number;
}

export interface PhonemeLanguage {
  code: string;
  name: string;
  phonemeCount: number;
  accuracy: number;
  status: "ready" | "downloading" | "optimized";
  sampleRate: string;
}

export interface PlatformWebhookReceipt {
  id: string;
  platform: SocialPlatformKey;
  targetAccount: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  conversionRate: string;
  lastSyncTime: string;
  sentimentScore: number;
}

/** 新建批次表单草案（NewBatchModal → App → domains/batch.createBatchItem） */
export interface NewBatchDraft {
  name: string;
  mode: BatchMode;
  seed: number;
  prompt: string;
}

/** Toast 通知级别 */
export type ToastType = "success" | "error" | "warning" | "info";

/** 全局 Toast 触发契约（useToast 产出，视图 onShowToast 统一签名） */
export type ShowToast = (type: ToastType, message: string, subMessage?: string) => void;

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
