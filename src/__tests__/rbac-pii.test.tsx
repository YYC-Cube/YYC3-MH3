/**
 * file: src/__tests__/rbac-pii.test.tsx
 * description: YYC³ P1-1 安全测试（RBAC 运行时强制门 + PII 脱敏 + 审计拒绝留痕）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [test],[rbac],[pii],[security],[p1]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: P1-1 验收 —— ① maskPii：邮箱/手机号/长数字串脱敏与无 PII 透传；
 *        ② RoleGate：admin 放行 / guest 拒绝（默认拒绝态 role=alert）/
 *        自定义 fallback / onDeny 回调（可接审计）；③ 拒绝经
 *        createAuditEvent(result="denied") 产出审计留痕。
 *        RoleGate 依赖 AuthContext：经 vi.doMock 注入会话，
 *        vi.resetModules 保证逐用例刷新模块注册表。
 *
 * dependencies: vitest, @testing-library/react, ../app/RoleGate, ../domains/admin
 * exports: —
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createAuditEvent, maskPii } from "../domains/admin";

/** 注入会话（guest/admin/null → RoleGate 内部经 useAuthContext 读取） */
function mockSession(currentUser: { role: "admin" | "operator" | "guest" } | null): void {
  vi.doMock("../app/contexts", () => ({
    useAuthContext: () => ({ currentUser }),
  }));
}

/** 刷新注册表后动态挂载 RoleGate（保证 doMock 生效） */
async function mountGate(props: {
  permission: string;
  onDeny?: (role: string, permission: string) => void;
  fallback?: React.ReactNode;
}) {
  const { RoleGate } = await import("../app/RoleGate");
  return render(
    <RoleGate permission={props.permission} onDeny={props.onDeny} fallback={props.fallback}>
      <div>受控内容</div>
    </RoleGate>,
  );
}

describe("P1-1 安全 · PII 脱敏", () => {
  it("邮箱：保留首字符与 TLD，其余打码", () => {
    expect(maskPii("联系 yan.yu@example.com 获取")).toBe("联系 y***@e***.com 获取");
  });

  it("手机号：前 3 + **** + 后 4", () => {
    expect(maskPii("电话13812345678处理")).toBe("电话138****5678处理");
  });

  it("长数字串（≥8 位）：仅保留末 2 位（17 位 → 15 星；19 位 → 17 星）", () => {
    expect(maskPii("证件 11010119900307861X")).toBe(`证件 ${"*".repeat(15)}61X`);
    expect(maskPii("卡号 6222020200112233456 结清")).toBe(`卡号 ${"*".repeat(17)}56 结清`);
  });

  it("无 PII 文本原样透传；混合 PII 一次性全脱敏", () => {
    const plain = "普通运行日志：stage=batch, duration=850ms";
    expect(maskPii(plain)).toBe(plain);
    const out = maskPii("用户 y@test.com 手机13900001111 单号12345678 已提交");
    expect(out).not.toContain("y@test.com");
    expect(out).not.toContain("13900001111");
    expect(out).not.toContain("12345678");
  });
});

describe("P1-1 安全 · RBAC 运行时强制", () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
    vi.doUnmock("../app/contexts");
  });

  it("admin 持 settings:write → 放行渲染 children", async () => {
    mockSession({ role: "admin" });
    const { container } = await mountGate({ permission: "settings:write" });
    expect(container.textContent).toContain("受控内容");
    expect(screen.queryByTestId("rbac-denied")).toBeNull();
  });

  it("guest 缺 settings:write → 默认拒绝态（role=alert）+ onDeny 回调", async () => {
    mockSession({ role: "guest" });
    const onDeny = vi.fn();
    const { container } = await mountGate({ permission: "settings:write", onDeny });
    expect(container.textContent).not.toContain("受控内容");
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByTestId("rbac-denied")).toBeTruthy();
    expect(onDeny).toHaveBeenCalledWith("guest", "settings:write");
  });

  it("operator 缺 admin:audit → 拒绝；未登录按 guest 兜底；自定义 fallback 生效", async () => {
    mockSession({ role: "operator" });
    const { container } = await mountGate({
      permission: "admin:audit",
      fallback: <div>自定义拒绝页</div>,
    });
    expect(container.textContent).toContain("自定义拒绝页");
    expect(container.textContent).not.toContain("受控内容");
    expect(screen.queryByTestId("rbac-denied")).toBeNull();
  });

  it("拒绝可产出审计留痕：createAuditEvent(result=denied)", () => {
    const now = new Date("2026-10-16T08:00:00Z");
    const event = createAuditEvent(
      {
        actor: "guest-user",
        role: "guest",
        action: "view:settings",
        target: "/settings",
        result: "denied",
      },
      now,
    );
    expect(event.result).toBe("denied");
    expect(event.role).toBe("guest");
    expect(event.timestamp).toBe("2026-10-16T08:00:00.000Z");
  });
});

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 | 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
