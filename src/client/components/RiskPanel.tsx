import React from "react";
import { RiskFlag, RiskLevelSummary } from "../types/insight.ts";
import { AlertTriangle, ShieldAlert, ShieldCheck, FileText, ChevronRight, Sparkles } from "lucide-react";

interface RiskPanelProps {
  overallRisk: RiskLevelSummary;
  riskFlags: RiskFlag[];
  onSelectEvidence: (lineIds: string[]) => void;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({
  overallRisk,
  riskFlags,
  onSelectEvidence,
}) => {
  const levelStyleMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
    High: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
      iconBg: "bg-rose-500/20 text-rose-400",
    },
    Medium: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      iconBg: "bg-amber-500/20 text-amber-400",
    },
    Low: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/20 text-emerald-400",
    },
  };

  const overallStyle = levelStyleMap[overallRisk.value] || levelStyleMap["Low"];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-5">
      {/* Header & Overall Level Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${overallStyle.iconBg} ${overallStyle.border}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Risk Intelligence & Safety Monitor</h2>
            <p className="text-xs text-slate-400">Automated triage for emotional strain & physical symptoms</p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div className={`flex items-center space-x-2 rounded-xl border px-4 py-2 ${overallStyle.bg} ${overallStyle.border}`}>
          <span className="text-xs text-slate-400 font-medium">Overall Status:</span>
          <span className={`text-sm font-extrabold ${overallStyle.text}`}>{overallRisk.value} Risk</span>
          <span className="text-[10px] text-slate-400 font-mono">({overallRisk.confidence}% Confident)</span>
        </div>
      </div>

      {/* Rationale Statement */}
      <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800/80 text-xs text-slate-300">
        <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
          Clinical Rationale
        </div>
        <p className="leading-relaxed">{overallRisk.rationale}</p>
      </div>

      {/* Flagged Risks List */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Flagged Risk Factors ({riskFlags.length})</span>
          <span className="text-[10px] text-cyan-400 font-mono">Click card to highlight evidence</span>
        </h3>

        {riskFlags.length === 0 ? (
          <div className="flex items-center space-x-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-300">
            <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>No concerning risk indicators detected in this conversation.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {riskFlags.map((flag) => {
              const flagStyle = levelStyleMap[flag.level] || levelStyleMap["Low"];
              const lineIds = flag.evidence.map((e) => e.lineId);

              return (
                <div
                  key={flag.id}
                  onClick={() => lineIds.length > 0 && onSelectEvidence(lineIds)}
                  className={`group flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${flagStyle.bg} ${flagStyle.border} hover:scale-[1.01]`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${flagStyle.text}`}>{flag.label}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${flagStyle.bg} ${flagStyle.text} ${flagStyle.border}`}>
                        {flag.level} Severity
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">{flag.rationale}</p>
                  </div>

                  {/* Evidence Quotes */}
                  <div className="border-t border-slate-800/60 pt-2.5 mt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5 text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{flag.evidence.length} Supporting Evidence Lines ({lineIds.join(", ")})</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-cyan-400 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
