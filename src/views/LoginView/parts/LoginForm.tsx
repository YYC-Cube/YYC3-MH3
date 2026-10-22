/**
 * file: src/views/LoginView/parts/LoginForm.tsx
 * description: YYC³ 视图分区 — LoginView 登录表单（账号/密码/角色/记住凭证 + 主行动按钮 + 企业级备选认证）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [view],[part],[login],[form],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 从 LoginView 逐字提取的登录表单 JSX（零重设计）。
 *
 * dependencies: react, lucide-react, ../../components/common, ../useLoginView
 * exports: LoginFormProps, LoginForm
 */
import { Building2, Eye, EyeOff, Lock, QrCode, User } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { isUserRole, LoginViewState, ShowToastFn } from "../useLoginView";

export interface LoginFormProps {
  state: LoginViewState;
  onShowToast: ShowToastFn;
}

export const LoginForm: React.FC<LoginFormProps> = ({ state, onShowToast }) => {
  const {
    authMode,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberCredentials,
    setRememberCredentials,
    selectedRole,
    setSelectedRole,
    fieldErrors,
    isVerifying,
    isLocked,
    lockCountdown,
    setIsQrLoginOpen,
    handleLoginSubmit,
  } = state;

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {/* Username Input */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="text-[#8a97a8] font-medium">
            {authMode === "local" ? "本地管理员账号" : "企业员工账号 / 邮箱"}
          </label>
          {authMode === "local" && <span className="text-[10px] text-[#00e0b8] font-mono">免联网本地校验</span>}
        </div>
        <div className="relative flex items-center">
          <User className="w-4 h-4 text-[#8a97a8] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={authMode === "local" ? "输入本地管理员账号" : "name@company.com"}
            disabled={isVerifying || isLocked}
            className={`w-full h-11 pl-9 pr-3 rounded-md bg-[#15294a] text-xs text-[#e8f0f8] placeholder-[#8b949e] border transition-all focus:outline-none ${
              fieldErrors.username
                ? "border-[#ff7a45] focus:ring-1 focus:ring-[#ff7a45]"
                : "border-[#1e2f47] focus:border-[#00e0b8] focus:ring-1 focus:ring-[#00e0b8]/40"
            }`}
          />
        </div>
        {fieldErrors.username && <p className="text-[11px] text-[#ff7a45]">{fieldErrors.username}</p>}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="text-[#8a97a8] font-medium">认证凭证密码</label>
          <button
            type="button"
            onClick={() => onShowToast("info", "本地账号初始密码为 admin888，可在系统设置中修改")}
            className="text-[10px] text-[#8a97a8] hover:text-[#00e0b8]"
          >
            忘记密码?
          </button>
        </div>
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-[#8a97a8] absolute left-3 pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码 (至少6位)"
            disabled={isVerifying || isLocked}
            className={`w-full h-11 pl-9 pr-10 rounded-md bg-[#15294a] text-xs text-[#e8f0f8] placeholder-[#8b949e] border transition-all focus:outline-none ${
              fieldErrors.password
                ? "border-[#ff7a45] focus:ring-1 focus:ring-[#ff7a45]"
                : "border-[#1e2f47] focus:border-[#00e0b8] focus:ring-1 focus:ring-[#00e0b8]/40"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 text-[#8a97a8] hover:text-[#e8f0f8] p-1 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-[11px] text-[#ff7a45]">{fieldErrors.password}</p>}
      </div>

      {/* Role select & remember options */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-[#8a97a8]">
          <input
            type="checkbox"
            checked={rememberCredentials}
            onChange={(e) => setRememberCredentials(e.target.checked)}
            className="rounded accent-[#00e0b8]"
          />
          <span>记住本地加密凭证</span>
        </label>

        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e]">角色:</span>
          <select
            value={selectedRole}
            onChange={(e) => {
              const v = e.target.value;
              if (isUserRole(v)) setSelectedRole(v);
            }}
            className="bg-[#15294a] text-[#00e0b8] border border-[#1e2f47] rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="admin">超级管理员 (Full)</option>
            <option value="operator">生产线操作员</option>
            <option value="guest">审片观察员</option>
          </select>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          type="submit"
          loading={isVerifying}
          disabled={isLocked}
          className="w-full h-11 text-sm font-semibold tracking-wide"
        >
          {isLocked
            ? `账号锁定中 (${lockCountdown}s)`
            : isVerifying
              ? "六步闭环安全校验中..."
              : authMode === "local"
                ? "登录本地生产线 (Enter)"
                : "登录团队工作空间 (Enter)"}
        </Button>
      </div>

      {/* Team mode alternative logins (SSO / QR) */}
      {authMode === "team" && (
        <div className="pt-3 border-t border-[#1e2f47] space-y-2 text-xs">
          <div className="text-center text-[#8b949e] text-[11px]">其他企业级认证方式</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="xs"
              type="button"
              icon={<Building2 className="w-3.5 h-3.5 text-[#00b4d8]" />}
              onClick={() => onShowToast("info", "正在跳转至企业 SAML 2.0 / OIDC 单点登录...")}
            >
              企业 SSO 登录
            </Button>
            <Button
              variant="secondary"
              size="xs"
              type="button"
              icon={<QrCode className="w-3.5 h-3.5 text-[#00e0b8]" />}
              onClick={() => setIsQrLoginOpen(true)}
            >
              飞书/企微扫码
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
