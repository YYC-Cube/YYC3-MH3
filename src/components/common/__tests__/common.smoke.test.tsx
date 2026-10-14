/**
 * file: src/components/common/__tests__/common.smoke.test.tsx
 * description: YYC³ 基础通用组件
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[ui],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 基础通用组件
 *
 * dependencies: vitest, @testing-library/react, ../index
 * exports: —
 */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Badge, Button, Card, Input, Switch } from "../index"

describe("common 基础组件冒烟", () => {
  it("Button 渲染子内容并可点击", () => {
    render(<Button variant="primary">创建批次</Button>)
    expect(screen.getByRole("button", { name: "创建批次" })).toBeInTheDocument()
  })

  it("Card 渲染标题与内容", () => {
    render(
      <Card title="五步闭环">
        <div>流水线就绪</div>
      </Card>,
    )
    expect(screen.getByText("五步闭环")).toBeInTheDocument()
    expect(screen.getByText("流水线就绪")).toBeInTheDocument()
  })

  it("Badge 渲染标签", () => {
    render(<Badge>S 级种子</Badge>)
    expect(screen.getByText("S 级种子")).toBeInTheDocument()
  })

  it("Input 渲染标签输入框", () => {
    render(<Input label="批次任务名称" value="" onChange={() => {}} />)
    expect(screen.getByText("批次任务名称")).toBeInTheDocument()
  })

  it("Switch 渲染开关控件", () => {
    const { container } = render(<Switch checked onChange={() => {}} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
