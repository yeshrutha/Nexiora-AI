import React, { useState, useEffect, useRef, useMemo } from "react";
import { ParsedLine, InsightResult } from "../types/insight.ts";
import {
  Search,
  User,
  Stethoscope,
  MessageSquare,
  X,
  Target,
  Info,
  Calendar,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface EvidenceViewerProps {
  lines: ParsedLine[];
  daysCovered: string[];
  missingDays?: string[];
  selectedLineIds: string[];
  insight?: InsightResult;
  onClearSelection: () => void;
}

export interface LineEvidenceMapItem {
  metricTitles: string[];
  badges: Array<{ label: string; emoji: string; colorClass: string }>;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  lines,
  daysCovered,
  missingDays = [],
  selectedLineIds,
  insight,
  onClearSelection,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState<"all" | "client" | "coach">("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [activeHoverLineId, setActiveHoverLineId] = useState<string | null>(null);

  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Build Comprehensive Line Evidence Mapping from Insight Payload
  const lineEvidenceMap = useMemo(() => {
    const map: Record<string, LineEvidenceMapItem> = {};
    if (!insight) return map;

    const addReference = (
      lineId: string,
      metricTitle: string,
      badgeLabel: string,
      emoji: string,
      colorClass: string
    ) => {
      if (!lineId) return;
      if (!map[lineId]) {
        map[lineId] = { metricTitles: [], badges: [] };
      }
      if (!map[lineId].metricTitles.includes(metricTitle)) {
        map[lineId].metricTitles.push(metricTitle);
      }
      if (!map[lineId].badges.some((b) => b.label === badgeLabel)) {
        map[lineId].badges.push({ label: badgeLabel, emoji, colorClass });
      }
    };

    // Sleep
    insight.sleep?.evidence?.forEach((e) =>
      addReference(e.lineId, "Sleep & Circadian", "Sleep Evidence", "🛌", "bg-indigo-500/20 text-indigo-300 border-indigo-500/40")
    );
    // Water
    insight.waterIntake?.evidence?.forEach((e) =>
      addReference(e.lineId, "Water & Hydration", "Water Evidence", "💧", "bg-cyan-500/20 text-cyan-300 border-cyan-500/40")
    );
    // Nutrition
    insight.nutritionAdherence?.evidence?.forEach((e) =>
      addReference(e.lineId, "Nutrition & Diet", "Nutrition Evidence", "🥗", "bg-emerald-500/20 text-emerald-300 border-emerald-500/40")
    );
    // Exercise
    insight.exercise?.evidence?.forEach((e) =>
      addReference(e.lineId, "Physical Exercise", "Exercise Evidence", "🏃", "bg-teal-500/20 text-teal-300 border-teal-500/40")
    );
    // Steps
    insight.steps?.evidence?.forEach((e) =>
      addReference(e.lineId, "Steps & Mobility", "Steps Evidence", "🚶", "bg-blue-500/20 text-blue-300 border-blue-500/40")
    );
    // Symptoms
    insight.symptoms?.evidence?.forEach((e) =>
      addReference(e.lineId, "Physical Symptoms", "Symptoms Evidence", "🤒", "bg-rose-500/20 text-rose-300 border-rose-500/40")
    );
    // Stress
    insight.stress?.evidence?.forEach((e) =>
      addReference(e.lineId, "Stress & Workload", "Stress Evidence", "😰", "bg-amber-500/20 text-amber-300 border-amber-500/40")
    );
    // Risk Flags
    insight.riskFlags?.forEach((rf) => {
      rf.evidence?.forEach((e) =>
        addReference(e.lineId, `Risk: ${rf.label}`, "Risk Evidence", "⚠️", "bg-rose-500/25 text-rose-200 border-rose-400/50")
      );
    });
    // Pending Actions
    insight.pendingActions?.forEach((pa) => {
      pa.evidence?.forEach((e) =>
        addReference(e.lineId, "Action Commitment", "Action Evidence", "🎯", "bg-violet-500/20 text-violet-300 border-violet-500/40")
      );
    });
    // Period Summary
    insight.weeklySummary?.evidence?.forEach((e) =>
      addReference(e.lineId, "Period Summary", "Summary Evidence", "📋", "bg-sky-500/20 text-sky-300 border-sky-500/40")
    );

    return map;
  }, [insight]);

  // 2. Timeline Statistics Calculation
  const stats = useMemo(() => {
    const totalDays = daysCovered.length || 1;
    const totalMessages = lines.length;
    const clientMessages = lines.filter((l) => l.speaker === "client").length;
    const coachMessages = lines.filter((l) => l.speaker === "coach").length;
    const evidenceLinesCount = Object.keys(lineEvidenceMap).length;

    return { totalDays, totalMessages, clientMessages, coachMessages, evidenceLinesCount };
  }, [lines, daysCovered, lineEvidenceMap]);

  // 3. Smooth Auto-Scroll & Trace Focus
  useEffect(() => {
    if (selectedLineIds.length > 0) {
      const firstLineId = selectedLineIds[0];
      const targetElement = lineRefs.current[firstLineId];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedLineIds]);

  // 4. Enhanced Search & Metric Keyword Filtering
  const filteredLines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return lines.filter((line) => {
        const matchesSpeaker = speakerFilter === "all" || line.speaker === speakerFilter;
        const matchesDay = selectedDay === "all" || line.day.toLowerCase() === selectedDay.toLowerCase();
        return matchesSpeaker && matchesDay;
      });
    }

    return lines.filter((line) => {
      const matchesSpeaker = speakerFilter === "all" || line.speaker === speakerFilter;
      const matchesDay = selectedDay === "all" || line.day.toLowerCase() === selectedDay.toLowerCase();
      if (!matchesSpeaker || !matchesDay) return false;

      const textMatch = line.text.toLowerCase().includes(q);
      const idMatch = line.id.toLowerCase() === q || line.id.toLowerCase().includes(q);
      const speakerMatch = line.rawSpeakerName.toLowerCase().includes(q);

      const evidenceMeta = lineEvidenceMap[line.id];
      const metricMatch = evidenceMeta?.metricTitles.some((title) => title.toLowerCase().includes(q)) || false;
      const badgeMatch = evidenceMeta?.badges.some((b) => b.label.toLowerCase().includes(q)) || false;

      return textMatch || idMatch || speakerMatch || metricMatch || badgeMatch;
    });
  }, [lines, searchQuery, speakerFilter, selectedDay, lineEvidenceMap]);

  // Highlight extracted numbers and health keywords
  const renderFormattedText = (text: string, isHighlighted: boolean) => {
    const highlightPattern = /(\d+[\d\.,]*\s*(?:hours|hrs|hr|liters|litres|l|glasses|oz|cups|steps|g|kg|lbs|mins|minutes)?|\b(?:headache|knee|shoulder|ankle|sore|aching|pain|tightness|takeout|pizza|junk food|overwhelmed|distress|stress|skipped)\b)/gi;

    const parts = text.split(highlightPattern);
    return parts.map((part, idx) => {
      if (highlightPattern.test(part)) {
        return (
          <mark
            key={idx}
            className={`rounded px-1 py-0.5 font-bold transition ${
              isHighlighted
                ? "bg-cyan-400 text-slate-950 shadow-sm"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            }`}
          >
            {part}
          </mark>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div
      id="evidence-timeline-container"
      role="region"
      aria-label="Interactive Transcript Audit Trail"
      className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[780px]"
    >
      {/* 1. Header & Timeline Statistics Bar */}
      <div className="border-b border-slate-800 bg-slate-950/90 p-4 sm:p-5 space-y-4">
        {/* Title & Trace Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Interactive Transcript Audit Trail</span>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-700">
                  Chronologically Grounded Evidence
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Preserves original transcript timeline and maps verifiably extracted findings.
              </p>
            </div>
          </div>

          {/* Active Highlight Banner */}
          {selectedLineIds.length > 0 && (
            <div className="flex items-center space-x-2 rounded-xl bg-cyan-950/90 px-3.5 py-1.5 border border-cyan-400/60 text-xs text-cyan-300 shadow-lg shadow-cyan-500/10">
              <Target className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="font-semibold">
                Tracing {selectedLineIds.length} Linked Line{selectedLineIds.length === 1 ? "" : "s"} ({selectedLineIds.join(", ")})
              </span>
              <button
                onClick={onClearSelection}
                className="ml-2 rounded-lg p-1 text-cyan-400 hover:bg-cyan-900/60 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
                title="Clear selection highlight"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Timeline Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Recorded Days</div>
              <div className="font-mono font-bold text-white text-xs">{stats.totalDays} Days</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Messages</div>
              <div className="font-mono font-bold text-white text-xs">{stats.totalMessages} Messages</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center space-x-2">
            <User className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Client Messages</div>
              <div className="font-mono font-bold text-cyan-300 text-xs">{stats.clientMessages} Client</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center space-x-2">
            <Stethoscope className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Coach Messages</div>
              <div className="font-mono font-bold text-indigo-300 text-xs">{stats.coachMessages} Coach</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl bg-cyan-950/40 p-2.5 border border-cyan-500/30 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase">Evidence Linked</div>
              <div className="font-mono font-bold text-cyan-300 text-xs">{stats.evidenceLinesCount} Lines</div>
            </div>
          </div>
        </div>

        {/* Missing Days Informational Note */}
        {missingDays && missingDays.length > 0 && (
          <div className="rounded-xl bg-amber-500/10 p-2.5 border border-amber-500/30 flex items-center space-x-2 text-amber-300 text-xs">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Chronological Gap Detected:</strong> Transcript records {daysCovered.length} active check-in days. Skipped day gap(s): <code className="font-mono text-amber-200">{missingDays.join(", ")}</code>. Original user day labels are preserved.
            </span>
          </div>
        )}

        {/* 2. Filter & Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search text, Line ID (L1), Speaker, or Metric (sleep, water)..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Speaker Filter Pills */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setSpeakerFilter("all")}
              className={`flex-1 rounded-lg py-1 font-semibold transition ${
                speakerFilter === "all" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Speakers
            </button>
            <button
              onClick={() => setSpeakerFilter("client")}
              className={`flex-1 rounded-lg py-1 font-semibold transition flex items-center justify-center space-x-1 ${
                speakerFilter === "client" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="h-3 w-3" />
              <span>Client</span>
            </button>
            <button
              onClick={() => setSpeakerFilter("coach")}
              className={`flex-1 rounded-lg py-1 font-semibold transition flex items-center justify-center space-x-1 ${
                speakerFilter === "coach" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Stethoscope className="h-3 w-3" />
              <span>Coach</span>
            </button>
          </div>

          {/* Day Filter Dropdown */}
          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">📅 All Days ({daysCovered.length} Days)</option>
              {daysCovered.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Line-by-Line Transcript Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-950/70">
        {filteredLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
            <Search className="h-8 w-8 opacity-50 text-cyan-400" />
            <p className="text-sm font-medium">No transcript lines match the selected filters or search query.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSpeakerFilter("all");
                setSelectedDay("all");
              }}
              className="text-xs text-cyan-400 underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredLines.map((line) => {
            const isHighlighted = selectedLineIds.includes(line.id);
            const isClient = line.speaker === "client";
            const evidenceMeta = lineEvidenceMap[line.id];
            const isHovered = activeHoverLineId === line.id;

            const displaySpeakerName =
              line.rawSpeakerName && line.rawSpeakerName !== "Unknown"
                ? line.rawSpeakerName
                : isClient
                ? "Client"
                : "Coach";

            return (
              <div
                key={line.id}
                ref={(el) => {
                  lineRefs.current[line.id] = el;
                }}
                onMouseEnter={() => setActiveHoverLineId(line.id)}
                onMouseLeave={() => setActiveHoverLineId(null)}
                tabIndex={0}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isHighlighted
                    ? "evidence-highlight-pulse border-cyan-400 shadow-xl"
                    : isClient
                    ? "border-slate-800/90 bg-slate-900/90 hover:border-slate-700"
                    : "border-slate-800/60 bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                {/* Line ID Badge */}
                <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-mono font-bold border ${
                      isHighlighted
                        ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md"
                        : "bg-slate-800 text-cyan-400 border-slate-700"
                    }`}
                  >
                    {line.id}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">{line.day}</span>
                </div>

                {/* Speaker Avatar Icon */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border flex-shrink-0 mt-0.5 ${
                    isClient
                      ? "bg-cyan-950/80 text-cyan-400 border-cyan-800/50"
                      : "bg-indigo-950/80 text-indigo-400 border-indigo-800/50"
                  }`}
                >
                  {isClient ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                </div>

                {/* Main Line Content & Evidence Badges */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Speaker Header & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold ${
                          isClient ? "text-cyan-300" : "text-indigo-300"
                        }`}
                      >
                        {displaySpeakerName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (Line #{line.lineNumber})
                      </span>
                    </div>

                    {/* Evidence Badges */}
                    {evidenceMeta && evidenceMeta.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {evidenceMeta.badges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${b.colorClass}`}
                          >
                            <span>{b.emoji}</span>
                            <span>{b.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <p className="text-xs text-slate-200 leading-relaxed font-sans select-text">
                    {renderFormattedText(line.text, isHighlighted)}
                  </p>

                  {/* Hover Audit Context Tooltip Box */}
                  {isHovered && evidenceMeta && evidenceMeta.metricTitles.length > 0 && (
                    <div className="mt-2 rounded-xl bg-slate-950/95 p-3 border border-cyan-500/40 text-[11px] text-slate-300 shadow-xl space-y-1 animate-in fade-in duration-150">
                      <div className="font-bold text-cyan-400 flex items-center space-x-1.5 text-[10px] uppercase tracking-wider">
                        <Info className="h-3 w-3 text-cyan-400" />
                        <span>AI Evidence Audit Context — Referenced By ({evidenceMeta.metricTitles.length})</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {evidenceMeta.metricTitles.map((title, tIdx) => (
                          <li key={tIdx} className="font-medium">
                            <span className="text-white">{title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
