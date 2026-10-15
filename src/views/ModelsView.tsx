/**
 * file: src/views/ModelsView.tsx
 * description: YYC³ 功能视图 — ModelsView
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-11
 * updated: 2026-10-11
 * status: active
 * tags: [component],[view],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: YYC³ 功能视图 — ModelsView
 *
 * dependencies: react, lucide-react, ../components/common, ../types
 * exports: ModelsViewProps, ModelsView
 */
import { Play, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { Badge, Button, Card } from "../components/common";
import { NavigateExtra, NavTabId } from "../types";

/** 模型仓库分区页签 ID */
export type ModelTab = "models" | "env" | "disk" | "benchmarks";

const MODEL_TABS: { id: ModelTab; label: string }[] = [
  { id: "models", label: "模型权重清单 (4项)" },
  { id: "env", label: "计算依赖环境检测" },
  { id: "disk", label: "本地 NVMe 磁盘分配" },
  { id: "benchmarks", label: "性能基准多维对比" },
];

export interface ModelsViewProps {
  onNavigate: (tab: NavTabId, extra?: NavigateExtra) => void;
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<ModelTab>("models");
  const [warmupProgress, setWarmupProgress] = useState<number | null>(null);

  const handleWarmup = (modelName: string) => {
    setWarmupProgress(10);
    const interval = setInterval(() => {
      setWarmupProgress((prev) => {
        if (!prev || prev >= 100) {
          clearInterval(interval);
          onShowToast("success", `${modelName} 预热完成`, "CUDA TensorRT 缓存与显存常驻就绪");
          return null;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a1628]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#e8f0f8]">
              本地模型与计算资源管控 · Models & Resources
            </h1>
            <Badge variant="brand" size="xs">
              本地安全隔离
            </Badge>
          </div>
          <p className="text-xs text-[#8a97a8] mt-1">
            DiffSynth-MiniMax-H3 系列模型权重常驻、显存分级加载与本地依赖环境检测
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => onShowToast("info", "模型权重完整性校验完成 (SHA256 匹配)")}
          >
            校验权重哈希
          </Button>
        </div>
      </div>

      {/* Warmup progress banner if active */}
      {warmupProgress !== null && (
        <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#00e0b8]/40 space-y-2 animate-in fade-in">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-[#00e0b8]">
              正在执行 CUDA 权重预热与显存常驻加载...
            </span>
            <span className="font-mono text-[#00e0b8] font-bold">{warmupProgress}%</span>
          </div>
          <div className="w-full bg-[#15294a] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00e0b8] h-full transition-all duration-300"
              style={{ width: `${warmupProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#1e2f47] flex gap-6 text-xs">
        {MODEL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
              activeTab === tab.id
                ? "text-[#00e0b8] font-semibold"
                : "text-[#8a97a8] hover:text-[#e8f0f8]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00e0b8]" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Models */}
      {activeTab === "models" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "DiffSynth-MiniMax-H3-v2.1-HQ",
              desc: "最高精细度旗舰权重，支持 4K 超分与微表情高保真对齐",
              size: "14.8 GB",
              vram: "8.2 GB (FP8)",
              status: "loaded",
              isDefault: true,
            },
            {
              name: "DiffSynth-MiniMax-H3-v2.0-Fast",
              desc: "极速推理轻量化模型，适合短视频批量带货与快速预览",
              size: "9.2 GB",
              vram: "5.4 GB",
              status: "standby",
              isDefault: false,
            },
            {
              name: "SyncNet-v3-MultiLingual",
              desc: "多语种唇齿运动音视频对齐特征打分网络",
              size: "1.8 GB",
              vram: "1.2 GB",
              status: "loaded",
              isDefault: true,
            },
            {
              name: "FaceParsing-BiseNet-4K",
              desc: "面部五官超细粒度分割与边缘抗撕裂掩码模型",
              size: "640 MB",
              vram: "500 MB",
              status: "loaded",
              isDefault: true,
            },
          ].map((m, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-[#e8f0f8]">{m.name}</span>
                  <div className="flex items-center gap-2">
                    {m.isDefault && (
                      <Badge variant="brand" size="xs">
                        默认主干
                      </Badge>
                    )}
                    <Badge variant={m.status === "loaded" ? "brand" : "neutral"} size="xs">
                      {m.status === "loaded" ? "已常驻显存" : "就绪待命"}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-[#8a97a8] leading-relaxed">{m.desc}</p>
              </div>

              <div className="pt-2 border-t border-[#1e2f47]/60 flex items-center justify-between text-xs">
                <div className="font-mono text-[#8a97a8]">
                  <span>文件: {m.size}</span>
                  <span className="mx-2">·</span>
                  <span className="text-[#00e0b8]">常驻: {m.vram}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<Play className="w-3 h-3 text-[#00e0b8]" />}
                    onClick={() => handleWarmup(m.name)}
                  >
                    预热测试
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onShowToast("info", `${m.name} 状态已更新`)}
                  >
                    {m.status === "loaded" ? "释放显存" : "载入显存"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Env */}
      {activeTab === "env" && (
        <Card title="计算依赖栈自检诊断 (Dependency Stack)">
          <div className="divide-y divide-[#1e2f47]/50 text-xs">
            {[
              {
                item: "PyTorch 核心运行时",
                ver: "2.4.0+cu124",
                status: "pass",
                note: "FlashAttention-2 已开启",
              },
              {
                item: "NVIDIA CUDA 驱动",
                ver: "12.4 (Driver 550.54)",
                status: "pass",
                note: "RTX 4090 24GB 支持正常",
              },
              {
                item: "TensorRT 推理加速引擎",
                ver: "10.2.0",
                status: "pass",
                note: "FP8 权重加速算子就绪",
              },
              {
                item: "FFmpeg 硬件编解码器",
                ver: "6.1.1 (h264_nvenc)",
                status: "pass",
                note: "NVENC 硬件加速启用",
              },
              {
                item: "本地遥测聚合服务",
                ver: "6.0 (Bun/Node 22)",
                status: "pass",
                note: "单端口 3031 监听中",
              },
            ].map((env, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#e8f0f8]">{env.item}</span>
                  <span className="font-mono text-[11px] text-[#00e0b8] ml-2">v{env.ver}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#8a97a8]">{env.note}</span>
                  <Badge variant="brand" size="xs">
                    健康 PASS
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: Disk Visualization (Requirement 2.2) */}
      {activeTab === "disk" && (
        <div className="space-y-4">
          <Card title="本地 NVMe 存储划分环形分布与大文件管理">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
              {/* Ring / Bar Distribution */}
              <div className="space-y-3">
                <div className="flex justify-between text-[#8a97a8]">
                  <span>NVMe 固态硬盘总占用 (Samsung 990 PRO 2TB)</span>
                  <span className="font-mono text-[#00e0b8] font-bold">
                    642 GB / 1,860 GB (34.5%)
                  </span>
                </div>
                <div className="w-full bg-[#15294a] h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#00e0b8] h-full"
                    style={{ width: "18%" }}
                    title="模型权重 340GB"
                  />
                  <div
                    className="bg-[#00b4d8] h-full"
                    style={{ width: "10%" }}
                    title="输出视频 180GB"
                  />
                  <div
                    className="bg-[#ff7a45] h-full"
                    style={{ width: "6.5%" }}
                    title="临时切片 122GB"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 rounded bg-[#15294a]">
                    <div className="text-[10px] text-[#8a97a8]">模型权重</div>
                    <div className="font-mono text-sm font-bold text-[#00e0b8]">340 GB</div>
                  </div>
                  <div className="p-2 rounded bg-[#15294a]">
                    <div className="text-[10px] text-[#8a97a8]">输出视频</div>
                    <div className="font-mono text-sm font-bold text-[#00b4d8]">180 GB</div>
                  </div>
                  <div className="p-2 rounded bg-[#15294a]">
                    <div className="text-[10px] text-[#8a97a8]">临时缓存</div>
                    <div className="font-mono text-sm font-bold text-[#ff7a45]">122 GB</div>
                  </div>
                </div>
              </div>

              {/* Large File Cleaner List */}
              <div className="space-y-2">
                <span className="font-semibold text-[#e8f0f8]">大文件占用排行：</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-[#15294a]">
                    <span className="text-[#8a97a8] truncate max-w-xs">
                      diffsynth-h3-v2.1.safetensors
                    </span>
                    <span className="text-[#00e0b8]">14.8 GB</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#15294a]">
                    <span className="text-[#8a97a8] truncate max-w-xs">
                      diffsynth-h3-v2.0-fast.bin
                    </span>
                    <span className="text-[#00e0b8]">9.2 GB</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#15294a]">
                    <span className="text-[#8a97a8] truncate max-w-xs">
                      eval-cache-temp-frames-4k.tar
                    </span>
                    <span className="text-[#ff7a45]">98.4 GB</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onShowToast("success", "已清理 98.4GB 临时评估切片缓存")}
                  >
                    一键清理评估切片缓存 (释放 98GB)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: Performance Benchmarks (Requirement 2.2) */}
      {activeTab === "benchmarks" && (
        <Card title="模型多分辨率性能基准对比 (Hardware Benchmark)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1e2f47] text-[#8a97a8] bg-[#15294a]">
                  <th className="py-2.5 px-3">模型权重</th>
                  <th className="py-2.5 px-3">分辨率</th>
                  <th className="py-2.5 px-3">推理速度 (s/step)</th>
                  <th className="py-2.5 px-3">单批生成耗时</th>
                  <th className="py-2.5 px-3">显存峰值 (FP8)</th>
                  <th className="py-2.5 px-3">推荐场景</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2f47]/50">
                {[
                  {
                    name: "DiffSynth H3 v2.1-HQ",
                    res: "1080x1920 (4K超分)",
                    speed: "0.82s",
                    total: "42.8s",
                    vram: "19.4 GB",
                    scene: "权威新闻早报、商业定制",
                  },
                  {
                    name: "DiffSynth H3 v2.1-HQ",
                    res: "720x1280 (高清)",
                    speed: "0.45s",
                    total: "24.1s",
                    vram: "14.2 GB",
                    scene: "社交媒体短视频、日常播报",
                  },
                  {
                    name: "DiffSynth H3 v2.0-Fast",
                    res: "1080x1920",
                    speed: "0.52s",
                    total: "28.5s",
                    vram: "15.6 GB",
                    scene: "电商带货高频产出",
                  },
                  {
                    name: "DiffSynth H3 v2.0-Fast",
                    res: "720x1280",
                    speed: "0.28s",
                    total: "14.8s",
                    vram: "9.8 GB",
                    scene: "极速预览、创意探索",
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#15294a]/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#e8f0f8]">{row.name}</td>
                    <td className="py-2.5 px-3 text-[#00b4d8]">{row.res}</td>
                    <td className="py-2.5 px-3 text-[#00e0b8]">{row.speed}</td>
                    <td className="py-2.5 px-3 text-[#e8f0f8]">{row.total}</td>
                    <td className="py-2.5 px-3 text-[#00e0b8] font-bold">{row.vram}</td>
                    <td className="py-2.5 px-3 text-[#8a97a8] font-sans">{row.scene}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 | 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
