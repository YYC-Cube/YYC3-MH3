/**
 * file: src/components/yyc3/YYC3FamilyModal.tsx
 * description: YYC³ AI Family 协同组件 — YYC3FamilyModal
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[ai-family],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ AI Family 协同组件 — YYC3FamilyModal
 *
 * dependencies: react, ../../types, ../../data/yyc3Data, lucide-react
 * exports: YYC3FamilyModalProps, YYC3FamilyModal
 */
import {
  Brain,
  CheckCircle2,
  Clock,
  Ear,
  Eye,
  GitBranch,
  Lightbulb,
  Maximize2,
  MessageSquare,
  Minimize2,
  Scale,
  Send,
  Shield,
  Sparkles,
  Star,
  X,
  Zap
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { PRESET_CHAT_PROMPTS, YYC3_MEMBERS } from "../../data/yyc3Data"
import { YYC3Member } from "../../types"
import { Button } from "../common"

/** 星期标签（getDay: 0=日 … 6=六）；周末（日/六）以粉色高亮 */
const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const

/**
 * 表盘自适应：测量容器可用宽高，对 520 基准表盘做等比缩放。
 * 表盘内部（成员环/SVG/中心圆）统一以 520 坐标系定位，整层 scale 保证
 * 移动端窄屏与全屏宽幅下均完整呈现且不破坏节点几何。
 */
function useDialScale(
  ref: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setScale(Math.min(1, width / 520, height / 520))
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, enabled])
  return scale
}

/** AI Family 可执行动作负载（参数注入 / 种子载入），供 ChatMessage.actionable 与 onApplyAction 共用 */
export type FamilyActionPayload =
  | { guidanceScale: number; steps: number; denoiseStrength?: number }
  | { seedNumber: number }

export interface YYC3FamilyModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyAction?: (actionType: string, payload?: FamilyActionPayload) => void
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    msg: string,
    sub?: string,
  ) => void
}

interface ChatMessage {
  id: string
  sender: "user" | "agent"
  agentName?: string
  agentColor?: string
  text: string
  timestamp: string
  actionable?: {
    label: string
    actionType: string
    payload?: FamilyActionPayload
  }
}

export const YYC3FamilyModal: React.FC<YYC3FamilyModalProps> = ({
  isOpen,
  onClose,
  onApplyAction,
  onShowToast,
}) => {
  const [selectedMember, setSelectedMember] = useState<YYC3Member>(
    YYC3_MEMBERS[4]!, // mock 常量数组恒非空，静态索引安全
  ) // Default to Yuanqi / Tianxu
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  // 真实时钟：单源 Date state，1s 走时（数字时间 / 三针角度 / 日期星期均由此派生）
  const [now, setNow] = useState<Date>(() => new Date())
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      agentName: "元启·天枢",
      agentColor: "#00e0b8",
      text: "生产线全局状态正常，五步流水线各节点 Agent 保持 74ms 超低协同延迟。请问有何生产任务需要指派调度？",
      timestamp: "08:26",
      actionable: {
        label: "一键将当前推荐参数应用至工作台",
        actionType: "apply_params",
        payload: { guidanceScale: 7.5, steps: 30, denoiseStrength: 0.65 },
      },
    },
  ])

  // Real-time clock tick — 1 秒 setInterval 真实走时（原参考实现已删，见 git 基线 8424ee1）
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // 表盘自适应缩放（浮窗打开时启用测量）
  const dialAreaRef = useRef<HTMLDivElement>(null)
  const dialScale = useDialScale(dialAreaRef, isOpen)

  if (!isOpen) return null

  // ===== 真实时钟派生（角度公式同原参考实现，-90° 使零位指向 12 点）=====
  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const hourAngle = hours * 30 + minutes * 0.5 - 90
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90
  const secondAngle = seconds * 6 - 90
  const pad2 = (n: number) => String(n).padStart(2, "0")
  const currentTimeStr = `${pad2(now.getHours())}:${pad2(minutes)}:${pad2(seconds)}`
  const dateStr = `${String(now.getFullYear()).slice(2)}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())}`
  const dayIdx = now.getDay()
  const dayLabel = DAY_LABELS[dayIdx] ?? "日"
  const isWeekend = dayIdx === 0 || dayIdx === 6

  // 表盘几何：viewBox 520 坐标系，经 preserveAspectRatio 随容器等比自适应。
  // 中心 (260,260) 与成员环一致。三针真实钟表比例（秒>分>时），长度基于表盘
  // 半径 210 分级递减，且全部收在成员环内沿（r=180）之内：
  //   时针 110（青绿主色 · 最短最粗）｜分针 145（信息蓝 · 中长）｜秒针 172（粉 · 最细最长）
  const CLOCK_CX = 260
  const CLOCK_CY = 260
  const HAND_HOUR = 110
  const HAND_MINUTE = 145
  const HAND_SECOND = 172
  const handTip = (angleDeg: number, len: number) => ({
    x: CLOCK_CX + Math.cos((angleDeg * Math.PI) / 180) * len,
    y: CLOCK_CY + Math.sin((angleDeg * Math.PI) / 180) * len,
  })
  const hourTip = handTip(hourAngle, HAND_HOUR)
  const minuteTip = handTip(minuteAngle, HAND_MINUTE)
  const secondTip = handTip(secondAngle, HAND_SECOND)

  const renderMemberIcon = (type: YYC3Member["iconType"], color: string) => {
    const iconProps = { className: "w-5 h-5", style: { color } }
    switch (type) {
      case "speech":
        return <Ear {...iconProps} />
      case "brain":
        return <Brain {...iconProps} />
      case "eye":
        return <Eye {...iconProps} />
      case "star":
        return <Star {...iconProps} className="w-5 h-5 fill-current" />
      case "tree":
        return <GitBranch {...iconProps} />
      case "shield":
        return <Shield {...iconProps} />
      case "balance":
        return <Scale {...iconProps} />
      case "lightbulb":
        return <Lightbulb {...iconProps} />
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput
    if (!text.trim()) return

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
    }

    setMessages((prev) => [...prev, newMsg])
    if (!textToSend) setChatInput("")

    // Simulate Agent intelligent reply
    setTimeout(() => {
      let replyText = `已接收您的指令「${text}」。已通过 ${selectedMember.name} 调度本地 DiffSynth 推理引擎，参数约束已就绪。`
      let actionLabel = "应用调优方案至流水线"
      let payload: FamilyActionPayload = { guidanceScale: 7.2, steps: 32 }

      if (selectedMember.id === "gewu") {
        replyText =
          "针对第 142 帧轻微迟滞分析：系眨眼间隔（380ms）略高于黄金基准（250ms）。已生成唇形掩码平滑补偿权重，建议采用。"
        actionLabel = "一键应用唇形时序补偿补丁"
      } else if (selectedMember.id === "qianli") {
        replyText =
          "已从种子库比对出与当前人物面容最贴合的 S 级基线 Seed #81923011，该种子具备 96.8 分抗抖动特性。"
        actionLabel = "载入 S 级种子 #81923011"
        payload = { seedNumber: 81923011 }
      } else if (selectedMember.id === "zhiyun") {
        replyText =
          "已检测到当前 VRAM 占用 19.4GB。已执行显存碎片平滑整理与 24h 前临时切片清除，释放出 3.4GB 缓冲空间。"
        actionLabel = "查看运维自愈日志"
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `agt-${Date.now()}`,
          sender: "agent",
          agentName: selectedMember.name,
          agentColor: selectedMember.roleColor,
          text: replyText,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actionable: {
            label: actionLabel,
            actionType: "inject_recommendation",
            payload,
          },
        },
      ])
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#071222]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-[#0a1628] border border-[#1e2f47] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 relative ${isFullscreen ? "w-[98vw] h-[95vh]" : "w-full max-w-5xl h-[94dvh] md:h-[660px] md:max-h-[94dvh]"
          }`}
        style={{
          boxShadow:
            "0 0 32px rgba(0, 224, 184, 0.08), 0 20px 48px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching attachment */}
        <div className="h-14 px-6 border-b border-[#1e2f47] bg-[#0c1a30]/90 flex items-center justify-between select-none z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0c2440] to-[#0a1b2f] border border-[#00e0b8]/40 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(0,224,184,0.4)]">
              <img
                src="/yyc3-icons/yyc3-logo.png"
                alt="YYC³ AI Family"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#e8f0f8] tracking-wide">
                  YYC³ AI Family
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono">
                  智能协同生产系统
                </span>
              </div>
              <p className="text-[10px] text-[#8a97a8]">
                全局智能协同生产中心 · 8位核心业务 Agent
              </p>
            </div>
          </div>

          {/* Top-Right Stats Pills from attachment */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#15294a]/80 border border-[#1e2f47] text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e0b8]" />
              </span>
              <span className="text-[#8a97a8]">在线</span>
              <span className="font-mono font-bold text-[#00e0b8]">7/8</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#15294a]/80 border border-[#1e2f47] text-xs">
              <Zap className="w-3.5 h-3.5 text-[#ffb830]" />
              <span className="text-[#8a97a8]">活跃任务</span>
              <span className="font-mono font-bold text-[#e8f0f8]">142</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#15294a]/80 border border-[#1e2f47] text-xs">
              <Clock className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span className="text-[#8a97a8]">运行率</span>
              <span className="font-mono font-bold text-[#00b4d8]">99.8%</span>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-[#1e2f47] pl-3">
              <button
                onClick={() => setIsFullscreen((p) => !p)}
                className="p-1.5 rounded-lg text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a] transition-colors cursor-pointer"
                title={isFullscreen ? "还原窗口" : "全屏展示"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8a97a8] hover:text-[#e8f0f8] hover:bg-[#15294a] transition-colors cursor-pointer"
                title="关闭浮窗 (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Body: Clock Dial Radial Area + Right Member Drawer（移动端纵向堆叠） */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Radial Clock-Dial Layout Surface */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative select-none bg-gradient-to-b from-[#0a1628] to-[#071222] overflow-hidden min-h-0">
            {/* 表盘自适应测量层：520 基准表盘整体等比缩放（移动端/全屏通吃） */}
            <div
              ref={dialAreaRef}
              className="flex-1 w-full min-h-0 flex items-center justify-center"
            >
              <div
                className="relative w-[520px] h-[520px] flex-shrink-0"
                style={{
                  transform: `scale(${dialScale})`,
                  transformOrigin: "center center",
                }}
              >
                {/* Background circular web and clock ticks */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Outer thin ring */}
                  <div className="absolute inset-0 rounded-full border border-[#1e2f47]/60 pointer-events-none" />

                  {/* Middle dashed ring */}
                  <div className="absolute inset-10 rounded-full border border-dashed border-[#1e2f47]/80 pointer-events-none" />

                  {/* Inner glowing ring */}
                  <div className="absolute inset-24 rounded-full border border-[#00e0b8]/20 shadow-[0_0_24px_rgba(0,224,184,0.06)] pointer-events-none" />

                  {/* 12 Clock Hour Ticks */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = i * 30
                    return (
                      <div
                        key={i}
                        className="absolute w-0.5 h-3 bg-[#00e0b8]/40 origin-bottom pointer-events-none"
                        style={{
                          top: "16px",
                          left: "calc(50% - 1px)",
                          transformOrigin: "50% 244px",
                          transform: `rotate(${angle}deg)`,
                        }}
                      />
                    )
                  })}

                  {/* Center Core: YYC³ 品牌圆盘（144→96 同比缩小，三针环绕外露）+ 数字时钟下移（图一布局） */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full bg-[#0a1628] border-2 border-[#00e0b8] shadow-[0_0_24px_rgba(0,224,184,0.35)] flex flex-col items-center justify-center">
                      {/* Slow spinning ring */}
                      <div className="absolute -inset-1.5 rounded-full border border-dashed border-[#00e0b8]/50 spin-slow pointer-events-none" />

                      <img
                        src="/yyc3-icons/yyc3-logo.png"
                        alt="YYC³ AI Family"
                        className="h-9 w-9 object-contain drop-shadow-[0_0_6px_rgba(0,224,184,0.6)]"
                      />
                      <span className="text-[8px] text-[#8a97a8] tracking-tight uppercase mt-1">
                        AI Family
                      </span>
                    </div>

                    {/* Digital Clock + 日期星期（中心圆正下方，不遮挡三针） */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                      style={{ top: 104 }}
                    >
                      <div className="font-mono text-xs font-bold text-[#00e0b8] tracking-wider">
                        {currentTimeStr}
                      </div>
                      <div className="text-[9px] font-mono flex items-center justify-center gap-1 leading-none mt-0.5">
                        <span className="text-[#5c697a]">{dateStr}</span>
                        <span
                          className="font-semibold"
                          style={{
                            color: isWeekend ? "#FF006E" : "#8a97a8",
                            textShadow: isWeekend
                              ? "0 0 6px rgba(255,0,110,0.5)"
                              : "none",
                          }}
                        >
                          周{dayLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Radial Holographic Beams + 真实时钟三针（viewBox 520 等比自适应） */}
                  <svg
                    viewBox="0 0 520 520"
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  >
                    {YYC3_MEMBERS.map((m) => {
                      const isSelected = selectedMember.id === m.id
                      const rad = ((m.angle - 90) * Math.PI) / 180
                      const r = 210
                      const x = CLOCK_CX + r * Math.cos(rad)
                      const y = CLOCK_CY + r * Math.sin(rad)

                      return (
                        <line
                          key={m.id}
                          x1={CLOCK_CX}
                          y1={CLOCK_CY}
                          x2={x}
                          y2={y}
                          stroke={isSelected ? "#ffffff" : m.roleColor}
                          strokeWidth={isSelected ? 2 : 1}
                          strokeDasharray={isSelected ? "5 5" : "3 3"}
                          opacity={isSelected ? 0.9 : 0.35}
                          className={isSelected ? "data-stream-line" : ""}
                        />
                      )
                    })}

                    {/* 真实时钟三针：根部隐于中心圆盘之下，长短/颜色按真实钟表分级 */}
                    {/* 时针 — 青绿主色 · 最短最粗 */}
                    <line
                      x1={CLOCK_CX}
                      y1={CLOCK_CY}
                      x2={hourTip.x}
                      y2={hourTip.y}
                      stroke="#00e0b8"
                      strokeWidth={5}
                      strokeLinecap="round"
                      opacity={0.9}
                    />
                    {/* 分针 — 信息蓝 · 中长中细 */}
                    <line
                      x1={CLOCK_CX}
                      y1={CLOCK_CY}
                      x2={minuteTip.x}
                      y2={minuteTip.y}
                      stroke="#00b4d8"
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.85}
                    />
                    {/* 秒针 — 粉色辉光 · 最细最长（与周末高亮呼应） */}
                    <line
                      x1={CLOCK_CX}
                      y1={CLOCK_CY}
                      x2={secondTip.x}
                      y2={secondTip.y}
                      stroke="#FF006E"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 4px rgba(255,0,110,0.8))" }}
                    />
                  </svg>

                  {/* 8 Member Nodes positioned along circumference */}
                  {YYC3_MEMBERS.map((m) => {
                    const isSelected = selectedMember.id === m.id
                    const rad = ((m.angle - 90) * Math.PI) / 180
                    const r = 210
                    const cx = 260
                    const cy = 260
                    const left = cx + r * Math.cos(rad) - 30
                    const top = cy + r * Math.sin(rad) - 30

                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m)
                          setIsChatOpen(false)
                        }}
                        style={{ left: `${left}px`, top: `${top}px` }}
                        className="absolute w-[60px] h-[60px] flex flex-col items-center justify-center cursor-pointer group z-20"
                      >
                        {/* Circle Node Icon */}
                        <div
                          className={`relative w-12 h-12 rounded-full bg-[#0d1e36] flex items-center justify-center border-2 transition-all duration-200 group-hover:scale-110 ${isSelected
                            ? "border-white shadow-[0_0_24px_rgba(255,255,255,0.7)] scale-110"
                            : "border-[#1e2f47] hover:border-white/50"
                            }`}
                          style={{
                            borderColor: isSelected ? "#ffffff" : m.roleColor,
                            boxShadow: isSelected
                              ? `0 0 20px ${m.roleColor}80`
                              : `0 0 8px ${m.roleColor}30`,
                          }}
                        >
                          {renderMemberIcon(
                            m.iconType,
                            isSelected ? "#ffffff" : m.roleColor,
                          )}

                          {/* Speaking indicator dot from screenshot */}
                          {m.isSpeaking && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e0b8] border-2 border-[#0a1628]" />
                            </span>
                          )}
                        </div>

                        {/* Member Name and Clock text */}
                        <div className="mt-1 text-center whitespace-nowrap">
                          <div
                            className={`text-[11px] font-semibold transition-colors ${isSelected
                              ? "text-white"
                              : "text-[#8a97a8] group-hover:text-[#e8f0f8]"
                              }`}
                            style={{ color: isSelected ? m.roleColor : undefined }}
                          >
                            {m.name}
                          </div>
                          <div className="text-[9px] font-mono text-[#5c697a]">
                            {m.clockPosition}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Motto matching screenshot */}
            <div className="mt-auto pt-2 text-center text-xs text-[#8a97a8] select-none">
              <p className="tracking-widest font-medium text-[#e8f0f8]/90">
                亦师亦友亦伯乐 · 一言一语一协同
              </p>
              <p className="text-[10px] text-[#5c697a] tracking-wider mt-0.5 font-mono">
                Words Initiate Quadrants, Language Serves as Core for the Future
              </p>
            </div>
          </div>

          {/* Right Member Detail Flyout / Drawer（移动端折叠为底部面板） */}
          <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-[#1e2f47] bg-[#0c1a30] flex flex-col flex-shrink-0 overflow-y-auto max-h-[46%] md:max-h-none">
            {/* Drawer Header matching screenshot 2 */}
            <div className="p-5 border-b border-[#1e2f47] bg-[#0f1f38]/60 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-[#15294a] border-2 flex items-center justify-center shadow-md"
                  style={{ borderColor: selectedMember.roleColor }}
                >
                  {renderMemberIcon(
                    selectedMember.iconType,
                    selectedMember.roleColor,
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#e8f0f8]">
                    {selectedMember.name}
                  </h3>
                  <div className="text-xs text-[#8a97a8] font-mono mt-0.5">
                    {selectedMember.metaName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-[#00e0b8] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                      在线
                    </span>
                    <span className="text-[#5c697a]">|</span>
                    <span className="font-mono text-[11px] text-[#8a97a8]">
                      {selectedMember.clockPosition}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsChatOpen((p) => !p)}
                  title="切换对话/概览"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Toggle Content: Member Bio VS Chat Stream */}
            {!isChatOpen ? (
              <div className="flex-1 p-5 space-y-4 text-xs overflow-y-auto">
                {/* Quote Card matching attachment 2 */}
                <div className="p-3.5 rounded-xl bg-[#15294a]/60 border border-[#1e2f47] text-[#e8f0f8] leading-relaxed italic text-xs shadow-inner">
                  {selectedMember.quote}
                </div>

                {/* Role Definition */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                    角色定位
                  </div>
                  <p className="text-[#8a97a8] leading-relaxed pl-3">
                    {selectedMember.roleDefinition}
                  </p>
                </div>

                {/* Responsibilities */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                    核心职责
                  </div>
                  <div className="space-y-1 pl-3 text-[#8a97a8]">
                    {selectedMember.responsibilities.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-[#00e0b8] font-mono">{">"}</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capabilities pills */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                    核心能力
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-3">
                    {selectedMember.capabilities.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#15294a] text-[#e8f0f8] border border-[#1e2f47]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Runtime Metrics 2x2 grid from screenshot 2 */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[#00e0b8] font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
                    运行指标
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
                      <div className="text-[10px] text-[#8a97a8]">今日处理</div>
                      <div className="font-mono text-sm font-bold text-[#00e0b8] mt-0.5">
                        {selectedMember.metrics.todayTasks}{" "}
                        <span className="text-[10px] text-[#8a97a8] font-normal">
                          tasks
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
                      <div className="text-[10px] text-[#8a97a8]">平均延迟</div>
                      <div className="font-mono text-sm font-bold text-[#00b4d8] mt-0.5">
                        {selectedMember.metrics.avgLatencyMs}{" "}
                        <span className="text-[10px] text-[#8a97a8] font-normal">
                          ms
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
                      <div className="text-[10px] text-[#8a97a8]">准确率</div>
                      <div className="font-mono text-sm font-bold text-[#00e0b8] mt-0.5">
                        {selectedMember.metrics.accuracyRate}{" "}
                        <span className="text-[10px] text-[#8a97a8] font-normal">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#15294a]/80 border border-[#1e2f47]">
                      <div className="text-[10px] text-[#8a97a8]">协作次数</div>
                      <div className="font-mono text-sm font-bold text-[#9d7cd8] mt-0.5">
                        {selectedMember.metrics.collabCalls}{" "}
                        <span className="text-[10px] text-[#8a97a8] font-normal">
                          calls
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions matching screenshot 2 */}
                <div className="pt-3 border-t border-[#1e2f47] grid grid-cols-2 gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<MessageSquare className="w-3.5 h-3.5" />}
                    onClick={() => setIsChatOpen(true)}
                  >
                    对话
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5 text-[#00e0b8]" />}
                    onClick={() => {
                      onShowToast(
                        "success",
                        `任务已分派给「${selectedMember.name}」`,
                        "将自动对当前生产线进行实时优化分析",
                      )
                    }}
                  >
                    任务分派
                  </Button>
                </div>
              </div>
            ) : (
              /* Chat Mode */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Chat Message List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"
                        }`}
                    >
                      {m.sender === "agent" && (
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-[#00e0b8]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: m.agentColor || "#00e0b8",
                            }}
                          />
                          <span>{m.agentName}</span>
                          <span className="text-[10px] text-[#5c697a] font-mono">
                            {m.timestamp}
                          </span>
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${m.sender === "user"
                          ? "bg-[#00e0b8] text-[#0a1628] font-medium rounded-br-xs"
                          : "bg-[#15294a] text-[#e8f0f8] border border-[#1e2f47] rounded-bl-xs"
                          }`}
                      >
                        {m.text}
                      </div>

                      {/* Actionable Button if present */}
                      {m.actionable && (
                        <div className="mt-1.5">
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={
                              <CheckCircle2 className="w-3 h-3 text-[#00e0b8]" />
                            }
                            onClick={() => {
                              onApplyAction?.(
                                m.actionable!.actionType,
                                m.actionable!.payload,
                              )
                              onShowToast(
                                "success",
                                "已应用 AI 推荐方案至当前流水线",
                              )
                            }}
                          >
                            {m.actionable.label}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Preset Prompts Chips */}
                <div className="p-2 border-t border-[#1e2f47] bg-[#0c1a30]/80 overflow-x-auto flex gap-1.5 flex-shrink-0">
                  {(
                    PRESET_CHAT_PROMPTS[selectedMember.id] ??
                    PRESET_CHAT_PROMPTS.yuanqi ??
                    []
                  ).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-[#15294a] text-[#8a97a8] hover:text-[#00e0b8] border border-[#1e2f47] hover:border-[#00e0b8]/40 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 border-t border-[#1e2f47] bg-[#0f1f38] flex items-center gap-2 flex-shrink-0">
                  <input
                    type="text"
                    placeholder={`向 ${selectedMember.name} 发送生产协同指令...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                    className="flex-1 h-8 px-3 rounded-lg bg-[#0a1628] text-xs text-[#e8f0f8] placeholder-[#5c697a] border border-[#1e2f47] focus:outline-none focus:border-[#00e0b8]"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => handleSendMessage()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
