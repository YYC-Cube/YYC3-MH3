/**
 * file: src/views/DesignSystemView/parts/PromptsTab.tsx
 * description: YYC³ 功能视图 — DesignSystemView 分场景 AI 设计提示词库页签
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[designsystem],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: DesignSystemView TAB 4 —— 全局设计系统 / 总览驾驶舱 / 流水线工作台 / 系统运维监控
 *        四类高保真提示词卡片与一键复制，逐字搬移自原 DesignSystemView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: PromptsTabProps, PromptsTab
 */
import { Code2, Copy } from "lucide-react";
import React from "react";
import { Badge, Button } from "../../../components/common";

export interface PromptsTabProps {
  onCopyPrompt: (title: string, text: string) => void;
}

export const PromptsTab: React.FC<PromptsTabProps> = ({ onCopyPrompt }) => {
  return (
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
              <span className="text-xs font-bold text-[#00d4aa]">1. 全局设计系统生成提示词</span>
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
              onCopyPrompt(
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
              <span className="text-xs font-bold text-[#00b4d8]">2. 总览驾驶舱高保真提示词</span>
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
              onCopyPrompt(
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
              <span className="text-xs font-bold text-[#00d4aa]">3. 流水线工作台高保真提示词</span>
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
              onCopyPrompt(
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
              <span className="text-xs font-bold text-[#EE4C2C]">4. 系统运维监控高保真提示词</span>
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
              onCopyPrompt(
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
