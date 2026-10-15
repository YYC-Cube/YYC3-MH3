/**
 * file: src/data/design.ts
 * description: 领域演示快照 · 设计系统（色板 / 字阶）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [data],[mock],[design]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 设计系统展示页演示快照（深空主题色板与字阶规范）
 *
 * dependencies: —
 * exports: DESIGN_SYSTEM_COLORS, DESIGN_SYSTEM_TYPOGRAPHY
 */

export const DESIGN_SYSTEM_COLORS = [
  {
    name: "一级背景 (Base BG)",
    hex: "#0a1628",
    role: "页面全局底色，极微弱上下渐变至 #071222，沉浸式深藏青科技质感",
    sample: "bg-[#0a1628]",
  },
  {
    name: "二级背景 (Panel BG)",
    hex: "#0f1f38",
    role: "卡片、主面板、侧边栏底色，微玻璃拟态载体，8px圆角",
    sample: "bg-[#0f1f38]",
  },
  {
    name: "三级背景 (Input BG)",
    hex: "#15294a",
    role: "输入框、表头、下拉列表、弹窗高亮层底色",
    sample: "bg-[#15294a]",
  },
  {
    name: "品牌主色 (Brand Cyan)",
    hex: "#00e0b8",
    role: "主操作按钮、高频激活态、成功状态、进度流光、高亮边框",
    sample: "bg-[#00e0b8]",
  },
  {
    name: "信息辅助色 (Info Blue)",
    hex: "#00b4d8",
    role: "超链接、次要指标、辅助线、通知提示",
    sample: "bg-[#00b4d8]",
  },
  {
    name: "流程辅助色 (Process Purple)",
    hex: "#9d7cd8",
    role: "流水线节点、分类标签、次级维度标识、变异参数",
    sample: "bg-[#9d7cd8]",
  },
  {
    name: "警示橙红 (Alert Orange)",
    hex: "#ff7a45",
    role: "错误告警、终止按钮、超标显存、质检失败维度",
    sample: "bg-[#ff7a45]",
  },
  {
    name: "注意色 (Caution Yellow)",
    hex: "#ffb830",
    role: "排队队列中、资源警戒线、轻微抖动提示",
    sample: "bg-[#ffb830]",
  },
  {
    name: "一级文字 (Text Primary)",
    hex: "#e8f0f8",
    role: "页面大标题、核心数据数值、高对比正文",
    sample: "text-[#e8f0f8]",
  },
  {
    name: "二级文字 (Text Secondary)",
    hex: "#8a97a8",
    role: "辅助说明文字、次级标签、字段 Label",
    sample: "text-[#8a97a8]",
  },
  {
    name: "三级文字 (Text Tertiary)",
    hex: "#5c697a",
    role: "占位符 Placeholder、已失效记录、微注脚",
    sample: "text-[#5c697a]",
  },
  {
    name: "边框分割线 (Border)",
    hex: "#1e2f47",
    role: "卡片边界线、表格分割线、面板极细描边",
    sample: "border-[#1e2f47]",
  },
];

export const DESIGN_SYSTEM_TYPOGRAPHY = [
  {
    level: "页面大标题 (Page Title)",
    size: "24px",
    weight: "600 SemiBold",
    font: "Inter / 思源黑体",
    sample: "MiniMax-H3 本地数字人生产线",
  },
  {
    level: "模块卡片标题 (Section Title)",
    size: "20px",
    weight: "600 SemiBold",
    font: "Inter / 思源黑体",
    sample: "五阶段生产流水线状态",
  },
  {
    level: "次级标题 / 字段组 (Subhead)",
    size: "16px",
    weight: "500 Medium",
    font: "Inter / 思源黑体",
    sample: "DiffSynth 扩散采样参数配置",
  },
  {
    level: "正文默认文字 (Body Text)",
    size: "14px",
    weight: "400 Regular",
    font: "Inter / 思源黑体",
    sample: "当前批次正在执行 SyncNet 音素唇形对齐与多模态表情精评。",
  },
  {
    level: "辅助说明 / 标签 (Caption)",
    size: "12px",
    weight: "400 Regular",
    font: "Inter / 思源黑体",
    sample: "建议显存保留缓冲 ≥ 2.5 GB · 快捷键 Ctrl+Enter 快速启动",
  },
  {
    level: "终端代码 / 数值 (Code & Mono)",
    size: "13px",
    weight: "500 Mono",
    font: "JetBrains Mono",
    sample: "2025-04-12T10:24:18.102Z [INFO] VRAM: 19.4GB / 24.0GB · Score: 94.6",
  },
];

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
