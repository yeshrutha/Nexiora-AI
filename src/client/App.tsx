import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "./components/Sidebar.tsx";
import { UploadForm, AnalysisErrorPayload } from "./components/UploadForm.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { HistoryView } from "./components/HistoryView.tsx";
import { AnalyticsView } from "./components/AnalyticsView.tsx";
import { SettingsView } from "./components/SettingsView.tsx";
import { AboutView } from "./components/AboutView.tsx";
import { AnalysisResponse } from "./types/insight.ts";
import { SavedReportItem, AppSettings } from "./types/history.ts";
import {
  getReportHistory,
  saveReportToHistory,
  duplicateReportInHistory,
  toggleStarReport,
  renameReport,
  deleteReport,
  clearReportHistory,
  getAppSettings,
  saveAppSettings,
} from "./utils/historyStorage.ts";
import { applyTheme } from "./utils/theme.ts";
import { Activity } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("upload");
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorPayload, setErrorPayload] = useState<AnalysisErrorPayload | string | null>(null);

  const [history, setHistory] = useState<SavedReportItem[]>(() => getReportHistory());
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());

  // Initialize theme and auto-load last analysis
  useEffect(() => {
    applyTheme(settings.theme || "dark");
    if (settings.rememberLastAnalysis && history.length > 0 && !analysisData) {
      setAnalysisData(history[0].analysisData);
    }
  }, []);

  const handleAnalyze = async (payload: {
    file?: File;
    text?: string;
    provider: string;
    sourceLabel?: string;
  }) => {
    setIsLoading(true);
    setErrorPayload(null);

    const selectedProvider = payload.provider || "mock";

    try {
      let res: Response;

      if (payload.file) {
        const formData = new FormData();
        formData.append("file", payload.file);
        formData.append("provider", selectedProvider);
        if (payload.sourceLabel) formData.append("sourceLabel", payload.sourceLabel);

        res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: payload.text,
            provider: selectedProvider,
            sourceLabel: payload.sourceLabel,
          }),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setErrorPayload({
          error: errJson.error || "Analysis could not be completed.",
          reason: errJson.reason || `Server returned HTTP status ${res.status}`,
          suggestions: errJson.suggestions || [
            "Check transcript formatting.",
            "Verify file format (.txt, .pdf, .docx).",
            "Try again with the Insight Analysis Engine.",
          ],
        });
        setIsLoading(false);
        return;
      }

      const data: AnalysisResponse = await res.json();
      setAnalysisData(data);

      if (settings.autoSaveReports) {
        const updatedHistory = saveReportToHistory(data);
        setHistory(updatedHistory);
      }

      setActiveTab("dashboard");
    } catch (err) {
      console.error("[InsightFlow App] Analysis network error:", err);
      setErrorPayload({
        error: "Analysis could not be completed.",
        reason: (err as Error).message || "A network error occurred while reaching the server.",
        suggestions: [
          "Check your internet connection.",
          "Ensure the Express server is running on port 5000.",
          "Try again.",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReportFromHistory = (data: AnalysisResponse) => {
    setAnalysisData(data);
    setActiveTab("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicateReport = (id: string) => {
    setHistory(duplicateReportInHistory(id));
  };

  const handleToggleStar = (id: string) => {
    setHistory(toggleStarReport(id));
  };

  const handleRenameReport = (id: string, newName: string) => {
    setHistory(renameReport(id, newName));
  };

  const handleDeleteReport = (id: string) => {
    setHistory(deleteReport(id));
  };

  const handleClearHistory = () => {
    setHistory(clearReportHistory());
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(saveAppSettings(newSettings));
  };

  const starredCount = history.filter((i) => i.isStarred).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysisData={analysisData !== null}
        historyCount={history.length}
        starredCount={starredCount}
      />

      {/* 2. Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Status Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-bold">InsightFlow AI</span>
            <span>/</span>
            <span className="text-cyan-400 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
              ● Engine Active ({analysisData?.providerUsed || "Insight Analysis Engine"})
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Theme: <span className="capitalize text-white font-bold">{settings.theme}</span>
            </span>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1">
          {activeTab === "upload" && (
            <UploadForm
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={errorPayload}
            />
          )}

          {activeTab === "dashboard" && (
            analysisData ? (
              <Dashboard
                data={analysisData}
                onNewAnalysis={() => setActiveTab("upload")}
                history={history}
                settings={settings}
                onOpenReport={handleOpenReportFromHistory}
                onViewAllHistory={() => setActiveTab("history")}
              />
            ) : (
              <div className="mx-auto max-w-2xl my-20 p-8 rounded-2xl border border-slate-800 bg-slate-900/90 text-center space-y-4">
                <Activity className="h-12 w-12 text-cyan-400 mx-auto opacity-50" />
                <h2 className="text-xl font-bold text-white">No Active Analysis Report</h2>
                <p className="text-xs text-slate-400">
                  Please upload a conversation transcript or select a report from your Analysis History.
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 text-xs font-bold shadow-md"
                >
                  Upload Transcript
                </button>
              </div>
            )
          )}

          {activeTab === "history" && (
            <HistoryView
              history={history}
              onOpenReport={handleOpenReportFromHistory}
              onToggleStar={handleToggleStar}
              onRenameReport={handleRenameReport}
              onDeleteReport={handleDeleteReport}
              onDuplicateReport={handleDuplicateReport}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === "saved" && (
            <HistoryView
              history={history}
              onOpenReport={handleOpenReportFromHistory}
              onToggleStar={handleToggleStar}
              onRenameReport={handleRenameReport}
              onDeleteReport={handleDeleteReport}
              onDuplicateReport={handleDuplicateReport}
              onClearHistory={handleClearHistory}
              filterStarredOnly
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              history={history}
              onOpenReport={handleOpenReportFromHistory}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView settings={settings} onSaveSettings={handleSaveSettings} />
          )}

          {activeTab === "about" && <AboutView />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 mt-auto">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-300">InsightFlow AI</span>
              <span>— Healthcare Client Intelligence Platform</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="text-cyan-400 font-mono">Zero Hallucination Audit</span>
              <span>•</span>
              <span>v1.2 Production Engine</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
