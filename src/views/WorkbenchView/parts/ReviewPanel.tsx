/**
 * file: src/views/WorkbenchView/parts/ReviewPanel.tsx
 * description: YYC³ 功能视图 — WorkbenchView 人工复核与优质 Seed 回写面板
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-10-16
 * updated: 2026-10-16
 * status: active
 * tags: [component],[view],[workbench],[yyc3]
 *
 * copyright: YanYuCloudCube Team
 * license: MIT
 *
 * brief: WorkbenchView 右栏人工复核（五星留痕 + 口型/微表情/时序/边缘缺陷清单）
 *        与优质 Seed 采纳回写按钮，逐字搬移自原 WorkbenchView.tsx。
 *
 * dependencies: react, lucide-react, ../../../components/common, ../useWorkbenchView
 * exports: ReviewPanelProps, ReviewPanel
 */
import { CheckCircle2, Dna } from "lucide-react";
import React from "react";
import { Button } from "../../../components/common";
import { DefectChecks } from "../useWorkbenchView";

export interface ReviewPanelProps {
  defectChecks: DefectChecks;
  onDefectCheckChange: (checks: DefectChecks) => void;
  onReviewScoreChange: (score: number) => void;
  isAdopted: boolean;
  onAdoptSeed: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  defectChecks,
  onDefectCheckChange,
  onReviewScoreChange,
  isAdopted,
  onAdoptSeed,
}) => {
  return (
    <div className="p-3.5 rounded-xl bg-[#0f1f38] border border-[#1e2f47] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#e8f0f8]">人工复核与缺陷标记</span>
        <div className="flex items-center gap-1 text-[#ffb830]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onReviewScoreChange(star)}
              className="cursor-pointer hover:scale-110 transition-transform"
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8a97a8]">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={defectChecks.lipSyncAccurate}
            onChange={(e) =>
              onDefectCheckChange({
                ...defectChecks,
                lipSyncAccurate: e.target.checked,
              })
            }
            className="rounded accent-[#00e0b8]"
          />
          <span>口型音素准确</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={defectChecks.microExpressionNatural}
            onChange={(e) =>
              onDefectCheckChange({
                ...defectChecks,
                microExpressionNatural: e.target.checked,
              })
            }
            className="rounded accent-[#00e0b8]"
          />
          <span>微表情自然</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={defectChecks.noTemporalFlicker}
            onChange={(e) =>
              onDefectCheckChange({
                ...defectChecks,
                noTemporalFlicker: e.target.checked,
              })
            }
            className="rounded accent-[#00e0b8]"
          />
          <span>无时序撕裂伪影</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={defectChecks.edgeSharpened}
            onChange={(e) =>
              onDefectCheckChange({
                ...defectChecks,
                edgeSharpened: e.target.checked,
              })
            }
            className="rounded accent-[#00e0b8]"
          />
          <span>毛发与下颌清晰</span>
        </label>
      </div>

      {/* The Key Closed-Loop Action: Adopt Seed & Write Back */}
      <div className="pt-2 border-t border-[#1e2f47]/60">
        <Button
          variant={isAdopted ? "outline" : "primary"}
          size="md"
          className="w-full"
          icon={isAdopted ? <CheckCircle2 className="w-4 h-4 text-[#00e0b8]" /> : <Dna className="w-4 h-4" />}
          onClick={onAdoptSeed}
          disabled={isAdopted}
        >
          {isAdopted ? "已成功采纳并沉淀回写" : "采纳为优质 Seed 并回写种子库"}
        </Button>
        <p className="text-[10px] text-[#8b949e] text-center mt-1.5">
          完成五步闭环：自动更新种子基因参数，反哺后续批次迭代
        </p>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * YYC³ · 言启象限 | 语枢未来 · 万象归元于云枢 · 深栈智启新纪元
 * Words Initiate Quadrants, Language Serves as Core for Future
 * © 2025-2026 YanYuCloudCube Team. All Rights Reserved.
 * -------------------------------------------------------------- */
