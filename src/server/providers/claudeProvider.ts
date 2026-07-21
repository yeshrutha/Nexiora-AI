import type { LlmAnalyzeRequest, LlmAnalyzeResult, LlmProvider } from "./llmProvider.js";
import { mockProvider } from "./mockProvider.js";

export const claudeProvider: LlmProvider = {
  name: "claude",
  async analyze(req: LlmAnalyzeRequest): Promise<LlmAnalyzeResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "claude",
        modelName: "claude-3-5-sonnet (Fallback to Insight Engine)",
        warning: "No ANTHROPIC_API_KEY set. Generated via Insight Analysis Engine.",
      };
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          system: req.systemPrompt,
          messages: [{ role: "user", content: req.userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API HTTP Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text || "{}";

      return {
        rawOutput: rawText,
        providerName: "claude",
        modelName: "claude-3-5-sonnet",
      };
    } catch (err) {
      console.warn("[ClaudeProvider] Error calling Anthropic API:", err);
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "claude",
        modelName: "claude-3-5-sonnet (Fallback)",
        warning: `Anthropic API call failed: ${(err as Error).message}. Falling back to Heuristic Engine.`,
      };
    }
  },
};
