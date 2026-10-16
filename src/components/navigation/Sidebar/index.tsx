/**
 * file: src/components/navigation/Sidebar/index.tsx
 * description: YYC³ 导航组件 — Sidebar 入口容器（路由事实源激活态 + 四分组装配）
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[navigation],[sidebar],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 侧边导航入口 —— 激活态/导航由路由事实源（usePathname 反查 + router.push）派生，
 *        装配品牌标头 + 四分类导航分组 + 页脚；大块 JSX 分别下沉至 parts
 *        （SidebarBrand / SidebarNavGroup / SidebarFooter / navItems）。
 *
 * dependencies: react, next/navigation, ../../../kernel/config, ../../../types, ./parts/navItems, ./parts/SidebarBrand, ./parts/SidebarNavGroup, ./parts/SidebarFooter
 * exports: SidebarProps, Sidebar
 */
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { hrefForTab, tabFromPathname } from "../../../kernel/config";
import type { NavTabId } from "../../../types";
import { NAV_ITEMS } from "./parts/navItems";
import { SidebarBrand } from "./parts/SidebarBrand";
import { SidebarFooter } from "./parts/SidebarFooter";
import { SidebarNavGroup } from "./parts/SidebarNavGroup";

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  // P3：激活态/导航从 props 迁至路由事实源（清单 §1.6 —— usePathname 反查 + router.push）
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = tabFromPathname(pathname ?? "/");
  const onSelectTab = (tab: NavTabId) => router.push(hrefForTab(tab));
  return (
    <aside
      className={`h-screen bg-[#0c1a30] border-r border-[#30363d] flex flex-col transition-all duration-200 select-none z-30 relative ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <SidebarBrand collapsed={collapsed} onToggleCollapse={onToggleCollapse} />

      {/* Nav List with scroll */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* System Category */}
        <SidebarNavGroup
          title="设计体系"
          items={NAV_ITEMS.filter((i) => i.category === "system")}
          collapsed={collapsed}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />

        {/* Core Category */}
        <SidebarNavGroup
          title="核心生产流水线"
          items={NAV_ITEMS.filter((i) => i.category === "core")}
          collapsed={collapsed}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />

        {/* Advanced Category */}
        <SidebarNavGroup
          title="模型与工作流"
          items={NAV_ITEMS.filter((i) => i.category === "advanced")}
          collapsed={collapsed}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />

        {/* Ops & Settings Category */}
        <SidebarNavGroup
          title="系统与运维"
          items={NAV_ITEMS.filter((i) => i.category === "ops")}
          collapsed={collapsed}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />
      </div>

      {/* Footer Local Status */}
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
