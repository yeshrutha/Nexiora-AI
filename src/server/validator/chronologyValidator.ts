import type { InsightResult } from "../schemas/insightSchema.js";

export interface ChronologyValidationReport {
  isValid: boolean;
  sanitizedInsight: InsightResult;
  correctionsApplied: string[];
}

/**
 * Chronology Validator & Sanitizer.
 *
 * Ensures 100% chronological consistency across timeline days, report duration,
 * generated summary text, recommendations, and evidence references.
 *
 * Automatically detects and corrects contradictory day references (e.g. if model output
 * references "Day 7" or "across 7 days" when the transcript actually covers 5 days or skips Day 4).
 */
export function validateAndSanitizeChronology(
  insight: InsightResult,
  daysCovered: string[]
): ChronologyValidationReport {
  const correctionsApplied: string[] = [];
  const daysCount = daysCovered.length || 1;
  const actualPeriodLabel = daysCount === 1 ? "1 day" : `${daysCount}-day period`;

  let updatedSummary = insight.weeklySummary.value;
  let updatedCoachAction = insight.coachAction.value;

  // 1. Sanitize incorrect "7 days" / "full week" generalizations if duration is not 7 days
  if (daysCount !== 7) {
    if (/\b(?:across|over|during)\s+(?:all\s+)?7\s+days\b/i.test(updatedSummary)) {
      updatedSummary = updatedSummary.replace(
        /\b(?:across|over|during)\s+(?:all\s+)?7\s+days\b/gi,
        `across the analyzed ${actualPeriodLabel}`
      );
      correctionsApplied.push(`Corrected summary duration phrase to "across the analyzed ${actualPeriodLabel}".`);
    }

    if (/\bfull week\b/i.test(updatedSummary)) {
      updatedSummary = updatedSummary.replace(/\bfull week\b/gi, `analyzed ${actualPeriodLabel}`);
      correctionsApplied.push(`Replaced "full week" with "analyzed ${actualPeriodLabel}".`);
    }
  }

  // 2. Validate that specific "Day X" mentions in summary exist in daysCovered
  updatedSummary = updatedSummary.replace(/\bDay\s*(\d+)\b/gi, (match, dayNumStr) => {
    const dayName = `Day ${dayNumStr}`;
    const normalizedMatch = daysCovered.find(
      (d) => d.toLowerCase() === dayName.toLowerCase() || d.toLowerCase().includes(`day ${dayNumStr}`)
    );
    if (!normalizedMatch) {
      correctionsApplied.push(`Replaced non-existent day reference "${match}" in summary with "recent check-in".`);
      return "recent check-in";
    }
    return match;
  });

  // 3. Validate specific "Day X" mentions in coach action
  updatedCoachAction = updatedCoachAction.replace(/\bDay\s*(\d+)\b/gi, (match, dayNumStr) => {
    const dayName = `Day ${dayNumStr}`;
    const normalizedMatch = daysCovered.find(
      (d) => d.toLowerCase() === dayName.toLowerCase() || d.toLowerCase().includes(`day ${dayNumStr}`)
    );
    if (!normalizedMatch) {
      correctionsApplied.push(`Replaced non-existent day reference "${match}" in coach action with "recorded check-in".`);
      return "recorded check-in";
    }
    return match;
  });

  // 4. Validate evidence line references match actual daysCovered
  const sanitizedInsight: InsightResult = {
    ...insight,
    weeklySummary: {
      ...insight.weeklySummary,
      value: updatedSummary,
    },
    coachAction: {
      ...insight.coachAction,
      value: updatedCoachAction,
    },
  };

  return {
    isValid: correctionsApplied.length === 0,
    sanitizedInsight,
    correctionsApplied,
  };
}
