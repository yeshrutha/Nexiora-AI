import React from "react";
import { FieldInsight } from "../types/insight.ts";
import { CheckCircle, AlertCircle, HelpCircle, FileText, ChevronRight, Sparkles } from "lucide-react";

interface MetricCardProps {
  title: string;
  insight: FieldInsight;
  icon: React.ReactNode;
  onSelectEvidence: (lineIds: string[]) => void;
  isSelected?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  insight,
  icon,
  onSelectEvidence,
  isSelected = false,
}) => {
  const isMissing = insight.category === "Missing Information" || insight.confidence === 0;

  const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
    "Confirmed Fact": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    "Client Reported": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    "AI Inference": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
    "Missing Information": { bg: "bg-slate-800/50", text: "text-slate-400", border: "border-slate-700/50" },
  };

  const style = categoryColorMap[insight.category] || categoryColorMap["Missing Information"];

  const evidenceLineIds = insight.evidence.map((e) => e.lineId);
  const evidenceCount = insight.evidence.length;

  const handleClick = () => {
    if (evidenceLineIds.length > 0) {
      onSelectEvidence(evidenceLineIds);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
          : isMissing
          ? "border-slate-800/80 bg-slate-900/40 opacity-70 hover:opacity-100 hover:border-slate-700"
          : "border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-900 shadow-md"
      }`}
    >
      {/* Subtle top indicator glow */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
      )}

      <div>
        {/* Card Header: Icon, Title, Confidence Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700/60 group-hover:scale-105 transition-transform">
              {icon}
            </div>
            <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              {title}
            </h3>
          </div>

          {/* Confidence Meter Badge */}
          <div
            className={`flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
              isMissing
                ? "bg-slate-800/80 text-slate-500 border-slate-700"
                : insight.confidence >= 80
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            <span>{isMissing ? "N/A" : `${insight.confidence}% Confident`}</span>
          </div>
        </div>

        {/* Value Display */}
        <div className="mb-3">
          <div
            className={`text-base font-semibold leading-snug line-clamp-2 ${
              isMissing ? "text-slate-500 italic font-normal text-xs" : "text-white"
            }`}
          >
            {insight.value}
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
          >
            {insight.category === "Confirmed Fact" && <CheckCircle className="h-3 w-3" />}
            {insight.category === "Missing Information" && <HelpCircle className="h-3 w-3" />}
            <span>{insight.category}</span>
          </span>
        </div>

        {/* Recommendation (if present) */}
        {insight.recommendation && (
          <div className="mt-2 rounded-xl bg-slate-950/70 p-2.5 text-[11px] text-slate-300 border border-slate-800/80">
            <div className="font-bold text-cyan-400 text-[10px] uppercase tracking-wider mb-0.5 flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Coach Recommendation</span>
            </div>
            <p className="line-clamp-2 text-slate-300">{insight.recommendation}</p>
          </div>
        )}
      </div>

      {/* Footer: Evidence Link Trigger */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400 group-hover:text-cyan-400 transition-colors">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-medium text-[11px]">
            {evidenceCount === 0 ? "No direct evidence" : `${evidenceCount} Evidence Line${evidenceCount === 1 ? "" : "s"}`}
          </span>
        </div>
        {evidenceCount > 0 && (
          <span className="flex items-center space-x-0.5 text-[11px] font-semibold text-cyan-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>Trace Line</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};
