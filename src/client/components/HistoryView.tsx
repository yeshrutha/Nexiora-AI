import React, { useState } from "react";
import { SavedReportItem } from "../types/history.ts";
import { AnalysisResponse } from "../types/insight.ts";
import { calculateReportingPeriod } from "../utils/periodUtils.ts";
import {
  Search,
  History,
  Star,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Check,
  X,
  Copy,
  Cpu,
} from "lucide-react";

interface HistoryViewProps {
  history: SavedReportItem[];
  onOpenReport: (data: AnalysisResponse) => void;
  onToggleStar: (id: string) => void;
  onRenameReport: (id: string, newName: string) => void;
  onDeleteReport: (id: string) => void;
  onDuplicateReport?: (id: string) => void;
  onClearHistory: () => void;
  filterStarredOnly?: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenReport,
  onToggleStar,
  onRenameReport,
  onDeleteReport,
  onDuplicateReport,
  onClearHistory,
  filterStarredOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const filteredHistory = history.filter((item) => {
    const matchesStar = filterStarredOnly ? item.isStarred : true;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.clientName.toLowerCase().includes(q) ||
      item.riskLevel.toLowerCase().includes(q) ||
      item.providerUsed.toLowerCase().includes(q);
    return matchesStar && matchesSearch;
  });

  const handleStartRename = (item: SavedReportItem) => {
    setEditingId(item.id);
    setEditingName(item.clientName);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameReport(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {filterStarredOnly ? <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> : <History className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {filterStarredOnly ? "Saved Reports" : "Analysis History"}
            </h1>
            <p className="text-xs text-slate-400">
              {filterStarredOnly
                ? "Bookmarked clinical intelligence reports"
                : "Locally persisted reports — reopen instantly without re-analyzing"}
            </p>
          </div>
        </div>

        {history.length > 0 && !filterStarredOnly && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all analysis history?")) {
                onClearHistory();
              }
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, risk level, or extraction engine..."
          className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Reports List */}
      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 space-y-2">
          {filterStarredOnly ? (
            <Star className="h-10 w-10 text-amber-400/50" />
          ) : (
            <History className="h-10 w-10 text-slate-600" />
          )}
          <p className="text-sm font-semibold text-slate-300">
            {filterStarredOnly ? "No saved reports bookmarked yet." : "No analysis history recorded."}
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            {filterStarredOnly
              ? "Click the star icon on any report in History to add it to your Saved Reports."
              : "Completed conversation analyses automatically appear here for instant offline access."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const periodInfo = calculateReportingPeriod(item.daysCount);
            const dateStr = new Date(item.reportDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 gap-4 hover:border-slate-700 transition shadow-md"
              >
                {/* Left Info */}
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  {/* Star Toggle Button */}
                  <button
                    onClick={() => onToggleStar(item.id)}
                    className="mt-1 flex-shrink-0 text-slate-500 hover:text-amber-400 transition"
                    title={item.isStarred ? "Remove from Saved" : "Save Report"}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        item.isStarred ? "text-amber-400 fill-amber-400" : "text-slate-600 hover:text-amber-400"
                      }`}
                    />
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Client Name / Rename Input */}
                    {editingId === item.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="rounded-lg bg-slate-950 border border-cyan-500 px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="rounded p-1 bg-emerald-500/20 text-emerald-400"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded p-1 bg-slate-800 text-slate-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition">
                          {item.clientName}
                        </h3>
                        <button
                          onClick={() => handleStartRename(item)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition"
                          title="Rename report"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Tags & Engine Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {periodInfo.title} ({periodInfo.badgeText})
                      </span>
                      <span className="flex items-center space-x-1 font-mono text-slate-400">
                        <Cpu className="h-3 w-3 text-cyan-400" />
                        <span>Engine: {item.providerUsed}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span>{dateStr}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badges & Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  {/* Risk Badge */}
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                      item.riskLevel === "High"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : item.riskLevel === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {item.riskLevel} Risk
                  </span>

                  {/* Open Report CTA */}
                  <button
                    onClick={() => onOpenReport(item.analysisData)}
                    className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3 py-1.5 text-xs font-bold shadow-md transition active:scale-95"
                  >
                    <span>Open Report</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  {/* Duplicate Button */}
                  {onDuplicateReport && (
                    <button
                      onClick={() => onDuplicateReport(item.id)}
                      className="text-slate-500 hover:text-cyan-400 transition p-1.5 rounded-lg hover:bg-slate-800"
                      title="Duplicate report entry"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteReport(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-slate-800"
                    title="Delete report from history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
