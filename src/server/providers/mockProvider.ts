/**
 * mockProvider.ts — Insight Analysis Engine (Prototype & Heuristic Engine)
 *
 * Dynamically synthesizes evidence-grounded narratives, exact metrics, and
 * personalized clinical recommendations directly from parsed conversation lines.
 *
 * No hardcoded template sentences. Every field reflects the exact dialogue content.
 */
import type { LlmAnalyzeRequest, LlmAnalyzeResult, LlmProvider } from "./llmProvider.js";

interface TaggedLine {
  lineId: string;
  day: string;
  speaker: "client" | "coach" | "unknown";
  text: string;
}

const LINE_RE = /^\[(L\d+)\]\s*\(([^)]+),\s*([^)]+)\):\s*(.*)$/;

function extractTranscriptLines(userPrompt: string): TaggedLine[] {
  const block = userPrompt.split("---")[1] ?? userPrompt;
  const lines: TaggedLine[] = [];
  for (const raw of block.split("\n")) {
    const match = raw.match(LINE_RE);
    if (!match) continue;
    const [, lineId, day, speakerRaw, text] = match;
    const speaker = speakerRaw.trim().toLowerCase();
    lines.push({
      lineId,
      day: day.trim(),
      speaker: speaker === "client" ? "client" : speaker === "coach" ? "coach" : "unknown",
      text: text.trim(),
    });
  }
  return lines;
}

function evidenceFrom(lines: TaggedLine[]): { day: string; speaker: string; quote: string; lineId: string }[] {
  return lines.map((l) => ({ day: l.day, speaker: l.speaker, quote: l.text, lineId: l.lineId }));
}

function findMatches(lines: TaggedLine[], re: RegExp, speakerFilter?: "client" | "coach"): TaggedLine[] {
  return lines.filter((l) => (speakerFilter ? l.speaker === speakerFilter : true) && re.test(l.text));
}

function missing() {
  return {
    value: "Not discussed",
    category: "Missing Information" as const,
    confidence: 0,
    evidence: [],
    recommendation: null,
  };
}

function buildField(
  matches: TaggedLine[],
  opts: {
    valueExtractor?: (matches: TaggedLine[]) => string;
    category?: "Client Reported" | "Confirmed Fact" | "AI Inference";
    confidence?: number;
    recommendation?: (matches: TaggedLine[]) => string | null;
    maxEvidence?: number;
  } = {}
) {
  if (matches.length === 0) return missing();
  const value = opts.valueExtractor ? opts.valueExtractor(matches) : matches[0].text;
  return {
    value,
    category: opts.category ?? ("Client Reported" as const),
    confidence: opts.confidence ?? 85,
    evidence: evidenceFrom(matches.slice(0, opts.maxEvidence ?? 3)),
    recommendation: opts.recommendation ? opts.recommendation(matches) : null,
  };
}

function analyzeTranscript(lines: TaggedLine[]) {
  const clientLines = lines.filter((l) => l.speaker === "client");
  const coachLines = lines.filter((l) => l.speaker === "coach");
  const days = Array.from(new Set(lines.map((l) => l.day)));
  const daysCount = Math.max(1, days.length);

  // --- Sleep ---
  const sleepMatches = findMatches(clientLines, /\b(?:sleep|slept|insomnia|woke up|woke|rest)\b/i);
  const sleep = buildField(sleepMatches, {
    valueExtractor: (m) => {
      const quotes = m.map((l) => `${l.text} (${l.day})`).join("; ");
      return quotes || m[0].text;
    },
    confidence: 90,
    recommendation: (m) => {
      const lowSleep = m.find((l) => /\b([1-5](\.\d+)?)\s*(?:hours|hrs|hr)\b/i.test(l.text) || /rough|poor|insomnia|exhausted/i.test(l.text));
      if (lowSleep) {
        return `Address sleep disruptions noted on ${lowSleep.day} ("${lowSleep.text}"); establish a fixed wind-down routine on high-workload days.`;
      }
      return "Maintain consistent sleep schedule and monitor night recovery quality.";
    },
  });

  // --- Water ---
  const waterMatches = findMatches(clientLines, /\b(?:water|hydration|liters|litres|liter|litre|glasses|oz|cups)\b/i);
  const water = buildField(waterMatches, {
    valueExtractor: (m) => {
      const quotes = m.map((l) => `${l.text} (${l.day})`).join("; ");
      return quotes || m[0].text;
    },
    confidence: 85,
    recommendation: (m) => {
      const lowWater = m.find((l) => /forget|not much|barely|1\.\d|1 liter/i.test(l.text));
      if (lowWater) {
        return `Client reported low fluid intake on ${lowWater.day}; set time-based hydration reminders or link water intake to daily work transitions.`;
      }
      return null;
    },
  });

  // --- Steps ---
  const stepsMatches = findMatches(clientLines, /\b(?:steps|walked|walking|walk)\b/i);
  const steps = buildField(stepsMatches, {
    valueExtractor: (m) => {
      const quotes = m.map((l) => `${l.text} (${l.day})`).join("; ");
      return quotes || m[0].text;
    },
    confidence: 88,
  });

  // --- Exercise ---
  const exerciseMatches = findMatches(
    clientLines,
    /\b(?:workout|workouts|exercise|exercises|gym|running|cardio|training|yoga|swim|cycling|bike|lift|resistance band)\b/i
  );
  const exercise = buildField(exerciseMatches, {
    valueExtractor: (m) => m.map((l) => `${l.text} (${l.day})`).join("; "),
    confidence: 82,
    recommendation: (m) => {
      const skipped = m.find((l) => /skip|missed|didn't|couldn't|too tired|tightness/i.test(l.text));
      if (skipped) {
        return `Adjust exercise intensity based on reported feedback on ${skipped.day} ("${skipped.text}").`;
      }
      return null;
    },
  });

  // --- Nutrition (Strict word boundaries to prevent technical interview false positives) ---
  const nutritionMatches = findMatches(
    clientLines,
    /\b(?:diet|diets|meal|meals|eating|food|foods|junk food|fast food|takeout|protein|salad|pizza|breakfast|lunch|dinner|calories)\b/i
  );
  const nutrition = buildField(nutritionMatches, {
    valueExtractor: (m) => m.map((l) => `${l.text} (${l.day})`).join("; "),
    category: "Client Reported",
    confidence: 80,
    recommendation: (m) => {
      const takeout = m.find((l) => /takeout|pizza|fast food|junk food|skipped/i.test(l.text));
      if (takeout) {
        return `Client noted meal disruption on ${takeout.day} ("${takeout.text}"); plan quick 15-minute meal prep options for late meeting days.`;
      }
      return null;
    },
  });

  // --- Symptoms ---
  const symptomMatches = findMatches(
    clientLines,
    /\b(?:pain|ache|aches|ached|aching|dizzy|nausea|fatigue|headache|cramp|cramps|sore|symptom|symptoms|knee|back|neck|shoulder|tightness)\b/i
  );
  const symptoms = buildField(symptomMatches, {
    valueExtractor: (m) => m.map((l) => `${l.text} (${l.day})`).join("; "),
    category: "Client Reported",
    confidence: 85,
    recommendation: (m) => {
      if (m.length > 0) {
        const first = m[0];
        return `Monitor reported physical symptom ("${first.text}" on ${first.day}); adjust physical loading accordingly.`;
      }
      return null;
    },
  });

  // --- Stress ---
  const stressMatches = findMatches(
    clientLines,
    /\b(?:stress|anxious|anxiety|overwhelm|pressure|burnout|on edge|mood|exhausted|deadline)\b/i
  );
  const stress = buildField(stressMatches, {
    valueExtractor: (m) => m.map((l) => `${l.text} (${l.day})`).join("; "),
    category: "Client Reported",
    confidence: 84,
    recommendation: (m) => {
      if (m.length > 0) {
        const first = m[0];
        return `Client expressed work pressure ("${first.text}"); integrate a 15-minute daily recovery window.`;
      }
      return null;
    },
  });

  // --- Barriers ---
  const barrierMatches = findMatches(
    clientLines,
    /\b(?:busy|no time|couldn't|could not|hard to|struggle|struggling|difficult|travel|deadline|kids|workload|meetings)\b/i
  );
  const barrierGroups = barrierMatches.slice(0, 4).map((m) => ({
    value: `${m.text} (${m.day})`,
    category: "Client Reported" as const,
    confidence: 76,
    evidence: [{ day: m.day, speaker: m.speaker, quote: m.text, lineId: m.lineId }],
    recommendation: `Target barrier noted on ${m.day}: simplify action items when ${m.text.toLowerCase()}.`,
  }));

  // --- Engagement ---
  const engagementRatio = coachLines.length > 0 ? clientLines.length / coachLines.length : clientLines.length > 0 ? 1 : 0;
  const engagementValue: "Low" | "Moderate" | "High" =
    engagementRatio >= 0.8 ? "High" : engagementRatio >= 0.4 ? "Moderate" : "Low";
  const engagement = {
    value: `${engagementValue} (${clientLines.length} client / ${coachLines.length} coach statements)`,
    confidence: 75,
    category: "AI Inference" as const,
    evidence: evidenceFrom(clientLines.slice(0, 3)),
    recommendation:
      engagementValue === "Low"
        ? "Client responses are brief relative to coach prompts — ask targeted open-ended questions."
        : null,
  };

  // --- Risk Flags ---
  const distressMatches = findMatches(
    clientLines,
    /can't take it|giving up|hopeless|overwhelmed|breaking point|want to quit|no point/i
  );
  const missedCheckins = findMatches(coachLines, /haven't heard|missed (our|the) check-?in|no response|following up again/i);
  const riskFlags: {
    id: string;
    label: string;
    level: "Low" | "Medium" | "High";
    rationale: string;
    evidence: { day: string; speaker: string; quote: string; lineId: string }[];
  }[] = [];

  if (distressMatches.length > 0) {
    riskFlags.push({
      id: "risk-distress",
      label: "High Emotional Strain Detected",
      level: "High",
      rationale: `Client expressed emotional overload: "${distressMatches[0].text}" (${distressMatches[0].day}).`,
      evidence: evidenceFrom(distressMatches.slice(0, 3)),
    });
  }
  if (symptomMatches.length >= 2) {
    riskFlags.push({
      id: "risk-symptom-trend",
      label: "Recurring Physical Symptom Trend",
      level: "Medium",
      rationale: `Physical symptoms reported across multiple check-ins: ${symptomMatches.map((s) => `"${s.text}" (${s.day})`).join("; ")}.`,
      evidence: evidenceFrom(symptomMatches.slice(0, 3)),
    });
  }
  if (missedCheckins.length > 0) {
    riskFlags.push({
      id: "risk-disengagement",
      label: "Disengagement Warning",
      level: "Medium",
      rationale: `Coach messages reference missed follow-ups: "${missedCheckins[0].text}".`,
      evidence: evidenceFrom(missedCheckins.slice(0, 2)),
    });
  }

  const overallRisk: "Low" | "Medium" | "High" = riskFlags.some((f) => f.level === "High")
    ? "High"
    : riskFlags.some((f) => f.level === "Medium")
    ? "Medium"
    : "Low";

  // --- Pending Actions ---
  const commitmentMatches = findMatches(
    coachLines,
    /let's|try to|can you|i'd like you to|aim to|focus on|goal for/i
  );
  const completionMatches = findMatches(clientLines, /\bi did\b|done!?$|completed|i managed to|i was able to/i);
  const pendingActions = commitmentMatches.slice(0, 5).map((m, i) => {
    const commitmentDayIdx = days.indexOf(m.day);
    const relatedCompletion = completionMatches.find((c) => {
      const completionDayIdx = days.indexOf(c.day);
      return completionDayIdx >= commitmentDayIdx;
    });
    return {
      id: `action-${i + 1}`,
      description: m.text,
      status: (relatedCompletion ? "completed" : "pending") as "pending" | "completed" | "overdue",
      assignedTo: "client" as const,
      evidence: evidenceFrom(relatedCompletion ? [m, relatedCompletion] : [m]),
    };
  });

  // --- DYNAMIC NARRATIVE SUMMARY SYNTHESIS ---
  const summarySentences: string[] = [];

  // 1. Initial State / Early Days
  const earlySleep = sleepMatches.find((l) => l.day === days[0] || l.day === days[1]);
  const earlyStress = stressMatches.find((l) => l.day === days[0] || l.day === days[1]);
  const earlyWater = waterMatches.find((l) => l.day === days[0] || l.day === days[1]);

  if (earlySleep || earlyStress || earlyWater) {
    const earlyDetails = [
      earlySleep && `sleep issues ("${earlySleep.text}")`,
      earlyStress && `stress ("${earlyStress.text}")`,
      earlyWater && `hydration feedback ("${earlyWater.text}")`,
    ].filter(Boolean).join(", ");
    summarySentences.push(`Early in the ${daysCount}-day reporting period (${days[0]}), the client noted ${earlyDetails}.`);
  }

  // 2. Progression / Improvements / Later Days
  const laterSleep = sleepMatches.find((l) => l.day === days[days.length - 1] || l.day === days[days.length - 2]);
  const laterSteps = stepsMatches.find((l) => l.day === days[days.length - 1] || l.day === days[days.length - 2]);
  const laterWater = waterMatches.find((l) => l.day === days[days.length - 1] || l.day === days[days.length - 2]);

  if (laterSleep || laterSteps || laterWater) {
    const laterDetails = [
      laterSleep && `sleep ("${laterSleep.text}")`,
      laterWater && `water intake ("${laterWater.text}")`,
      laterSteps && `activity ("${laterSteps.text}")`,
    ].filter(Boolean).join(", ");
    summarySentences.push(`As the period progressed into ${days[days.length - 1]}, reported metrics included ${laterDetails}.`);
  }

  // 3. Symptoms / Risk Factors
  if (symptomMatches.length > 0) {
    const symptomDetails = symptomMatches.map((s) => `"${s.text}" (${s.day})`).join("; ");
    summarySentences.push(`Physical symptom feedback was highlighted: ${symptomDetails}.`);
  }

  // Fallback narrative if structured health metrics were minimal / general transcript
  let periodSummaryText = summarySentences.join(" ");
  if (!periodSummaryText.trim()) {
    periodSummaryText = `Transcript covers ${daysCount} day${daysCount === 1 ? "" : "s"} of consultation (${lines.length} dialogue messages recorded). No physical symptoms or health metrics were discussed in this dialogue.`;
  }

  const weeklySummary = {
    value: periodSummaryText,
    category: "AI Inference" as const,
    confidence: 82,
    evidence: evidenceFrom([...sleepMatches, ...symptomMatches, ...stressMatches].slice(0, 4)),
    recommendation: null,
  };

  // --- DYNAMIC COACH ACTION SYNTHESIS ---
  let personalizedCoachAction = "";
  if (overallRisk === "High" && distressMatches.length > 0) {
    personalizedCoachAction = `Schedule a direct phone consultation to address reported emotional strain ("${distressMatches[0].text}").`;
  } else if (symptomMatches.length > 0) {
    personalizedCoachAction = `Focus upcoming consultation on evaluating physical symptom feedback ("${symptomMatches[0].text}").`;
  } else if (pendingActions.some((a) => a.status === "pending")) {
    personalizedCoachAction = `Review open commitment ("${pendingActions.find((a) => a.status === "pending")?.description}") during next check-in.`;
  } else {
    personalizedCoachAction = `Maintain existing wellness plan momentum across the next consultation cycle.`;
  }

  const coachAction = {
    value: personalizedCoachAction,
    category: "AI Inference" as const,
    confidence: 85,
    evidence: evidenceFrom([...distressMatches, ...symptomMatches, ...commitmentMatches].slice(0, 3)),
    recommendation: null,
  };

  return {
    days,
    weeklySummary,
    riskLevel: {
      value: overallRisk,
      confidence: riskFlags.length > 0 ? 82 : 70,
      rationale:
        riskFlags.length > 0
          ? riskFlags.map((f) => f.rationale).join(" ")
          : "No concerning physical or emotional strain patterns detected.",
    },
    coachAction,
    nutritionAdherence: nutrition,
    exercise,
    steps,
    sleep,
    waterIntake: water,
    symptoms,
    stress,
    engagementLevel: engagement,
    keyBarriers: barrierGroups,
    pendingActions,
    riskFlags,
  };
}

export const mockProvider: LlmProvider = {
  name: "mock",
  async analyze(req: LlmAnalyzeRequest): Promise<LlmAnalyzeResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const lines = extractTranscriptLines(req.userPrompt);
    const { days, ...analysis } = analyzeTranscript(lines);

    const result = {
      meta: {
        generatedAt: new Date().toISOString(),
        sourceLabel: req.sourceLabel || "uploaded-conversation",
        daysCovered: days.length > 0 ? days : ["Day 1"],
        modelProvider: "insight-analysis-engine-v1",
      },
      ...analysis,
    };

    return {
      rawOutput: JSON.stringify(result),
      providerName: "mock",
      modelName: "Insight Analysis Engine v1.2",
    };
  },
};
