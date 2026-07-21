import { z } from "zod";

export const CategoryEnum = z.enum([
  "Confirmed Fact",
  "Client Reported",
  "AI Inference",
  "Missing Information",
]);

export type Category = z.infer<typeof CategoryEnum>;

export const EvidenceItemSchema = z.object({
  day: z.string(),
  speaker: z.string(),
  quote: z.string(),
  lineId: z.string(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const FieldInsightSchema = z.object({
  value: z.string(),
  category: CategoryEnum,
  confidence: z.number().min(0).max(100),
  evidence: z.array(EvidenceItemSchema),
  recommendation: z.string().nullable().optional(),
});

export type FieldInsight = z.infer<typeof FieldInsightSchema>;

export const RiskFlagSchema = z.object({
  id: z.string(),
  label: z.string(),
  level: z.enum(["Low", "Medium", "High"]),
  rationale: z.string(),
  evidence: z.array(EvidenceItemSchema),
});

export type RiskFlag = z.infer<typeof RiskFlagSchema>;

export const PendingActionSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.enum(["pending", "completed", "overdue"]),
  assignedTo: z.enum(["client", "coach"]).optional().default("client"),
  evidence: z.array(EvidenceItemSchema),
});

export type PendingAction = z.infer<typeof PendingActionSchema>;

export const RiskLevelSummarySchema = z.object({
  value: z.enum(["Low", "Medium", "High"]),
  confidence: z.number().min(0).max(100),
  rationale: z.string(),
});

export type RiskLevelSummary = z.infer<typeof RiskLevelSummarySchema>;

export const InsightSchema = z.object({
  meta: z
    .object({
      generatedAt: z.string(),
      sourceLabel: z.string(),
      daysCovered: z.array(z.string()),
      modelProvider: z.string(),
    })
    .optional(),
  weeklySummary: FieldInsightSchema,
  riskLevel: RiskLevelSummarySchema,
  coachAction: FieldInsightSchema,
  nutritionAdherence: FieldInsightSchema,
  exercise: FieldInsightSchema,
  steps: FieldInsightSchema,
  sleep: FieldInsightSchema,
  waterIntake: FieldInsightSchema,
  symptoms: FieldInsightSchema,
  stress: FieldInsightSchema,
  engagementLevel: FieldInsightSchema,
  keyBarriers: z.array(FieldInsightSchema).default([]),
  pendingActions: z.array(PendingActionSchema).default([]),
  riskFlags: z.array(RiskFlagSchema).default([]),
});

export type InsightResult = z.infer<typeof InsightSchema>;
