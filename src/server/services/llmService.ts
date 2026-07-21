import type { ParsedConversation } from "../parser/conversationParser.js";
import type { LlmProvider } from "../providers/llmProvider.js";
import { mockProvider } from "../providers/mockProvider.js";
import { geminiProvider } from "../providers/geminiProvider.js";
import { openaiProvider } from "../providers/openaiProvider.js";
import { claudeProvider } from "../providers/claudeProvider.js";
import { groqProvider } from "../providers/groqProvider.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/insightPrompt.js";
import { InsightSchema, type InsightResult } from "../schemas/insightSchema.js";
import { validateAndSanitizeChronology } from "../validator/chronologyValidator.js";

const providerRegistry: Record<string, LlmProvider> = {
  mock: mockProvider,
  gemini: geminiProvider,
  openai: openaiProvider,
  claude: claudeProvider,
  groq: groqProvider,
};

export interface AnalyzeOptions {
  providerName?: string;
  sourceLabel?: string;
}

export interface AnalyzeServiceResult {
  insight: InsightResult;
  providerUsed: string;
  modelName?: string;
  warnings: string[];
}

/**
 * Executes LLM or Heuristic analysis over a parsed transcript, enforces Zod schema
 * validation and chronology consistency, returning evidence-grounded insights.
 */
export async function analyzeConversation(
  conversation: ParsedConversation,
  options: AnalyzeOptions = {}
): Promise<AnalyzeServiceResult> {
  const selectedName = (options.providerName || "mock").toLowerCase();
  const provider = providerRegistry[selectedName] || mockProvider;

  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(conversation, options.sourceLabel);

  const llmResult = await provider.analyze({
    systemPrompt,
    userPrompt,
    conversation,
    sourceLabel: options.sourceLabel,
  });

  const warnings: string[] = [];
  if (llmResult.warning) {
    warnings.push(llmResult.warning);
  }

  let rawJson: any;
  try {
    let cleanOutput = llmResult.rawOutput.trim();
    if (cleanOutput.startsWith("```")) {
      cleanOutput = cleanOutput.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    rawJson = JSON.parse(cleanOutput);
  } catch (parseErr) {
    console.error("[llmService] JSON Parse Error from provider output:", parseErr);
    warnings.push("Provider returned non-JSON format; falling back to heuristic engine validation.");
    const fallbackRes = await mockProvider.analyze({ systemPrompt, userPrompt, conversation });
    rawJson = JSON.parse(fallbackRes.rawOutput);
  }

  // 1. Zod Schema Validation
  let finalInsight: InsightResult;
  const validated = InsightSchema.safeParse(rawJson);

  if (!validated.success) {
    console.warn("[llmService] Zod Schema Validation Warnings:", validated.error.issues);
    warnings.push(`Schema normalization applied for ${validated.error.issues.length} fields.`);

    const fallbackRes = await mockProvider.analyze({ systemPrompt, userPrompt, conversation });
    const fallbackObj = JSON.parse(fallbackRes.rawOutput);
    const merged = { ...fallbackObj, ...rawJson };
    finalInsight = InsightSchema.parse(merged);
  } else {
    finalInsight = validated.data;
  }

  // 2. Chronological Consistency Validation & Auto-Sanitization
  const chronologyReport = validateAndSanitizeChronology(finalInsight, conversation.days);
  if (chronologyReport.correctionsApplied.length > 0) {
    warnings.push(...chronologyReport.correctionsApplied);
  }

  return {
    insight: chronologyReport.sanitizedInsight,
    providerUsed: provider.name,
    modelName: llmResult.modelName,
    warnings,
  };
}
