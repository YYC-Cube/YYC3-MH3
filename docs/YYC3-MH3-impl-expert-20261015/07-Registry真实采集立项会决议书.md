---
file: 07-Registry真实采集立项会决议书.md
description: YYC3-MH3 Registry 真实采集立项会决议 - impl-expert - 2026-10-16
author: AI Tutor <impl-expert>
version: v1.0.0
created: 2026-10-16
updated: 2026-10-16
status: closed
tags: [meeting],[resolution],[registry],[collector]
category: report
---

# 📋 Registry 真实采集立项会 · 决议书

## 会议信息

| 属性 | 值 |
| --- | --- |
| **日期** | 2026-10-16 |
| **材料基线** | 04 预研（2026-10-12）· 06 Track A 手册（2026-10-16）· main `4f00b08` |
| **主持人** | impl-expert（智能应用落地专家） |
| **议题** | ① 预研结论回顾 ② 事实漂移适配（A1 注入点 / A2 Track A 解耦）③ 排期框架裁决 |

## 决议记录（三项）

| # | 议题 | 裁决 | 说明 |
| --- | --- | --- | --- |
| **D-1** | 立项范围 | **暂缓** | PR-13/14（collector 实现 + dev BFF 注入）保留待命态；Track A/D1 不联动启动（A2 解耦确认） |
| **D-2** | 06 契约 v1.2.0 时点 | **随 PR-14 落盘** | 维持 04 预研原节奏；暂缓期间契约不动 |
| **D-3** | Linux 采集需求 | **本期一并预研** | 会议唯一活跃交付项 → 产出 [08-Linux采集源预研](08-Linux采集源预研.md)（案头研究 + 实证待办） |

## 会议披露的关键事实（留档）

1. **A1 注入点漂移**：04 预研的 `vite.config.ts` 插件注入路径已随 Vite 退役失效；重启时的适配方向为独立 dev BFF 脚本（node:http，`127.0.0.1:3032/api`）或 Track A routeHandler——已写入 04 预研附录注记位
2. **A2 Track A 解耦依据**：collector 为 darwin-only；Track A 目标宿主（内网 192.168.3.45 侧）若为 Linux，将命中 platform 守卫回退演示语义——「真实采集生产化」与「切轨」非同一事项
3. 06 手册（Track A）维持**待命**状态不变，触发条件修正为「独立裁决，不随采集立项联动」

## 会后状态

| 事项 | 状态 |
| --- | --- |
| PR-13/14 采集器实现 | ⏸ 暂缓（重新立项时按 04 预研 + A1 适配方案执行） |
| 06 契约 v1.2.0 | ⏸ 待 PR-14 |
| Linux 采集源预研 | ✅ 本期完成（08 文档） |
| Track A / D1 | ⏸ 待命（06 手册） |

---

**会议状态**: ✅ 正常闭幕（三决议全落盘，一项交付即办）
