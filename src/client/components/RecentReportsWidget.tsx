import React from "react";
import { SavedReportItem } from "../types/history.ts";
import { AnalysisResponse } from "../types/insight.ts";
import { calculateReportingPeriod } from "../utils/periodUtils.ts";
import { History, ExternalLink, Calendar, Star } from "lucide-react";

interface RecentReportsWidgetProps {
  history: SavedReportItem[];
  onOpenReport: (data: AnalysisResponse) => void;
  onViewAllHistory: () => void;
}

export const RecentReportsWidget: React.FC<RecentReportsWidgetProps> = ({
  history,
  onOpenReport,
  onViewAllHistory,
}) => {
  const recentItems = history.slice(0, 5);

  if (recentItems.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Recent Client Analyses</h3>
            <p className="text-[11px] text-slate-400">Quickly reopen previous client reports</p>
          </div>
        </div>

        <button
          onClick={onViewAllHistory}
          className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
        >
          <span>View All ({history.length})</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {recentItems.map((item) => {
          const periodInfo = calculateReportingPeriod(item.daysCount);
          const dateStr = new Date(item.reportDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={item.id}
              onClick={() => onOpenReport(item.analysisData)}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 hover:border-cyan-500/50 hover:bg-slate-950 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                      item.riskLevel === "High"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : item.riskLevel === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {item.riskLevel} Risk
                  </span>
                  {item.isStarred && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                </div>

                <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition truncate mt-1">
                  {item.clientName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{periodInfo.badgeText}</div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{dateStr}</span>
                </span>
                <span className="text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                  <span>Open</span>
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
