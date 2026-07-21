import type { LlmAnalyzeRequest, LlmAnalyzeResult, LlmProvider } from "./llmProvider.js";
import { mockProvider } from "./mockProvider.js";

export const groqProvider: LlmProvider = {
  name: "groq",
  async analyze(req: LlmAnalyzeRequest): Promise<LlmAnalyzeResult> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "groq",
        modelName: "llama-3.3-70b-versatile (Fallback to Insight Engine)",
        warning: "No GROQ_API_KEY set. Generated via Insight Analysis Engine.",
      };
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.1,
          messages: [
            { role: "system", content: req.systemPrompt },
            { role: "user", content: req.userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API HTTP Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "{}";

      return {
        rawOutput: rawText,
        providerName: "groq",
        modelName: "llama-3.3-70b-versatile",
      };
    } catch (err) {
      console.warn("[GroqProvider] Error calling Groq API:", err);
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "groq",
        modelName: "llama-3.3-70b-versatile (Fallback)",
        warning: `Groq API call failed: ${(err as Error).message}. Falling back to Heuristic Engine.`,
      };
    }
  },
};
