/**
 * file: src/__tests__/app.smoke.test.tsx
 * description: YYC³ 冒烟测试用例
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [test],[smoke]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 冒烟测试用例
 *
 * dependencies: vitest, @testing-library/react, ../App
 * exports: —
 */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "../App"

describe("App 全局冒烟", () => {
  it("应用可完整挂载，底部状态栏显示本地优先标识", () => {
    render(<App />)
    expect(screen.getByText(/MiniMax-H3 v2\.1 PRO 本地优先/)).toBeInTheDocument()
  })

  it("默认路由挂载后载入设计体系视图", async () => {
    render(<App />)
    const matches = await screen.findAllByText(/设计规范与全量组件库/)
    expect(matches.length).toBeGreaterThan(0)
  })

  it("顶部状态栏显示 YYC³ AI 协同连接状态", () => {
    render(<App />)
    expect(screen.getByText(/YYC³ AI 协同已连接/)).toBeInTheDocument()
  })
})

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
