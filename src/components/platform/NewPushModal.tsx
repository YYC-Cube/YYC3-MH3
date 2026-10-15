/**
 * file: src/components/platform/NewPushModal.tsx
 * description: YYC³ 平台组件 — 新建多平台分发推送作业弹窗
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[platform],[modal]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 新建推送弹窗 — 平台多选状态经 props 注入（存视图层，跨弹窗开关持久）
 *
 * dependencies: react, lucide-react, ../common, ../../types
 * exports: NewPushModalProps, NewPushModal
 */
import { Check } from "lucide-react";
import { Button, Input, Modal } from "../common";
import { SocialPlatformKey } from "../../types";

/** 可选分发平台清单（展示名） */
const PUSH_PLATFORM_OPTIONS: { id: SocialPlatformKey; name: string }[] = [
  { id: "douyin", name: "抖音 (短视频/带货)" },
  { id: "channels", name: "微信视频号 (公私域)" },
  { id: "bilibili", name: "B站 (长视频/高画质)" },
  { id: "kuaishou", name: "快手 (高频短视频)" },
  { id: "redbook", name: "小红书 (美妆/穿搭)" },
  { id: "nas", name: "本地 NAS 4K 归档" },
];

export interface NewPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlatforms: SocialPlatformKey[];
  onTogglePlatform: (p: SocialPlatformKey) => void;
  /** 确认分发（任务创建/关闭弹窗/通知编排由视图层完成） */
  onConfirm: () => void;
}

/** 新建多平台矩阵分发推送作业弹窗（组件常驻挂载，仅弹层随 isOpen 显隐） */
export function NewPushModal({
  isOpen,
  onClose,
  selectedPlatforms,
  onTogglePlatform,
  onConfirm,
}: NewPushModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="新建多平台矩阵分发推送作业"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            确认并立即分发
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-medium text-[#8a97a8] mb-1.5">
            目标分发平台与渠道（支持多选）
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PUSH_PLATFORM_OPTIONS.map((plat) => {
              const isSelected = selectedPlatforms.includes(plat.id);
              return (
                <button
                  key={plat.id}
                  onClick={() => onTogglePlatform(plat.id)}
                  className={`p-2 rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#00e0b8]/15 border-[#00e0b8] text-[#00e0b8] font-semibold"
                      : "bg-[#15294a] border-[#1e2f47] text-[#8a97a8]"
                  }`}
                >
                  <span>{plat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        <Input label="目标发布账号认证矩阵" value="@企业级官方认证号群组" readOnly />
      </div>
    </Modal>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
