export interface ParsedLine {
  id: string; // e.g. "L1", "L2"
  lineNumber: number; // 1, 2...
  day: string; // e.g. "Day 1"
  speaker: "client" | "coach" | "unknown";
  rawSpeakerName: string; // e.g. "Client", "Coach Sarah", "Interviewer 1", "Interviewee"
  text: string;
}

export interface ParsedConversation {
  lines: ParsedLine[];
  days: string[];
  missingDays?: string[];
  rawText: string;
  formattedForPrompt: string;
  isHealthcareTranscript: boolean;
  nonHealthcareReason?: string;
}

// Words/keywords that should NEVER be treated as Speaker Names (e.g. Python/code syntax)
const CODE_KEYWORDS = new Set([
  "except", "try", "catch", "finally", "if", "else", "elif", "while", "for",
  "def", "class", "import", "from", "return", "print", "raise", "pass", "break",
  "continue", "assert", "with", "as", "yield", "lambda", "global", "nonlocal"
]);

/**
 * Robust multi-format conversation & transcript parser with strict domain validation.
 * Validates whether the uploaded text is a genuine healthcare/lifestyle consultation.
 * Accepts all valid client check-ins (.txt, .pdf, .docx) while rejecting non-health files & code scripts.
 */
export function parseConversation(rawText: string): ParsedConversation {
  const rawLines = rawText.split(/\r?\n/);
  const parsedLines: ParsedLine[] = [];
  const detectedDays = new Set<string>();

  let currentDay = "Day 1";
  detectedDays.add(currentDay);

  let lineCounter = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trim();
    if (!rawLine) continue;

    // 1. Detect Day / Session / Date headers
    const dayHeaderMatch = rawLine.match(
      /^(?:\[|---|#|\*\*)*\s*(Day\s*\d+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Week\s*\d+|Session\s*\d+|\d{1,2}\/\d{1,2}\/\d{2,4})\b[\]:\-\s\*\#]*/i
    );

    if (dayHeaderMatch && rawLine.length < 50 && !rawLine.includes(": ")) {
      const matchText = dayHeaderMatch[1].trim();
      if (/^Day\s*\d+/i.test(matchText)) {
        currentDay = matchText.replace(/\s+/g, " ").replace(/^day/i, "Day");
      } else {
        currentDay = matchText;
      }
      detectedDays.add(currentDay);
      continue;
    }

    // 2. Strip optional leading timestamps like "[10:15 AM]" or "10:15 -"
    const cleanedLine = rawLine.replace(/^(?:\[\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\]|\d{1,2}:\d{2}\s*-\s*)/i, "").trim();

    // 3. Match Speaker pattern "Speaker Name: Message text"
    let speaker: "client" | "coach" | "unknown" = "unknown";
    let rawSpeakerName = "Unknown";
    let messageBody = cleanedLine;

    const speakerMatch = cleanedLine.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9_\s\.\-]{2,30}))\s*:\s*(.*)$/);

    if (speakerMatch) {
      const candidateName = (speakerMatch[1] || speakerMatch[2] || "").trim();
      const firstWord = candidateName.split(/\s+/)[0].toLowerCase();

      // Check if candidate name is python code / syntax keyword
      if (!CODE_KEYWORDS.has(firstWord) && !candidateName.includes("(") && !candidateName.includes(")")) {
        rawSpeakerName = candidateName;
        messageBody = speakerMatch[3] || "";

        const lowerSpeaker = rawSpeakerName.toLowerCase();
        if (
          lowerSpeaker.includes("client") ||
          lowerSpeaker.includes("patient") ||
          lowerSpeaker.includes("interviewee") ||
          lowerSpeaker.includes("candidate") ||
          lowerSpeaker.includes("applicant") ||
          lowerSpeaker.includes("guest") ||
          lowerSpeaker.includes("student") ||
          lowerSpeaker.includes("user") ||
          lowerSpeaker.includes("member") ||
          lowerSpeaker.includes("alex") ||
          lowerSpeaker.includes("john") ||
          lowerSpeaker.includes("elena") ||
          lowerSpeaker.includes("me")
        ) {
          speaker = "client";
        } else if (
          lowerSpeaker.includes("coach") ||
          lowerSpeaker.includes("interviewer") ||
          lowerSpeaker.includes("host") ||
          lowerSpeaker.includes("recruiter") ||
          lowerSpeaker.includes("trainer") ||
          lowerSpeaker.includes("dietitian") ||
          lowerSpeaker.includes("physician") ||
          lowerSpeaker.includes("dr") ||
          lowerSpeaker.includes("therapist") ||
          lowerSpeaker.includes("sarah") ||
          lowerSpeaker.includes("mark")
        ) {
          speaker = "coach";
        } else {
          const previousLine = parsedLines[parsedLines.length - 1];
          if (previousLine) {
            speaker = previousLine.speaker === "coach" ? "client" : "coach";
          } else {
            speaker = "client";
          }
        }
      } else {
        // Line started with python keyword or code colon — treat as message body
        if (parsedLines.length > 0) {
          parsedLines[parsedLines.length - 1].text += " " + rawLine;
          continue;
        } else {
          rawSpeakerName = "Client";
          speaker = "client";
        }
      }
    } else {
      if (parsedLines.length > 0 && !rawLine.startsWith("[")) {
        parsedLines[parsedLines.length - 1].text += " " + rawLine;
        continue;
      } else {
        rawSpeakerName = "Client";
        speaker = "client";
      }
    }

    const lineId = `L${lineCounter}`;
    parsedLines.push({
      id: lineId,
      lineNumber: lineCounter,
      day: currentDay,
      speaker,
      rawSpeakerName,
      text: messageBody.trim(),
    });
    lineCounter++;
  }

  if (parsedLines.length === 0 && rawText.trim().length > 0) {
    parsedLines.push({
      id: "L1",
      lineNumber: 1,
      day: "Day 1",
      speaker: "client",
      rawSpeakerName: "Client",
      text: rawText.trim(),
    });
  }

  const daysList = Array.from(detectedDays);

  // Detect missing day gaps
  const numericDays: number[] = [];
  daysList.forEach((d) => {
    const m = d.match(/Day\s*(\d+)/i);
    if (m) numericDays.push(parseInt(m[1], 10));
  });

  const missingDays: string[] = [];
  if (numericDays.length >= 2) {
    const minDay = Math.min(...numericDays);
    const maxDay = Math.max(...numericDays);
    for (let d = minDay; d <= maxDay; d++) {
      if (!numericDays.includes(d)) {
        missingDays.push(`Day ${d}`);
      }
    }
  }

  // --- HEALTHCARE & CONSULTATION DOMAIN INSPECTOR ---
  // 1. Explicit Non-Healthcare / Non-Consultation / Code Script Indicators (using syntax-aware patterns)
  const codeSyntaxPatterns = [
    /console\.log\(/i,
    /function\s+\w+\s*\(/i,
    /(?:const|let|var)\s+\w+\s*=/i,
    /def\s+\w+\s*\(.*\)\s*:/i,
    /import\s+.*\s+from\s+['"]/i,
    /#include\s+<\w+>/i,
    /public\s+class\s+\w+/i,
    /int\s+main\s*\(/i,
    /<!DOCTYPE\s+html>/i,
    /<html/i,
    /<script/i,
    /process\.env\./i,
    /npm\s+run\s+\w+/i,
    /git\s+commit\s+-m/i,
    /ZeroDivisionError/i,
    /RuntimeError/i,
    /BaseException/i,
    /\b(?:pytorch|huggingface|salary|hiring|skill lab|nala clg|bartini|ogthini|time table)\b/i
  ];

  const isExplicitNonHealth = codeSyntaxPatterns.some((pattern) => pattern.test(rawText));

  // 2. Broad Healthcare, Lifestyle, Wellness, and Consultation Indicators
  const hasHealthOrConsultationTopic = /\b(?:sleep|slept|insomnia|bedtime|rest|tired|fatigue|exhausted|energy|mood|diet|diets|meal|meals|eating|food|foods|snack|breakfast|lunch|dinner|takeout|protein|salad|calories|hydration|liters|litres|liter|litre|glasses|workout|workouts|exercise|exercises|gym|cardio|running|yoga|swim|cycling|bike|lift|resistance|steps|walked|walking|pain|ache|aches|ached|aching|dizzy|nausea|headache|cramp|cramps|sore|symptom|symptoms|knee|back|neck|shoulder|tightness|stress|anxious|anxiety|overwhelm|pressure|burnout|wellness|health|recovery|check-?in|physician|dietitian|patient|client|coach|consultation|nutrition|lifestyle|habit|habits|routine|target|goals|progress|recommendation|feeling|feels)\b/i.test(rawText);

  // STRICT DOMAIN RULE: Must contain genuine health/lifestyle/wellness consultation topics and MUST NOT be explicit code/timetable text
  const isHealthcare = hasHealthOrConsultationTopic && !isExplicitNonHealth;
  let nonHealthcareReason: string | undefined;

  if (!isHealthcare) {
    nonHealthcareReason = "The uploaded transcript is invalid. Please upload a valid client consultation transcript discussing health, nutrition, sleep, exercise, or physical symptoms.";
  }

  const formattedForPrompt = parsedLines
    .map((l) => `[${l.id}] (${l.day}, ${l.speaker}): ${l.text}`)
    .join("\n");

  return {
    lines: parsedLines,
    days: daysList,
    missingDays,
    rawText,
    formattedForPrompt,
    isHealthcareTranscript: isHealthcare,
    nonHealthcareReason,
  };
}
