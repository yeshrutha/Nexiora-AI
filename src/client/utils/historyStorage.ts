import { SavedReportItem, AppSettings } from "../types/history.ts";
import { AnalysisResponse } from "../types/insight.ts";

const HISTORY_KEY = "insightflow_report_history_v1";
const SETTINGS_KEY = "insightflow_app_settings_v1";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  autoSaveReports: true,
  rememberLastAnalysis: true,
};

export function getReportHistory(): SavedReportItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("[historyStorage] Failed to load history:", err);
    return [];
  }
}

export function saveReportToHistory(analysis: AnalysisResponse): SavedReportItem[] {
  try {
    const history = getReportHistory();
    const clientName =
      analysis.insight.meta?.sourceLabel || "Analyzed Client Consultation";
    const riskLevel = analysis.insight.riskLevel.value || "Low";
    const daysCovered = analysis.daysCovered || ["Day 1"];

    const newItem: SavedReportItem = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clientName,
      reportDate: new Date().toISOString(),
      daysCount: daysCovered.length,
      daysCovered,
      riskLevel,
      isStarred: false,
      providerUsed: analysis.providerUsed || "mock",
      modelName: analysis.modelName,
      analysisData: analysis,
    };

    const updated = [newItem, ...history].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("[historyStorage] Failed to save report to history:", err);
    return getReportHistory();
  }
}

export function duplicateReportInHistory(id: string): SavedReportItem[] {
  const history = getReportHistory();
  const target = history.find((item) => item.id === id);
  if (!target) return history;

  const duplicated: SavedReportItem = {
    ...target,
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    clientName: `${target.clientName} (Copy)`,
    reportDate: new Date().toISOString(),
  };

  const updated = [duplicated, ...history].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleStarReport(id: string): SavedReportItem[] {
  const history = getReportHistory();
  const updated = history.map((item) =>
    item.id === id ? { ...item, isStarred: !item.isStarred } : item
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function renameReport(id: string, newName: string): SavedReportItem[] {
  const history = getReportHistory();
  const updated = history.map((item) =>
    item.id === id ? { ...item, clientName: newName } : item
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteReport(id: string): SavedReportItem[] {
  const history = getReportHistory();
  const updated = history.filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearReportHistory(): SavedReportItem[] {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): AppSettings {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}
