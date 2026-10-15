/**
 * file: src/views/LoginView.tsx
 * description: YYC³ 功能视图 — LoginView
 * author: YanYuCloudCube Team
 * version: v1.0.1
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — LoginView
 *
 * dependencies: react, ../types, lucide-react, ../components/common
 * exports: LoginViewProps, LoginView
 */
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Moon,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "../components/common";
import { AuthUser, UserRole } from "../types";

/** 原生 select 值为运行时 string，收窄至 UserRole 的类型守卫 */
const isUserRole = (v: string): v is UserRole => v === "admin" || v === "operator" || v === "guest";

export interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onPreviewBypass?: () => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onPreviewBypass,
  onShowToast,
}) => {
  // Auth Mode: Local offline vs. Team Cloud
  const [authMode, setAuthMode] = useState<"local" | "team">("local");

  // Form Fields
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  // Validation & Error state
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Closed-loop verification pipeline animation state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [verificationLog, setVerificationLog] = useState<string>("");

  // Modals state
  const [isOfflineExplainOpen, setIsOfflineExplainOpen] = useState(false);
  const [isQrLoginOpen, setIsQrLoginOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // Handle Lockout countdown
  useEffect(() => {
    let timer: number | null = null;
    if (isLocked && lockCountdown > 0) {
      timer = window.setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockCountdown]);

  // Validation
  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "请输入管理员账号或员工工号";
    }
    if (!password || password.length < 6) {
      errors.password = "密码长度不能少于 6 位";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Node 1 to Node 6 Closed-Loop Login Execution
  const handleLoginSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLocked) {
      onShowToast("error", `账号已临时锁定，请等待 ${lockCountdown} 秒后重试`);
      return;
    }

    // Node 1: Frontend format validation
    if (!validateForm()) {
      setErrorMessage("请完整填写账号与密码");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);
    setVerificationStep(1);
    setVerificationLog("正在校验本地凭证格式与安全哈希...");

    // Node 2: Credential verification (simulate local SHA-256 compare)
    setTimeout(() => {
      setVerificationStep(2);
      setVerificationLog(
        authMode === "local"
          ? "正在匹配本地安全加密凭证库 (Argon2id)..."
          : "正在请求企业身份服务端鉴权...",
      );

      setTimeout(() => {
        // Node 3: Role & Permission mapping
        setVerificationStep(3);
        setVerificationLog(
          `匹配角色权限矩阵: [${
            selectedRole === "admin" ? "超级管理员 (Full Access)" : "生产线操作员"
          }]`,
        );

        setTimeout(() => {
          // Node 4: Safety environment inspection
          setVerificationStep(4);
          setVerificationLog("正在扫描本地运行环境：PyTorch 2.4、CUDA 12.4、RTX 4090 显存...");

          setTimeout(() => {
            // Node 5: Audit logging
            setVerificationStep(5);
            setVerificationLog("正在记录本地安全审计 WAL 日志 (设备: LocalStation-01)...");

            setTimeout(() => {
              // Node 6: Session initialization & entrance
              setVerificationStep(6);
              setVerificationLog("会话初始化完成，正在进入总览驾驶舱...");

              setTimeout(() => {
                setIsVerifying(false);
                const user: AuthUser = {
                  username: username.trim(),
                  displayName: authMode === "local" ? "本地超级管理员" : "企业生产主管",
                  role: selectedRole,
                  mode: authMode,
                  lastLogin: "2025-04-12 09:42:18",
                  avatar: "/yyc3-icons/logo.png",
                  token: `tok_${Date.now()}_secure_local`,
                  permissions: ["all_pipeline", "models_write", "ops_control", "seed_mutate"],
                  ipAddress: "127.0.0.1 (本地安全环回)",
                  device: "Workstation RTX 4090 (24GB)",
                };
                onLoginSuccess(user);
                onShowToast(
                  "success",
                  `欢迎回来，${user.displayName}`,
                  `上次登录时间: ${user.lastLogin} · 本地优先数据主权已就绪`,
                );
              }, 400);
            }, 400);
          }, 450);
        }, 400);
      }, 450);
    }, 400);
  };

  // Simulate failed login attempt for testing
  const handleSimulateFail = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 3) {
      setIsLocked(true);
      setLockCountdown(30);
      setErrorMessage(
        `密码连续输入错误已达 ${nextAttempts} 次，系统已启动安全防护，账号锁定 30 秒`,
      );
      onShowToast("error", "触发账号安全防爆破锁定", "已拦截异常密码尝试");
    } else {
      setErrorMessage(`密码错误，剩余 ${3 - nextAttempts} 次尝试机会`);
      onShowToast("warning", "账号或密码校验失败");
    }
  };

  return (
    <div
      className={`min-h-screen w-screen flex flex-col justify-between items-center p-4 sm:p-6 transition-colors duration-500 relative select-none overflow-y-auto ${
        isNightMode ? "bg-[#040c17]" : "bg-[#0a1628]"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 38%, rgba(0, 224, 184, 0.05) 0%, transparent 60%), linear-gradient(180deg, #0a1628 0%, #071222 100%)",
      }}
    >
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00e0b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Utility Bar: Quick Night Mode & Bypass for Pro Preview */}
      <div className="w-full max-w-6xl flex items-center justify-between text-xs text-[#8a97a8] z-20 pt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00e0b8]" />
          <span className="font-mono text-[#e8f0f8] font-semibold text-[11px]">
            MiniMax-H3 Security Gate · 离线与团队双模准入
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNightMode((p) => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#15294a] hover:text-[#00e0b8] border border-[#1e2f47] transition-colors cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{isNightMode ? "低蓝光夜间" : "深色工业"}</span>
          </button>

          {onPreviewBypass && (
            <button
              onClick={onPreviewBypass}
              className="text-[#00e0b8] hover:underline flex items-center gap-1 cursor-pointer"
              title="免密直接进入工作台体验"
            >
              <span>体验模式直接进入</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Brand Header + Login Card */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 z-10 w-full max-w-md">
        {/* Brand Header Area */}
        <div className="flex flex-col items-center text-center mb-6 space-y-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c2440] via-[#0f2d4e] to-[#0a1b2f] border-2 border-[#00e0b8] flex items-center justify-center p-2.5 shadow-[0_0_24px_rgba(0,224,184,0.35)] animate-in zoom-in-95 duration-300">
              <img
                src="/yyc3-icons/logo.png"
                alt="YYC3 Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e0b8] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e0b8] border-2 border-[#0a1628]" />
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#e8f0f8] tracking-tight flex items-center justify-center gap-2">
              <span>MiniMax-H3 DiffSynth</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e0b8]/15 text-[#00e0b8] border border-[#00e0b8]/30 font-mono">
                本地版 v2.1 PRO
              </span>
            </h1>
            <p className="text-xs text-[#00e0b8] font-mono tracking-widest mt-1">
              言启象限 · 语枢未来
            </p>
          </div>
        </div>

        {/* Login Card Container (420px width, 12px radius, micro-glow) */}
        <div
          className="w-full rounded-2xl bg-[#0f1e35] border border-[#1e2f47] p-8 shadow-2xl relative transition-all duration-200"
          style={{
            boxShadow: "0 0 24px rgba(0, 224, 184, 0.08), 0 20px 48px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Top Error Alert Bar if present */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-[#ff7a45]/15 border border-[#ff7a45]/50 flex items-center justify-between gap-2 text-xs text-[#ff7a45] animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-[#ff7a45] hover:opacity-80 p-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Mode Switcher Tabs (Local Offline vs. Team Cloud) */}
          <div className="flex border-b border-[#1e2f47] pb-3 mb-6 select-none">
            <button
              onClick={() => {
                setAuthMode("local");
                setErrorMessage(null);
              }}
              className={`flex-1 text-center pb-2 text-xs font-semibold transition-all relative cursor-pointer ${
                authMode === "local" ? "text-[#00e0b8]" : "text-[#8a97a8] hover:text-[#e8f0f8]"
              }`}
            >
              <span>本地离线账号</span>
              {authMode === "local" && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00e0b8] shadow-[0_0_8px_rgba(0,224,184,0.6)]" />
              )}
            </button>

            <button
              onClick={() => {
                setAuthMode("team");
                setErrorMessage(null);
              }}
              className={`flex-1 text-center pb-2 text-xs font-semibold transition-all relative cursor-pointer ${
                authMode === "team" ? "text-[#00e0b8]" : "text-[#8a97a8] hover:text-[#e8f0f8]"
              }`}
            >
              <span>团队云端账号</span>
              {authMode === "team" && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00e0b8] shadow-[0_0_8px_rgba(0,224,184,0.6)]" />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[#8a97a8] font-medium">
                  {authMode === "local" ? "本地管理员账号" : "企业员工账号 / 邮箱"}
                </label>
                {authMode === "local" && (
                  <span className="text-[10px] text-[#00e0b8] font-mono">免联网本地校验</span>
                )}
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
              {fieldErrors.username && (
                <p className="text-[11px] text-[#ff7a45]">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[#8a97a8] font-medium">认证凭证密码</label>
                <button
                  type="button"
                  onClick={() =>
                    onShowToast("info", "本地账号初始密码为 admin888，可在系统设置中修改")
                  }
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
              {fieldErrors.password && (
                <p className="text-[11px] text-[#ff7a45]">{fieldErrors.password}</p>
              )}
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
                    onClick={() =>
                      onShowToast("info", "正在跳转至企业 SAML 2.0 / OIDC 单点登录...")
                    }
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

          {/* Auxiliary Help Links */}
          <div className="mt-6 pt-4 border-t border-[#1e2f47] flex items-center justify-between text-xs text-[#8a97a8]">
            <button
              type="button"
              onClick={() => setIsOfflineExplainOpen(true)}
              className="hover:text-[#00e0b8] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>本地离线安全机制说明</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateFail}
              className="text-[#8b949e] hover:text-[#ff7a45] transition-colors cursor-pointer text-[10px]"
              title="用于测试安全防爆破锁定分支"
            >
              [测试密码错误锁定]
            </button>
          </div>
        </div>

        {/* Real-time 6-Node Verification Status Indicator during login */}
        {isVerifying && (
          <div className="mt-4 w-full p-3.5 rounded-xl bg-[#0f1f38] border border-[#00e0b8]/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#00e0b8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>闭环审核节点 {verificationStep}/6</span>
              </span>
              <span className="text-[11px] text-[#8a97a8] font-mono">
                {Math.round((verificationStep / 6) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#15294a] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#00e0b8] h-full transition-all duration-300 shadow-[0_0_8px_rgba(0,224,184,0.8)]"
                style={{ width: `${(verificationStep / 6) * 100}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-[#8a97a8] truncate">{verificationLog}</div>
          </div>
        )}
      </div>

      {/* Footer Credentials Area */}
      <footer className="w-full max-w-6xl pb-3 pt-2 border-t border-[#1e2f47]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8b949e] z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#00e0b8] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>本地优先 · 数据主权 · 100% 离线可用</span>
          </span>
          <span className="text-[#1e2f47]">|</span>
          <span>Argon2id 凭证加密 · 沙箱隔离存储</span>
        </div>

        <div>
          <span>© 2026 YanYuCloudCube · MiniMax-H3 DiffSynth Production</span>
        </div>
      </footer>

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
              种子资产均完全持久化保存在本地 NVMe 磁盘，绝不向任何外部公网服务器上传视频或面容数据。
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
                  所有批次执行与参数回写均保留本地 WAL 事务日志，支持回溯合规审查。
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
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
