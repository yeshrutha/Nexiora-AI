import type { LlmAnalyzeRequest, LlmAnalyzeResult, LlmProvider } from "./llmProvider.js";
import { mockProvider } from "./mockProvider.js";

export const openaiProvider: LlmProvider = {
  name: "openai",
  async analyze(req: LlmAnalyzeRequest): Promise<LlmAnalyzeResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "openai",
        modelName: "gpt-4o (Fallback to Insight Engine)",
        warning: "No OPENAI_API_KEY set. Generated via Insight Analysis Engine.",
      };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          temperature: 0.1,
          messages: [
            { role: "system", content: req.systemPrompt },
            { role: "user", content: req.userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API HTTP Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "{}";

      return {
        rawOutput: rawText,
        providerName: "openai",
        modelName: "gpt-4o",
      };
    } catch (err) {
      console.warn("[OpenAIProvider] Error calling OpenAI API:", err);
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "openai",
        modelName: "gpt-4o (Fallback)",
        warning: `OpenAI API call failed: ${(err as Error).message}. Falling back to Heuristic Engine.`,
      };
    }
  },
};
