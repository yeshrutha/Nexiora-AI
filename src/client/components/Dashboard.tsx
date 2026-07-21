import React, { useState, useEffect, useRef } from "react";
import { AnalysisResponse, InsightResult } from "../types/insight.ts";
import { SavedReportItem, AppSettings } from "../types/history.ts";
import { calculateReportingPeriod } from "../utils/periodUtils.ts";
import { MetricCard } from "./MetricCard.tsx";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { RiskPanel } from "./RiskPanel.tsx";
import { PendingActions } from "./PendingActions.tsx";
import { HumanReviewModal } from "./HumanReviewModal.tsx";
import { JsonViewer } from "./JsonViewer.tsx";
import { RecentReportsWidget } from "./RecentReportsWidget.tsx";
import {
  exportReportAsMarkdown,
  exportReportAsJSON,
  exportReportAsPDF,
} from "../utils/exportReport.ts";
import {
  Activity,
  Apple,
  Dumbbell,
  Footprints,
  Moon,
  Droplet,
  Thermometer,
  Brain,
  Edit3,
  Sparkles,
  Award,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  FileCode,
  Printer,
  ChevronDown,
} from "lucide-react";

interface DashboardProps {
  data: AnalysisResponse;
  onNewAnalysis: () => void;
  history?: SavedReportItem[];
  settings?: AppSettings;
  onOpenReport?: (data: AnalysisResponse) => void;
  onViewAllHistory?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data: initialData,
  onNewAnalysis,
  history = [],
  settings,
  onOpenReport,
  onViewAllHistory,
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse>(initialData);
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  const [selectedMetricTitle, setSelectedMetricTitle] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"draft" | "approved" | "rejected">("draft");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnalysis(initialData);
  }, [initialData]);

  // Click outside listener for export dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const insight = analysis.insight;
  const daysCount = analysis.daysCovered.length || 1;
  const periodInfo = calculateReportingPeriod(daysCount);

  // Automatically show Raw JSON panel when active engine is Insight Analysis Engine (mock)
  const isInsightEngine =
    !analysis.providerUsed ||
    analysis.providerUsed === "mock" ||
    analysis.providerUsed.toLowerCase().includes("insight") ||
    analysis.providerUsed.toLowerCase().includes("heuristic");

  const handleSelectEvidence = (lineIds: string[], metricTitle?: string) => {
    setSelectedLineIds(lineIds);
    if (metricTitle) setSelectedMetricTitle(metricTitle);

    const timelineEl = document.getElementById("evidence-timeline-container");
    if (timelineEl) {
      timelineEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUpdatedInsight = (updatedInsight: InsightResult) => {
    setAnalysis((prev) => ({
      ...prev,
      insight: updatedInsight,
    }));
  };

  const handleExportDefault = () => {
    exportReportAsMarkdown(analysis);
  };

  const coreMetrics = [
    { title: "Sleep & Circadian", insight: insight.sleep, icon: <Moon className="h-4 w-4" /> },
    { title: "Nutrition & Diet", insight: insight.nutritionAdherence, icon: <Apple className="h-4 w-4" /> },
    { title: "Physical Exercise", insight: insight.exercise, icon: <Dumbbell className="h-4 w-4" /> },
    { title: "Steps & Mobility", insight: insight.steps, icon: <Footprints className="h-4 w-4" /> },
    { title: "Water & Hydration", insight: insight.waterIntake, icon: <Droplet className="h-4 w-4" /> },
    { title: "Physical Symptoms", insight: insight.symptoms, icon: <Thermometer className="h-4 w-4" /> },
    { title: "Stress & Workload", insight: insight.stress, icon: <Brain className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Bar (High z-index to un-clip dropdown menu) */}
      <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {periodInfo.title}
            </h1>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20 shadow-sm">
              ⏱ {periodInfo.badgeText}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Source: <span className="font-semibold text-slate-200">{insight.meta?.sourceLabel || "Uploaded File"}</span> • Engine: <span className="font-semibold text-cyan-400">{analysis.providerUsed}</span> ({analysis.modelName || "Insight Engine v1.2"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Human Review Status Button */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-lg ${
              reviewStatus === "approved"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                : reviewStatus === "rejected"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20"
            }`}
          >
            {reviewStatus === "approved" ? (
              <Award className="h-4 w-4 text-emerald-400" />
            ) : reviewStatus === "rejected" ? (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            ) : (
              <Edit3 className="h-4 w-4 text-indigo-400" />
            )}
            <span>
              {reviewStatus === "approved"
                ? "Approved Report"
                : reviewStatus === "rejected"
                ? "Rejected Report"
                : "Human Review"}
            </span>
          </button>

          {/* Export Report Dropdown Menu */}
          <div className="relative" ref={exportMenuRef}>
            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 overflow-hidden shadow-md">
              <button
                onClick={handleExportDefault}
                className="flex items-center space-x-1.5 px-3.5 py-2 hover:bg-slate-700 transition text-cyan-300"
                title="Export Report as Markdown (.md)"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                className="px-2 py-2 border-l border-slate-700 hover:bg-slate-700 transition"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 p-1.5 shadow-2xl z-50 text-xs space-y-1 backdrop-blur-xl animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    exportReportAsMarkdown(analysis);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 transition text-left"
                >
                  <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <span>Markdown (.md)</span>
                </button>

                <button
                  onClick={() => {
                    exportReportAsPDF(analysis);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 transition text-left"
                >
                  <Printer className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <span>PDF / Print</span>
                </button>

                <button
                  onClick={() => {
                    exportReportAsJSON(analysis);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 transition text-left"
                >
                  <FileCode className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Structured JSON (.json)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onNewAnalysis}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 text-xs font-bold shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Analyze New Transcript</span>
          </button>
        </div>
      </div>

      {/* 2. Recent Reports Quick Open Widget */}
      {history.length > 0 && onOpenReport && onViewAllHistory && (
        <RecentReportsWidget
          history={history}
          onOpenReport={onOpenReport}
          onViewAllHistory={onViewAllHistory}
        />
      )}

      {/* 3. High Priority Summary Banner & Key Coach Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MetricCard
            title={periodInfo.summaryLabel}
            insight={insight.weeklySummary}
            icon={<Activity className="h-4 w-4 text-cyan-400" />}
            onSelectEvidence={(ids) => handleSelectEvidence(ids, periodInfo.summaryLabel)}
            isSelected={selectedMetricTitle === periodInfo.summaryLabel}
          />
        </div>
        <div>
          <MetricCard
            title="Primary Coach Recommendation"
            insight={insight.coachAction}
            icon={<Sparkles className="h-4 w-4 text-indigo-400" />}
            onSelectEvidence={(ids) => handleSelectEvidence(ids, "Coach Recommendation")}
            isSelected={selectedMetricTitle === "Coach Recommendation"}
          />
        </div>
      </div>

      {/* 4. 7 Domain Health Metrics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Extracted Health & Lifestyle Metrics</h2>
            <p className="text-xs text-slate-400">Click any card to highlight supporting line evidence in the timeline viewer below</p>
          </div>
          <span className="text-xs text-cyan-400 font-mono">7 Domain Metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coreMetrics.map((m) => (
            <MetricCard
              key={m.title}
              title={m.title}
              insight={m.insight}
              icon={m.icon}
              onSelectEvidence={(ids) => handleSelectEvidence(ids, m.title)}
              isSelected={selectedMetricTitle === m.title}
            />
          ))}
        </div>
      </div>

      {/* 5. Grid: Risk Panel & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskPanel
          overallRisk={insight.riskLevel}
          riskFlags={insight.riskFlags}
          onSelectEvidence={setSelectedLineIds}
        />
        <PendingActions
          actions={insight.pendingActions}
          onSelectEvidence={setSelectedLineIds}
        />
      </div>

      {/* 6. Signature Feature: Evidence Viewer & Interactive Timeline */}
      <EvidenceViewer
        lines={analysis.parsedLines}
        daysCovered={analysis.daysCovered}
        missingDays={analysis.missingDays}
        selectedLineIds={selectedLineIds}
        insight={analysis.insight}
        onClearSelection={() => {
          setSelectedLineIds([]);
          setSelectedMetricTitle(null);
        }}
      />

      {/* 7. Collapsible Raw JSON Payload (Automatically rendered for Insight Analysis Engine) */}
      {isInsightEngine && <JsonViewer data={analysis.insight} />}

      {/* 8. Human-in-the-Loop Review Modal */}
      {isReviewModalOpen && (
        <HumanReviewModal
          insight={analysis.insight}
          daysCount={daysCount}
          onClose={() => setIsReviewModalOpen(false)}
          onSave={handleUpdatedInsight}
          reviewStatus={reviewStatus}
          setReviewStatus={setReviewStatus}
        />
      )}
    </div>
  );
};
