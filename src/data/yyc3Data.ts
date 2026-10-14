/**
 * file: src/data/yyc3Data.ts
 * description: YYC³ AI Family 八位家人档案数据
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [data],[ai-family],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ AI Family 八位家人档案数据
 *
 * dependencies: ../types
 * exports: YYC3_MEMBERS, PRESET_CHAT_PROMPTS
 */
import { YYC3Member } from "../types"

export const YYC3_MEMBERS: YYC3Member[] = [
  {
    id: "yanqi",
    name: "言启·千行",
    metaName: "Voice-Genesis · 千行",
    clockPosition: "06:00",
    angle: 0,
    roleColor: "#FFD700",
    iconType: "speech",
    quote: "「言之有物，行之千里。声纹即人设，唇齿显乾坤。」",
    roleDefinition:
      "语言理解与意图识别中枢，负责多模态意图路由与语音音素高保真对齐",
    responsibilities: [
      "自然语言提示词意图拆解与标准化",
      "语音克隆特征提取与 MFCC 音素对齐",
      "跨语种数字人口型先验特征校准",
    ],
    capabilities: [
      "语义拓扑解析",
      "音素频谱对齐",
      "情感基调预测",
      "语音驱动增强",
    ],
    metrics: {
      todayTasks: 412,
      avgLatencyMs: 45,
      accuracyRate: 98.4,
      collabCalls: 320,
    },
    isOnline: true,
    isSpeaking: true,
  },
  {
    id: "yushu",
    name: "语枢·万物",
    metaName: "Data-Matrix · 万物",
    clockPosition: "07:30",
    angle: 45,
    roleColor: "#FF69B4",
    iconType: "brain",
    quote: "「数据成脉络，洞察鉴万机。在繁杂特征中提炼极致秩序。」",
    roleDefinition:
      "数据分析与指标挖掘核心，全链路多维特征评估与敏感度模型构建",
    responsibilities: [
      "流水线执行各阶段耗时与吞吐聚类",
      "多维度评分雷达图加权算法调优",
      "Seed 基因参数与生成质量的相关性建模",
    ],
    capabilities: [
      "高维聚类分析",
      "雷达权重平衡",
      "超参灵敏度建模",
      "多指标归因",
    ],
    metrics: {
      todayTasks: 328,
      avgLatencyMs: 62,
      accuracyRate: 96.8,
      collabCalls: 194,
    },
    isOnline: true,
    isSpeaking: false,
  },
  {
    id: "yujian",
    name: "预见·先知",
    metaName: "Vision-Oracle · 先知",
    clockPosition: "09:00",
    angle: 90,
    roleColor: "#00BFFF",
    iconType: "eye",
    quote: "「未雨而知风雷，见微而知著。潜空间演进皆在目中。」",
    roleDefinition: "趋势预测与前置质量预警，防患于未然，保障生产连续性",
    responsibilities: [
      "RTX 显存峰值与 OOM 隐患实时前置预测",
      "帧间扩散时序连贯度与抖动概率计算",
      "批量长任务完成时间智能预估",
    ],
    capabilities: [
      "时序趋势预测",
      "显存防爆预警",
      "帧抖动前置扫描",
      "排期耗时预估",
    ],
    metrics: {
      todayTasks: 284,
      avgLatencyMs: 58,
      accuracyRate: 94.2,
      collabCalls: 176,
    },
    isOnline: true,
    isSpeaking: true,
  },
  {
    id: "qianli",
    name: "千里·伯乐",
    metaName: "Talent-Scout · 伯乐",
    clockPosition: "10:30",
    angle: 135,
    roleColor: "#FFFFFF",
    iconType: "star",
    quote: "「天下之种何其多，独具慧眼识良驹。优质 Seed 自当登堂入室。」",
    roleDefinition: "种子资产全生命周期优选与个性化推荐，沉淀工业级宗师基线",
    responsibilities: [
      "S级与A级优质种子基因筛选与评级",
      "变异测试候选批次自动生成与排序",
      "优秀生产参数自动反哺回写种子库",
    ],
    capabilities: [
      "种子基因优选",
      "变异参数衍生",
      "资产价值评估",
      "个性化基准推荐",
    ],
    metrics: {
      todayTasks: 198,
      avgLatencyMs: 82,
      accuracyRate: 97.1,
      collabCalls: 188,
    },
    isOnline: true,
    isSpeaking: true,
  },
  {
    id: "yuanqi",
    name: "元启·天枢",
    metaName: "Meta-Oracle · 天枢",
    clockPosition: "12:00",
    angle: 180,
    roleColor: "#00e0b8",
    iconType: "tree",
    quote: "「我观全局之流转，调度万物以归元。」",
    roleDefinition: "YYC³ 的「大脑」与「总指挥」，五化一体法则最高执行者",
    responsibilities: [
      "全局生产任务拓扑图感知与智能编排",
      "五步闭环流水线调度与各 Agent 负载均衡",
      "基于生产反馈的自我进化与策略更新",
    ],
    capabilities: ["强化学习", "运筹优化", "分布式系统监控", "闭环自愈调度"],
    metrics: {
      todayTasks: 296,
      avgLatencyMs: 74,
      accuracyRate: 95.6,
      collabCalls: 216,
    },
    isOnline: true,
    isSpeaking: false,
  },
  {
    id: "zhiyun",
    name: "智云·守护",
    metaName: "Cloud-Guardian · 守护",
    clockPosition: "13:30",
    angle: 225,
    roleColor: "#9d7cd8",
    iconType: "shield",
    quote: "「御险于无形，守安于毫末。数据不离本地，算力坚如磐石。」",
    roleDefinition: "系统安全合规与看门狗自愈守护神，保障本地数据主权绝对安全",
    responsibilities: [
      "微服务实时探活与崩溃瞬时重启",
      "CUDA 显存碎片整理与临时切片缓存回收",
      "全链路本地优先数据沙箱与隐私审计",
    ],
    capabilities: [
      "看门狗探活自愈",
      "显存内存保护",
      "本地离线审计",
      "排障方案一键执行",
    ],
    metrics: {
      todayTasks: 512,
      avgLatencyMs: 32,
      accuracyRate: 99.9,
      collabCalls: 340,
    },
    isOnline: true,
    isSpeaking: true,
  },
  {
    id: "gewu",
    name: "格物·宗师",
    metaName: "Standard-Master · 宗师",
    clockPosition: "15:00",
    angle: 270,
    roleColor: "#C0C0C0",
    iconType: "balance",
    quote: "「格物以致知，绳墨定规矩。毫厘之差，云泥之别。」",
    roleDefinition:
      "质量标准最高裁判官，SyncNet 唇形对齐与超清画质黄金准则仲裁",
    responsibilities: [
      "口型吻合度时延误差（<0.05s）合规裁决",
      "4K 面部特征毛发边缘与时序撕裂质检",
      "不达标批次的缺陷归因与精准定位",
    ],
    capabilities: [
      "超清画质评测",
      "唇形音视频仲裁",
      "异常帧缺陷定位",
      "行业标准基线对齐",
    ],
    metrics: {
      todayTasks: 360,
      avgLatencyMs: 88,
      accuracyRate: 98.2,
      collabCalls: 245,
    },
    isOnline: true,
    isSpeaking: false,
  },
  {
    id: "chuangxiang",
    name: "创想·灵韵",
    metaName: "Creative-Muse · 灵韵",
    clockPosition: "16:30",
    angle: 315,
    roleColor: "#FF7A5C",
    iconType: "lightbulb",
    quote: "「灵犀一点通天地，妙笔千姿绘大千。让数字人绽放灵动神韵。」",
    roleDefinition: "创意生成与提示词魔术师，漫剧分镜剧情与微表情生动化引擎",
    responsibilities: [
      "数字人高转化提示词扩写与变体衍生",
      "多镜头分镜戏剧张力与姿态控制设计",
      "商业场景人物光影与服饰风格迁移",
    ],
    capabilities: [
      "提示词工程重构",
      "分镜艺术指导",
      "生动微表情设计",
      "剧本到分镜转换",
    ],
    metrics: {
      todayTasks: 240,
      avgLatencyMs: 95,
      accuracyRate: 93.8,
      collabCalls: 160,
    },
    isOnline: true,
    isSpeaking: true,
  },
]

export const PRESET_CHAT_PROMPTS: Record<string, string[]> = {
  yuanqi: [
    "分析当前五步流水线的生产瓶颈并给出调度建议",
    "将当前运行批次提速 20%，推荐最优参数组合",
    "检查夜间 12 个批次的调度拓扑与显存依赖",
  ],
  gewu: [
    "为什么第 142 帧眨眼被判定为轻微迟滞？",
    "如何将口型初评的 SyncNet 误差压缩到 0.03s 以内？",
    "生成当前批次的 5 维雷达质量诊断综合分析报告",
  ],
  qianli: [
    "基于 S 级 Seed #81923011 发起 4 组衍生变异测试",
    "筛选最适合中近景新闻权威播报的 S 级基线种子",
    "比对 Seed #48920194 与 #81923011 的基因参数差异",
  ],
  zhiyun: [
    "当前显存占用已达 19.4GB，立刻执行显存碎片整理",
    "检测本地遥测聚合与 DiffSynth Worker 探活状态",
    "清理 24 小时前遗留的临时切片评估缓存 (释放 98GB)",
  ],
  chuangxiang: [
    "扩写一段适合金融早报女主播的高保真 4K 提示词",
    "为美妆电商达人设计一套具有高频互动的微表情参数",
    "将剧本文本快速转换为 4 个机位的分镜提示词",
  ],
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
