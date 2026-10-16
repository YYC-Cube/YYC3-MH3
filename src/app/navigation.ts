/**
 * file: src/app/navigation.ts
 * description: YYC³ 应用层 — 副作用导航 Hook（原 App.handleNavigate 等价物）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-15
 * updated: 2026-10-15
 * status: active
 * tags: [app],[navigation],[router]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 —— 视图切换语义路由化承接：
 *   - 纯映射（TAB_HREF/hrefForTab/tabFromPathname）下沉 config 叶层（见 src/config.ts，
 *     components 层 Sidebar 可合法消费，维持六边形依赖方向）
 *   - useAppNavigate：extra.batchId 副作用（setActiveBatchId 收敛生产域选中态）
 *     + router.push —— 原 App.tsx handleNavigate 全量等价
 *
 * dependencies: next/navigation, ../kernel/config, ./contexts
 * exports: useAppNavigate
 */
"use client";

import { useRouter } from "next/navigation";

import { hrefForTab } from "../kernel/config";
import { NavTabId, NavigateExtra } from "../types";
import { useProductionDataContext } from "./contexts";

/**
 * 副作用导航（原 App.handleNavigate 等价物）：
 * extra.batchId → 先收敛生产域选中批次（批次详情/工作台联动语义），再 push。
 */
export function useAppNavigate(): (tab: NavTabId, extra?: NavigateExtra) => void {
  const router = useRouter();
  const { setActiveBatchId } = useProductionDataContext();
  return (tab, extra) => {
    if (extra?.batchId) {
      setActiveBatchId(extra.batchId);
    }
    router.push(hrefForTab(tab));
  };
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
