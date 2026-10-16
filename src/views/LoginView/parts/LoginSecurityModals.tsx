/**
 * file: src/views/LoginView/parts/LoginSecurityModals.tsx
 * description: YYC³ 视图分区 — LoginView 安全说明弹窗群（离线数据主权机制 + 企业扫码准入）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[modal],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的安全说明弹窗群 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../../components/common
 * exports: LoginSecurityModalsProps, LoginSecurityModals
 */
import { QrCode } from "lucide-react";
import React from "react";
import { Modal } from "../../../components/common";

export interface LoginSecurityModalsProps {
  isOfflineExplainOpen: boolean;
  setIsOfflineExplainOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isQrLoginOpen: boolean;
  setIsQrLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoginSecurityModals: React.FC<LoginSecurityModalsProps> = ({
  isOfflineExplainOpen,
  setIsOfflineExplainOpen,
  isQrLoginOpen,
  setIsQrLoginOpen,
}) => {
  return (
    <>
      {/* Offline Mechanism Explanation Modal */}
      <Modal
        isOpen={isOfflineExplainOpen}
        onClose={() => setIsOfflineExplainOpen(false)}
        title="本地数据主权与离线运行安全机制"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-[#8a97a8] leading-relaxed">
          <div className="p-3 rounded-xl bg-[#15294a] border border-[#1e2f47] space-y-1.5">
            <h4 className="font-semibold text-[#00e0b8]">绝对数据隔离准则：</h4>
            <p className="text-[#e8f0f8]">
              MiniMax-H3 DiffSynth 本地版所有模型推理权重、视频成片、口型音素频谱与 Seed
              种子资产默认仅运行于本地环境，绝不向任何外部公网服务器上传视频或面容数据。
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#e8f0f8]">核心保障机制：</h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-[#00e0b8] font-mono">1.</span>
                <span>
                  <strong>离线准入：</strong>
                  完全断网环境下，本地账号依然可秒级通过 Argon2id 凭证库登录。
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00e0b8] font-mono">2.</span>
                <span>
                  <strong>单端口网关：</strong>
                  全系统所有前后端交互均通过单一本地端口 (:3031) 聚合，无隐蔽出站连接。
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00e0b8] font-mono">3.</span>
                <span>
                  <strong>操作审计日志：</strong>
                  所有批次执行与参数回写均保留本地审计留痕，支持回溯审查。
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* QR Code Login Modal */}
      <Modal
        isOpen={isQrLoginOpen}
        onClose={() => setIsQrLoginOpen(false)}
        title="企业移动端安全扫码准入"
      >
        <div className="flex flex-col items-center justify-center p-4 space-y-3 text-xs text-center">
          <div className="w-48 h-48 rounded-xl bg-white p-3 flex items-center justify-center border-2 border-[#00e0b8] shadow-lg">
            <QrCode className="w-full h-full text-[#0a1628]" />
          </div>
          <p className="text-[#8a97a8]">请使用 企业微信 或 飞书 扫描上方二维码以完成身份核验</p>
          <span className="text-[10px] text-[#8b949e] font-mono">
            二维码有效期 60 秒 · 已启用端到端加密
          </span>
        </div>
      </Modal>
    </>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
