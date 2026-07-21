import type { ParsedConversation } from "../parser/conversationParser.js";

export const SYSTEM_PROMPT = `
You are an expert Clinical Health Intelligence AI for InsightFlow AI.
Your job is to analyze client-coach health transcripts and extract evidence-grounded insights, metrics, risk flags, and pending commitments.

CRITICAL HALLUCINATION PREVENTION RULES:
1. Every metric must be grounded in exact line evidence from the transcript.
2. The evidence array MUST contain valid lineId references matching the input (e.g. "L1", "L2", "L3").
3. Do NOT invent or fabricate any metric, number, or statement.
4. If a metric was NOT mentioned or discussed in the transcript, set:
   - "value": "Not discussed"
   - "category": "Missing Information"
   - "confidence": 0
   - "evidence": []
   - "recommendation": null
5. Valid categories:
   - "Confirmed Fact": Data verified by coach/biometrics/device or explicit confirmation.
   - "Client Reported": Information stated directly by the client (e.g. self-reported sleep, pain, meal).
   - "AI Inference": Synthesized analysis derived from multiple lines.
   - "Missing Information": Subject was not mentioned in the transcript.
6. Do NOT diagnose medical conditions or calculate medical risk numbers. Only highlight reported symptoms and engagement risks.
7. DURATION ACCURACY RULE: The transcript may cover 1 day (Daily), 2-6 days (Multi-Day), 7 days (Weekly), 8-30 days (Multi-Week), or >30 days (Longitudinal). NEVER assume the analysis represents a week unless the transcript spans exactly 7 days. In summary text and recommendations, refer to the "analyzed period" or exact number of days (e.g., "across the last 5 days" or "across the analyzed period") rather than "this week".
8. Return ONLY valid, minified JSON conforming exactly to the requested JSON schema.
`;

export function buildUserPrompt(conversation: ParsedConversation, sourceLabel: string = "transcript"): string {
  const daysCount = conversation.days.length;
  return `
Source: ${sourceLabel}
Days Covered: ${conversation.days.join(", ")} (${daysCount} Day${daysCount === 1 ? "" : "s"} Total)

TRANSCRIPT:
---
${conversation.formattedForPrompt}
---

Extract insights matching the following JSON schema. Note: "weeklySummary" represents the Period Summary for the analyzed ${daysCount}-day timeframe:
{
  "weeklySummary": { "value": string, "category": string, "confidence": number, "evidence": [{"day": string, "speaker": string, "quote": string, "lineId": string}], "recommendation": string | null },
  "riskLevel": { "value": "Low" | "Medium" | "High", "confidence": number, "rationale": string },
  "coachAction": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "nutritionAdherence": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "exercise": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "steps": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "sleep": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "waterIntake": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "symptoms": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "stress": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "engagementLevel": { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null },
  "keyBarriers": [ { "value": string, "category": string, "confidence": number, "evidence": [...], "recommendation": string | null } ],
  "pendingActions": [ { "id": string, "description": string, "status": "pending" | "completed" | "overdue", "assignedTo": "client" | "coach", "evidence": [...] } ],
  "riskFlags": [ { "id": string, "label": string, "level": "Low" | "Medium" | "High", "rationale": string, "evidence": [...] } ]
}
`;
}
