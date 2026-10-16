/**
 * file: src/app/settings/page.tsx
 * description: 系统与硬件设置路由页（settings）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-10-15
 * updated: 2026-10-16
 * status: active
 * tags: [app],[page],[settings]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 05 清单 P3 §4.1 —— NavTabId "settings" → 路由 "/settings"（视图零改动）；
 *        P4-3 数据主权装配：组合根单例端口 + usecases 导出/导入用例组装为
 *        dataPortability 通道经 props 注入视图（分层红线：views 不触达 app/adapters）
 *
 * dependencies: react, @/views/SettingsView, ../contexts, ../composition, ../usecases/dataPortability
 * exports: default (Page)
 */
"use client";

import { useMemo } from "react";
import { SettingsView } from "@/views/SettingsView";
import { getPorts } from "../composition";
import { useToastContext } from "../contexts";
import { exportAllData, importAllData } from "../usecases/dataPortability";

export default function Page() {
  const { showToast } = useToastContext();
  // P2：组合根单例 —— 与全局 Provider 树共享同一装配（IDB/内存同源）
  const ports = useMemo(() => getPorts(), []);
  const dataPortability = useMemo(
    () => ({
      exportAll: () => exportAllData(ports),
      importAll: (json: string) => importAllData(ports, json),
    }),
    [ports],
  );

  return <SettingsView onShowToast={showToast} dataPortability={dataPortability} />;
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
