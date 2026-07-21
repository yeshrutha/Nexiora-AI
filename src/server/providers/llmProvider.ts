import type { ParsedConversation } from "../parser/conversationParser.js";

export interface LlmAnalyzeRequest {
  systemPrompt: string;
  userPrompt: string;
  conversation: ParsedConversation;
  sourceLabel?: string;
}

export interface LlmAnalyzeResult {
  rawOutput: string;
  providerName: string;
  modelName?: string;
  warning?: string;
}

export interface LlmProvider {
  name: string;
  analyze(req: LlmAnalyzeRequest): Promise<LlmAnalyzeResult>;
}
