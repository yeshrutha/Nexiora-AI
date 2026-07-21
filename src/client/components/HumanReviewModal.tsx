import React, { useState } from "react";
import { InsightResult } from "../types/insight.ts";
import { calculateReportingPeriod } from "../utils/periodUtils.ts";
import { CheckCircle, Edit3, XCircle, Save, X, Sparkles, ShieldCheck } from "lucide-react";

interface HumanReviewModalProps {
  insight: InsightResult;
  daysCount?: number;
  onSave: (updatedInsight: InsightResult) => void;
  onClose: () => void;
  reviewStatus: "draft" | "approved" | "rejected";
  setReviewStatus: (status: "draft" | "approved" | "rejected") => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  insight,
  daysCount = 1,
  onSave,
  onClose,
  reviewStatus,
  setReviewStatus,
}) => {
  const periodInfo = calculateReportingPeriod(daysCount);

  const [editedWeeklySummary, setEditedWeeklySummary] = useState(insight.weeklySummary.value);
  const [editedSleep, setEditedSleep] = useState(insight.sleep.value);
  const [editedNutrition, setEditedNutrition] = useState(insight.nutritionAdherence.value);
  const [editedSymptoms, setEditedSymptoms] = useState(insight.symptoms.value);
  const [editedCoachAction, setEditedCoachAction] = useState(insight.coachAction.value);
  const [editedRiskLevel, setEditedRiskLevel] = useState<"Low" | "Medium" | "High">(insight.riskLevel.value);

  const handleSaveAndApprove = () => {
    const updated: InsightResult = {
      ...insight,
      weeklySummary: { ...insight.weeklySummary, value: editedWeeklySummary, category: "Confirmed Fact" },
      sleep: { ...insight.sleep, value: editedSleep },
      nutritionAdherence: { ...insight.nutritionAdherence, value: editedNutrition },
      symptoms: { ...insight.symptoms, value: editedSymptoms },
      coachAction: { ...insight.coachAction, value: editedCoachAction },
      riskLevel: { ...insight.riskLevel, value: editedRiskLevel },
    };
    onSave(updated);
    setReviewStatus("approved");
    onClose();
  };

  const handleReject = () => {
    setReviewStatus("rejected");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Human-in-the-Loop Clinical Review</h2>
              <p className="text-xs text-slate-400">Review and edit AI extracted metrics for {periodInfo.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4 text-xs">
          {/* Risk Level Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Assessed Risk Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEditedRiskLevel(level)}
                  className={`py-2 rounded-xl font-bold border transition ${
                    editedRiskLevel === level
                      ? level === "High"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : level === "Medium"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  {level} Risk
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Period Summary Label */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">{periodInfo.summaryLabel}</label>
            <textarea
              value={editedWeeklySummary}
              onChange={(e) => setEditedWeeklySummary(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Coach Action Recommendation */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Coach Action Recommendation</label>
            <input
              type="text"
              value={editedCoachAction}
              onChange={(e) => setEditedCoachAction(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Core Metrics Grid Edit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Sleep Value</label>
              <input
                type="text"
                value={editedSleep}
                onChange={(e) => setEditedSleep(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Nutrition Value</label>
              <input
                type="text"
                value={editedNutrition}
                onChange={(e) => setEditedNutrition(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Symptoms Reported</label>
              <input
                type="text"
                value={editedSymptoms}
                onChange={(e) => setEditedSymptoms(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleReject}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
          >
            <XCircle className="h-4 w-4" />
            <span>Reject / Request Re-analysis</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndApprove}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve & Finalize Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
