---
file: 08-Linux采集源预研.md
description: YYC3-MH3 Linux 宿主采集源预研（案头） - impl-expert - 2026-10-16
author: AI Tutor <impl-expert>
version: v1.0.0
created: 2026-10-16
updated: 2026-10-16
status: active
tags: [research],[registry],[collector],[linux]
category: report
---

# 🔬 Linux 宿主采集源预研（案头研究）

> **定位**：07 立项会 D-3 交付物。与 [04 预研](../YYC3-MH3-impl-expert-20261011/04-Registry真实采集可行性预研.md)（darwin 侧）对偶，补齐 Linux 宿主的数据源矩阵与跨平台架构基线，为 PR-13 重启时「双平台一次实现」提供依据。
>
> **方法声明**：本篇为**案头研究**（内核文档/事实标准级），全部实证项已标注 `待实证`；无内网 Linux 宿主可即时验证（192.168.3.45 为 Gitea 服务机，未建立 SSH 工作通道）。

## 一、采集面矩阵（对齐 04 预研 L1/L2 分级）

### 1.1 OpsMetric 字段

| 字段 | Linux 数据源（零 npm 依赖） | 可行性 | 备注 |
| ---- | ---- | ---- | ---- |
| cpuUtil | `/proc/stat` 双采样差分（idle/total delta，与 darwin `os.cpus()` 同构） | ✅ `待实证` | procfs 为稳定内核 ABI，格式十余年未变 |
| memUtil | `/proc/meminfo`（MemTotal − MemAvailable）/ MemTotal | ✅ `待实证` | 注意用 MemAvailable 而非 MemFree（页缓存语义） |
| gpuUtil | **NVIDIA**：`nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader`（驱动自带二进制）<br>**AMD**：`/sys/class/drm/card*/device/gpu_busy_percent`（amdgpu 内核 ≥4.x 直接暴露，纯 sysfs 免外部二进制） | ✅ 依 GPU 栈 `待实证` | LANG=C 环境守卫防输出本地化；无 GPU 栈 → L2 回退 |
| gpuVram | NVIDIA：同上 `memory.used`；AMD：`/sys/class/drm/card*/device/mem_info_vram_used`（字节） | ✅ 依 GPU 栈 `待实证` | 与 darwin 统一内存语义不同（独占显存），换算口径一致（→GB） |
| diskIops | `/proc/diskstats` 差分（完成读写扇区数 / 采样间隔） | ✅ `待实证` | 纯内核接口，免 iostat 外部命令（比 darwin 的 iostat 更稳） |
| temp | `/sys/class/thermal/thermal_zone*/temp` + `type`（内核接口，**免 sudo**） | ✅ `待实证` | **优于 darwin**：macOS temp 必须 sudo powermetrics，Linux sysfs 用户态可读；GPU 温度走 nvidia-smi `temperature.gpu` |

### 1.2 ServiceStatus / LogEntry

同 darwin 侧结论：`node:net` connect 探测跨平台通用（`待实证`）；真实日志流仍受「无产生源」限制，L3 不变。

## 二、跨平台架构基线（PR-13 实现建议）

```
server/collector/
├── index.ts        createCollector({ platform? }) → 自动探测 process.platform 分发
├── core.ts         懒采样调度 + 环形缓冲（24h×5min）+ 守卫回退（L2 口径）——平台无关
├── darwin.ts       ioreg / iostat / os.cpus（04 预研实证路径）
└── linux.ts        /proc/stat、/proc/meminfo、/proc/diskstats、sysfs、nvidia-smi（探测式）
```

- **core 收敛**：两平台仅「取原始读数」差异，差分/换算/缓冲/回退全部收敛 core——04 预研架构的自然延伸
- **GPU 探测式降级**：nvidia-smi 不存在 → 试 amdgpu sysfs → 全无 → L2 演示回退（绝不冒泡前端，双保险既有防线）
- **platform 守卫**：非 darwin/linux（如 Windows）→ 整体回退演示语义（04 既有口径）

## 三、风险登记（Linux 特有）

| 风险 | 等级 | 缓解 |
| --- | --- | --- |
| 容器化部署下 `/proc` 为**宿主视角**（cgroup 限额不体现） | 🟡 | 若 BFF 容器化：cgroup v2 `/sys/fs/cgroup/*.stat` 差分作为容器口径备选；物理机/虚拟机部署则无此问题——**部署形态是 T4/D1-a 的关联决策项** |
| nvidia-smi 输出本地化（中文环境小数点/字段名漂移） | 🟡 | spawn 时 `env: { LANG: "C" }` + 解析守卫 |
| 多 GPU 卡（card0/card1…）语义映射 | 低 | 采集目标为「生产线宿主单卡」叙事，多卡取首可用 + 备注 |
| sysfs 键面随内核版本差异（thermal_zone 命名） | 低 | type 字段匹配 + 守卫回退 |

## 四、实证待办（重启 PR-13 时先行执行）

1. 在任一内网 Linux 宿主跑通 04 同款实证脚本（procfs/sysfs 六字段逐项读数截图留档）
2. GPU 栈探测顺序实测（nvidia-smi → amdgpu sysfs → 回退）
3. 容器 vs 物理机 `/proc/stat` 口径对照（若 D1-a 选容器化部署）

## 五、预研结论

> **Linux 侧可行性不低于 darwin**：六字段中五个（cpu/mem/disk/temp/GPU-NVIDIA）有稳定内核级接口，且 temp 免 sudo 优于 macOS；唯 GPU 指标依 GPU 栈存在性走探测式降级。与 04 预研合并后，「双平台一次实现」的 PR-13 架构成本增量 ≈ 一个 `linux.ts` 适配文件。**建议 PR-13 重启时直接按跨平台架构实施，不再单平台先行。**

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | ---- | ---- |
| v1.0.0 | 2026-10-16 | 案头预研创建（六字段矩阵 + 跨平台架构 + 容器化风险） | YanYuCloudCube Team |
