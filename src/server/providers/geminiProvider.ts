import type { LlmAnalyzeRequest, LlmAnalyzeResult, LlmProvider } from "./llmProvider.js";
import { mockProvider } from "./mockProvider.js";

export const geminiProvider: LlmProvider = {
  name: "gemini",
  async analyze(req: LlmAnalyzeRequest): Promise<LlmAnalyzeResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "gemini",
        modelName: "gemini-1.5-pro (Fallback to Insight Engine)",
        warning: "No GEMINI_API_KEY set. Generated via Insight Analysis Engine.",
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: req.systemPrompt }] },
          contents: [{ parts: [{ text: req.userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      return {
        rawOutput: rawText,
        providerName: "gemini",
        modelName: "gemini-1.5-pro",
      };
    } catch (err) {
      console.warn("[GeminiProvider] Error calling Gemini API, using fallback:", err);
      const fallback = await mockProvider.analyze(req);
      return {
        ...fallback,
        providerName: "gemini",
        modelName: "gemini-1.5-pro (Fallback)",
        warning: `Gemini API Call failed: ${(err as Error).message}. Falling back to Heuristic Engine.`,
      };
    }
  },
};
