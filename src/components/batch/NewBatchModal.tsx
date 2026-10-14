/**
 * file: src/components/batch/NewBatchModal.tsx
 * description: YYC³ 批次组件 — 新建生产批次弹窗（表单态自持，草案提交由 App 编排）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[batch],[modal]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 新建批次弹窗 — 表单草稿常驻本组件（关闭弹层不重置草稿，与历史行为一致）
 *
 * dependencies: react, ../common, ../../types
 * exports: NewBatchModalProps, NewBatchModal
 */
import { useState } from "react"
import { Button, Input, Modal, Select } from "../common"
import { BatchMode, NewBatchDraft } from "../../types"

/** Select 下拉值为运行时 string，收窄至 BatchMode 联合的类型守卫 */
const isBatchMode = (v: string): v is BatchMode =>
  v === "Ref2VA" || v === "FL2VA"

export interface NewBatchModalProps {
  isOpen: boolean
  onClose: () => void
  /** 提交草案（创建/导航/通知编排由 App 完成） */
  onSubmit: (draft: NewBatchDraft) => void
}

/** 新建生产批次弹窗（组件常驻挂载，仅弹层随 isOpen 显隐） */
export function NewBatchModal({ isOpen, onClose, onSubmit }: NewBatchModalProps) {
  const [name, setName] = useState("企业定制发言-科技合伙人数字人")
  const [mode, setMode] = useState<BatchMode>("Ref2VA")
  const [seed, setSeed] = useState(48920194)
  const [prompt, setPrompt] = useState(
    "Professional corporate spokesperson speaking confidently, natural micro-smile, 4k ultra-detailed face skin pores",
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="创建新数字人生产批次"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSubmit({ name, mode, seed, prompt })}
          >
            创建并立即启动五步流水线
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <Input
          label="批次任务名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="驱动模式"
            value={mode}
            onChange={(e) => {
              const v = e.target.value
              if (isBatchMode(v)) setMode(v)
            }}
            options={[
              { value: "Ref2VA", label: "Ref2VA (单参考人脸对齐)" },
              { value: "FL2VA", label: "FL2VA (关键帧长镜头)" },
            ]}
          />
          <Input
            label="Seed 种子号"
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            mono
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#8a97a8]">
            提示词描述 (Prompt)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-lg bg-[#15294a] border border-[#1e2f47] text-xs text-[#e8f0f8] focus:outline-none focus:border-[#00e0b8]"
          />
        </div>
      </div>
    </Modal>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
