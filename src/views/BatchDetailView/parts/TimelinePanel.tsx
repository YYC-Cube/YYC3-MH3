/**
 * file: src/views/BatchDetailView/parts/TimelinePanel.tsx
 * description: YYC³ 功能视图 — BatchDetailView 五阶段全流程时间轴面板
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[batch-detail],[timeline],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: BatchDetailView 五阶段耗时分解与自检指标时间轴（Stage 1-5），
 *        逐字搬移自原 BatchDetailView.tsx（TAB Timeline）。
 *
 * dependencies: react
 * exports: TimelinePanel
 */
import React from "react";

export const TimelinePanel: React.FC = () => {
  return (
    <div className="p-5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-4 text-xs">
      <h3 className="font-semibold text-[#e8f0f8]">五阶段耗时分解与自检指标</h3>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e2f47]">
        {[
          {
            stage: "Stage 1: 神经渲染 (DiffSynth H3 扩散采样)",
            time: "28.4s",
            desc: "30步 DDIM 采样完成，FP8 激活显存加速正常",
            status: "pass",
          },
          {
            stage: "Stage 2: 口型初评 (SyncNet 音视频对齐)",
            time: "3.2s",
            desc: "提取音素 MFCC 频谱，时延误差 0.042s (合格)",
            status: "pass",
          },
          {
            stage: "Stage 3: 多模精评 (表情/姿态/时序)",
            time: "5.1s",
            desc: "微表情自然度 92.4分，无发丝跳帧撕裂",
            status: "pass",
          },
          {
            stage: "Stage 4: 缺陷归因与聚类分析",
            time: "2.4s",
            desc: "第 142 帧轻微迟滞已被鲁棒滤波吸收",
            status: "pass",
          },
          {
            stage: "Stage 5: Seed 基因回写与沉淀",
            time: "0.3s",
            desc: "已提取 Seed #48920194 核心权重，沉淀为 S 级基线",
            status: "pass",
          },
        ].map((item, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-[#0a1628] border-2 border-[#00e0b8] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e8f0f8]">{item.stage}</span>
              <span className="font-mono text-xs text-[#00e0b8] font-semibold">{item.time}</span>
            </div>
            <p className="text-xs text-[#8a97a8] mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
