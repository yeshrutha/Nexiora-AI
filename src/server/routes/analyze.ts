import { Router } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parseConversation } from "../parser/conversationParser.js";
import { analyzeConversation } from "../services/llmService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const analyzeRouter = Router();

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split(".").pop()?.toLowerCase();

  if (ext === "txt" || file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  if (ext === "pdf" || file.mimetype === "application/pdf") {
    try {
      const parser = new PDFParse({ data: file.buffer });
      try {
        const data = await parser.getText();
        if (data && typeof data.text === "string" && data.text.trim().length > 0) {
          return data.text;
        }
      } finally {
        await parser.destroy().catch(() => {});
      }
    } catch (pdfErr) {
      console.warn("[extractTextFromFile] PDF parsing fallback applied:", (pdfErr as Error).message);
    }
    return file.buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
  }

  if (ext === "docx" || file.mimetype.includes("wordprocessingml")) {
    try {
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      if (value && value.trim().length > 0) {
        return value;
      }
    } catch (docxErr) {
      console.warn("[extractTextFromFile] DOCX extraction fallback applied:", (docxErr as Error).message);
    }
    return file.buffer.toString("utf-8");
  }

  return file.buffer.toString("utf-8");
}

analyzeRouter.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    let rawText: string;
    let sourceLabel: string;

    if (req.file) {
      rawText = await extractTextFromFile(req.file);
      sourceLabel = req.file.originalname;
    } else if (typeof req.body?.text === "string" && req.body.text.trim().length > 0) {
      rawText = req.body.text;
      sourceLabel = req.body.sourceLabel || "Pasted transcript";
    } else {
      res.status(400).json({
        error: "No transcript provided for analysis.",
        reason: "Request body was missing text or uploaded file.",
        suggestions: [
          "Upload a valid .txt, .pdf, or .docx transcript file.",
          "Paste text directly into the transcript text area.",
          "Try loading one of the pre-built sample check-in transcripts.",
        ],
      });
      return;
    }

    const cleanRawText = rawText.trim();

    if (cleanRawText.length < 15) {
      res.status(400).json({
        error: "Transcript content is too short for analysis.",
        reason: `Provided content has only ${cleanRawText.length} characters (minimum 15 characters required).`,
        suggestions: [
          "Ensure the transcript contains dialogue between client and coach.",
          "Check that the uploaded file is not empty or corrupted.",
        ],
      });
      return;
    }

    const parsed = parseConversation(cleanRawText);
    if (parsed.lines.length === 0) {
      res.status(400).json({
        error: "Conversation format could not be parsed.",
        reason: "Could not detect readable lines or dialogue statements in the provided text.",
        suggestions: [
          "Ensure lines follow a speaker format (e.g., 'Client: ...', 'Coach: ...').",
          "Check file encoding if uploading a PDF or DOCX file.",
        ],
      });
      return;
    }

    if (!parsed.isHealthcareTranscript) {
      res.status(400).json({
        error: "Invalid Transcript Type Detected",
        reason: parsed.nonHealthcareReason || "The uploaded transcript is invalid. Please upload a valid client consultation transcript discussing health, nutrition, sleep, exercise, or physical symptoms.",
        suggestions: [
          "Ensure the transcript is a consultation between a client and a health coach, physician, or dietitian.",
          "The document should discuss health metrics (sleep, diet, exercise, water, physical symptoms, stress).",
          "Try loading one of the pre-built sample health check-in transcripts.",
        ],
      });
      return;
    }

    const providerName = typeof req.body?.provider === "string" ? req.body.provider : "mock";
    const result = await analyzeConversation(parsed, { providerName, sourceLabel });

    res.json({
      insight: result.insight,
      providerUsed: result.providerUsed,
      modelName: result.modelName,
      parsedLines: parsed.lines,
      daysCovered: parsed.days,
      missingDays: parsed.missingDays,
      warnings: result.warnings,
    });
  } catch (err) {
    console.error("[POST /api/analyze] error:", err);
    res.status(500).json({
      error: "Analysis could not be completed.",
      reason: (err as Error).message || "An unexpected server processing error occurred.",
      suggestions: [
        "Check transcript format and try again.",
        "Ensure uploaded file is under 15MB.",
        "Select the 'Insight Analysis Engine' provider and retry.",
      ],
    });
  }
});
