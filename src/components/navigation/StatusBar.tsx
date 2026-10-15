/**
 * file: src/components/navigation/StatusBar.tsx
 * description: YYC³ 导航组件 — 工业风底部状态栏（本地优先标识/VRAM/本地预览地址/协同入口）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[navigation],[statusbar]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 工业风底部状态栏（需求 2.3）— 端口地址经 config 单源注入
 *
 * dependencies: react, lucide-react, ../../config, ../../types
 * exports: StatusBarProps, StatusBar
 */
import { HardDrive, ShieldCheck } from "lucide-react";
import { APP_PORT } from "../../config";
import { ShowToast } from "../../types";

export interface StatusBarProps {
  onNavigateOps: () => void;
  onOpenYYC3: () => void;
  onShowToast: ShowToast;
}

/** 工业风底部状态栏（Requirement 2.3） */
export function StatusBar({ onNavigateOps, onOpenYYC3, onShowToast }: StatusBarProps) {
  return (
    <footer className="h-6 px-4 bg-[#081220] border-t border-[#1e2f47] flex items-center justify-between text-[11px] font-mono text-[#8a97a8] select-none z-30">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[#00e0b8]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MiniMax-H3 v2.1 PRO 本地优先</span>
        </span>
        <span className="text-[#1e2f47]">|</span>
        <span className="hidden sm:inline">100% 数据主权与离线运行</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onNavigateOps}
          className="flex items-center gap-1.5 hover:text-[#00e0b8] transition-colors cursor-pointer"
        >
          <HardDrive className="w-3.5 h-3.5 text-[#00e0b8]" />
          <span>VRAM: 19.4G/24G</span>
        </button>
        <span className="text-[#1e2f47]">|</span>
        <button
          onClick={() => {
            const localUrl = `http://127.0.0.1:${APP_PORT}`;
            navigator.clipboard.writeText(localUrl);
            onShowToast("success", "已复制本地预览服务地址", localUrl);
          }}
          className="hover:text-[#00e0b8] transition-colors cursor-pointer"
          title="点击复制地址"
        >
          本地预览 :{APP_PORT}
        </button>
        <span className="text-[#1e2f47]">|</span>
        <button
          onClick={onOpenYYC3}
          className="flex items-center gap-1 text-[#00e0b8] hover:underline cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e0b8] animate-pulse" />
          <span>YYC³ AI 协同已连接</span>
        </button>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
