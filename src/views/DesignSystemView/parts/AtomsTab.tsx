/**
 * file: src/views/DesignSystemView/parts/AtomsTab.tsx
 * description: YYC³ 功能视图 — DesignSystemView 通用原子与交互组件页签
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
 * brief: DesignSystemView TAB 2 —— 按钮体系 / 表单控件 / 状态徽标 / 登录组件与六步闭环审核展示，
 *        逐字搬移自原 DesignSystemView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: AtomsTabProps, AtomsTab
 */
import { Sparkles } from "lucide-react";
import React from "react";
import { Badge, Button, Card, Input, Select, Slider, Switch } from "../../../components/common";

export interface AtomsTabProps {
  input: string;
  onInputChange: (value: string) => void;
  inputError: string;
  onInputErrorChange: (value: string) => void;
  select: string;
  onSelectChange: (value: string) => void;
  slider: number;
  onSliderChange: (value: number) => void;
  switch1: boolean;
  onSwitch1Change: (value: boolean) => void;
  switch2: boolean;
  onSwitch2Change: (value: boolean) => void;
  btnLoading: boolean;
  onBtnLoadingChange: (value: boolean) => void;
  onOpenModal: () => void;
  onOpenDrawer: () => void;
  onOpenLogin?: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const AtomsTab: React.FC<AtomsTabProps> = ({
  input,
  onInputChange,
  inputError,
  onInputErrorChange,
  select,
  onSelectChange,
  slider,
  onSliderChange,
  switch1,
  onSwitch1Change,
  switch2,
  onSwitch2Change,
  btnLoading,
  onBtnLoadingChange,
  onOpenModal,
  onOpenDrawer,
  onOpenLogin,
  onShowToast,
}) => {
  return (
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
              loading={btnLoading}
              onClick={() => {
                onBtnLoadingChange(true);
                setTimeout(() => onBtnLoadingChange(false), 2000);
              }}
            >
              {btnLoading ? "处理中..." : "点击触发 Loading"}
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
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            mono
          />

          <Input
            label="带错误校验输入框 (Input with Error)"
            value={inputError}
            onChange={(e) => {
              onInputErrorChange(e.target.value);
            }}
            error={inputError.length < 5 ? "提示词字符数不能低于 5 个字符" : undefined}
            placeholder="输入少于5个字符测试错误态..."
          />

          <Select
            label="数字人驱动模式 (Inference Mode)"
            hint="Ref2VA 或 FL2VA"
            value={select}
            onChange={(e) => onSelectChange(e.target.value)}
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
            value={slider}
            onChange={onSliderChange}
          />

          <div className="space-y-3 pt-2">
            <Switch
              checked={switch1}
              onChange={onSwitch1Change}
              label="启用 FP8 激活值极致缓存"
              description="节省 4.2GB 显存，大幅提升推理帧率"
            />
            <Switch
              checked={switch2}
              onChange={onSwitch2Change}
              label="启用 SyncNet 实时逐帧多进程打分"
              description="生成完毕自动触发 5 维雷达图"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#8b949e]">
              弹窗与抽屉容器触发 (Containers)
            </label>
            <div className="flex items-center gap-3 pt-1">
              <Button variant="secondary" size="sm" onClick={onOpenModal}>
                打开模态框 (Modal)
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenDrawer}>
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
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
