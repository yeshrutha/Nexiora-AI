export type Category = "Confirmed Fact" | "Client Reported" | "AI Inference" | "Missing Information";

export interface EvidenceItem {
  day: string;
  speaker: string;
  quote: string;
  lineId: string;
}

export interface FieldInsight {
  value: string;
  category: Category;
  confidence: number;
  evidence: EvidenceItem[];
  recommendation?: string | null;
}

export interface RiskFlag {
  id: string;
  label: string;
  level: "Low" | "Medium" | "High";
  rationale: string;
  evidence: EvidenceItem[];
}

export interface PendingAction {
  id: string;
  description: string;
  status: "pending" | "completed" | "overdue";
  assignedTo?: "client" | "coach";
  evidence: EvidenceItem[];
}

export interface RiskLevelSummary {
  value: "Low" | "Medium" | "High";
  confidence: number;
  rationale: string;
}

export interface InsightResult {
  meta?: {
    generatedAt: string;
    sourceLabel: string;
    daysCovered: string[];
    modelProvider: string;
  };
  weeklySummary: FieldInsight;
  riskLevel: RiskLevelSummary;
  coachAction: FieldInsight;
  nutritionAdherence: FieldInsight;
  exercise: FieldInsight;
  steps: FieldInsight;
  sleep: FieldInsight;
  waterIntake: FieldInsight;
  symptoms: FieldInsight;
  stress: FieldInsight;
  engagementLevel: FieldInsight;
  keyBarriers: FieldInsight[];
  pendingActions: PendingAction[];
  riskFlags: RiskFlag[];
}

export interface ParsedLine {
  id: string;
  lineNumber: number;
  day: string;
  speaker: "client" | "coach" | "unknown";
  rawSpeakerName: string;
  text: string;
}

export interface AnalysisResponse {
  insight: InsightResult;
  providerUsed: string;
  modelName?: string;
  parsedLines: ParsedLine[];
  daysCovered: string[];
  missingDays?: string[];
  warnings?: string[];
}
