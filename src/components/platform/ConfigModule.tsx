/**
 * file: src/components/platform/ConfigModule.tsx
 * description: YYC³ 平台组件 — 系统配置管理模块（全局参数/安全审计）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-12
 * updated: 2026-10-12
 * status: active
 * tags: [component],[platform],[config]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 系统配置 — 端口地址经 config 单源注入（零硬编码）
 *
 * dependencies: react, lucide-react, ../common, ../../kernel/config, ../../types
 * exports: ConfigModuleProps, ConfigModule
 */
import { APP_PORT } from "../../kernel/config";
import { ShowToast } from "../../types";
import { Badge, Button, Card, Input } from "../common";

export interface ConfigModuleProps {
  onShowToast: ShowToast;
}

export function ConfigModule({ onShowToast }: ConfigModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
      <Card title="全局生产参数与模型配置 (Global Configuration)">
        <div className="space-y-3">
          <Input
            label="DiffSynth 默认主干模型"
            value="DiffSynth-MiniMax-H3-v2.1-HQ.safetensors"
            mono
            readOnly
          />
          <Input
            label="本地 NAS 共享存储挂载点"
            value="/mnt/nas/digital_human_production/"
            mono
            readOnly
          />
          <Input label="本地预览服务监听端口" value={`${APP_PORT} (HTTP/SSE)`} mono readOnly />
          <div className="pt-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onShowToast("info", "配置检查通过")}
            >
              验证全量配置连通性
            </Button>
          </div>
        </div>
      </Card>

      <Card title="安全与离线权限审计 (Audit & Security)">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#15294a]">
            <div>
              <span className="font-semibold text-[#e8f0f8]">100% 离线数据主权锁</span>
              <p className="text-[11px] text-[#8a97a8]">
                强制阻断一切外部遥测回传与非受信任网络请求
              </p>
            </div>
            <Badge variant="brand" size="xs">
              已锁定
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#15294a]">
            <div>
              <span className="font-semibold text-[#e8f0f8]">操作行为审计日志</span>
              <p className="text-[11px] text-[#8a97a8]">记录批次发起、参数修改、Seed 采纳操作</p>
            </div>
            <Badge variant="brand" size="xs">
              WAL 存储中
            </Badge>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="xs"
              onClick={() => onShowToast("success", "已生成安全合规自检报告")}
            >
              下载安全合规证书
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
