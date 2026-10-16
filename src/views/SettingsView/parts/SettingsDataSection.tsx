/**
 * file: src/views/SettingsView/parts/SettingsDataSection.tsx
 * description: YYC³ 设置视图分区 — 数据主权（本地持久化）：全量导出 / 导入（P4-3）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[settings],[data-sovereignty]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: 数据主权分区 — 导出：调用注入的 exportAll 通道取信封 JSON，构造
 *        Blob + 隐藏锚点触发浏览器下载（yyc3-mh3-export-{时间戳}.json）；
 *        导入：隐藏 file input（label 按钮触发）→ FileReader 读文本 →
 *        importAll 通道写回 → toast 汇报（成功含条数与跳过明细，失败含原因），
 *        成功后提示刷新页面经端口重新水合生效。数据通道经 props 注入
 *        （分层红线：views 禁触 app/adapters），模式标注与组合根 auto 探测同源。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../../../types
 * exports: SettingsDataSectionProps, SettingsDataSection
 */
import { Database, Download, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { Badge, Button, Card } from "../../../components/common";
import { ExportEnvelope, ImportResult, ImportSkipped } from "../../../types";

/** 数据通道契约（app 层 page.tsx 装配注入；结构与 usecases 签名对齐） */
export interface SettingsDataSectionProps {
  dataPortability: {
    /** 全量导出：返回信封 JSON 字符串（导出留痕在通道内部完成） */
    exportAll: () => Promise<string>;
    /** 全量导入：文本入参，返回判别联合结果（校验失败不抛错） */
    importAll: (json: string) => Promise<ImportResult>;
  };
  onShowToast: (type: "success" | "error" | "warning" | "info", msg: string, sub?: string) => void;
}

/** 当前持久化模式标注（运行时探测，与组合根 auto 回退判定同源） */
const PERSISTENCE_MODE_LABEL =
  typeof indexedDB !== "undefined" ? "IndexedDB 本地持久化" : "内存会话（无持久化）";

/** 导出文件名时间戳：YYYYMMDD-HHmmss（本地时区） */
function formatStamp(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** 跳过明细收敛为 toast 副文案（仅收集非空注明，诚实呈现降级通道） */
function joinSkippedNotes(skipped: ImportSkipped): string {
  return [skipped.batches, skipped.alarms, skipped.services, skipped.metrics]
    .filter((note): note is string => typeof note === "string" && note.length > 0)
    .join("；");
}

export const SettingsDataSection: React.FC<SettingsDataSectionProps> = ({
  dataPortability,
  onShowToast,
}) => {
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 导出：信封 JSON → Blob 下载（隐藏锚点触发，用毕即回收 objectURL） */
  const handleExport = async (): Promise<void> => {
    setBusy("export");
    try {
      const json = await dataPortability.exportAll();
      const envelope = JSON.parse(json) as ExportEnvelope;
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `yyc3-mh3-export-${formatStamp(new Date())}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      onShowToast(
        "success",
        `数据导出成功（批次 ${envelope.batches.length} · 种子 ${envelope.seeds.length} · 日志 ${envelope.telemetry.logs.length}）`,
        "JSON 信封已下载至本地（含遥测四事件表与导出留痕），可在其他浏览器导入恢复",
      );
    } catch {
      onShowToast("error", "数据导出失败", "本地端口读取异常，请稍后重试（详见控制台留痕）");
    } finally {
      setBusy(null);
    }
  };

  /** 导入：FileReader 读文本 → 注入通道写回 → toast 结果（成功提示刷新水合） */
  const handleImportFile = (file: File): void => {
    setBusy("import");
    const reader = new FileReader();
    reader.onload = (): void => {
      void dataPortability
        .importAll(String(reader.result ?? ""))
        .then((result) => {
          if (result.ok) {
            const notes = joinSkippedNotes(result.skipped);
            onShowToast(
              "success",
              `数据导入成功（批次 ${result.imported.batches} · 种子 ${result.imported.seeds} · 日志 ${result.imported.logs} · 告警 ${result.imported.alarms} · 服务 ${result.imported.services} · 指标 ${result.imported.metrics}）`,
              notes ? `${notes} · 刷新页面后生效` : "导入完成，刷新页面后经端口重新水合生效",
            );
          } else {
            onShowToast("error", "数据导入失败", result.error);
          }
        })
        .catch(() => onShowToast("error", "数据导入失败", "导入通道异常，请稍后重试"))
        .finally(() => setBusy(null));
    };
    reader.onerror = (): void => {
      setBusy(null);
      onShowToast("error", "文件读取失败", "请重新选择本应用导出的 JSON 信封文件");
    };
    reader.readAsText(file);
  };

  return (
    <Card
      title="数据主权（本地持久化）"
      subtitle="全量导出 / 导入 · 数据 100% 留在本地，不发起任何外网回传"
      badge={
        <Badge variant="brand" size="xs">
          <Database className="w-3 h-3 mr-1" />
          {PERSISTENCE_MODE_LABEL}
        </Badge>
      }
    >
      <div className="space-y-4 text-xs max-w-xl">
        <p className="text-[#8b949e] leading-relaxed">
          导出内容：批次、种子与遥测四事件表（服务 / 指标 / 告警 / 日志）聚合为带版本校验的 JSON
          信封；导入前经形状校验，非法文件不会写入本地库。当前持久化模式：
          <span className="text-[#00d4aa] font-semibold">{PERSISTENCE_MODE_LABEL}</span>。
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            loading={busy === "export"}
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => void handleExport()}
          >
            导出全部数据
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = ""; // 允许重复选择同一文件
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={busy === "import"}
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => fileInputRef.current?.click()}
          >
            导入 JSON 备份
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-[#122340] border border-[#30363d] text-[11px] text-[#8b949e] space-y-1">
          <p>
            {
              "· 导出文件名：yyc3-mh3-export-{YYYYMMDD-HHmmss}.json，导出同时在本地留痕（last-export-meta）。"
            }
          </p>
          <p>
            · 导入按 id 去重合并（不覆盖现有数据）：批次 / 种子 / 日志 / 告警 / 服务 /
            指标六表全量写回；个别装配缺失写通道时诚实注明跳过。
          </p>
          <p>· 导入完成后刷新页面，新数据经端口重新水合生效。</p>
        </div>
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
