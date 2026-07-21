import { AnalysisResponse } from "./insight.ts";

export interface SavedReportItem {
  id: string;
  clientName: string;
  reportDate: string; // ISO timestamp string
  daysCount: number;
  daysCovered: string[];
  riskLevel: "Low" | "Medium" | "High";
  isStarred: boolean;
  providerUsed: string;
  modelName?: string;
  analysisData: AnalysisResponse;
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  autoSaveReports: boolean;
  rememberLastAnalysis: boolean;
}
