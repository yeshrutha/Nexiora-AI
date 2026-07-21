export interface ReportingPeriodInfo {
  title: string;
  summaryLabel: string;
  badgeText: string;
  periodLabel: string;
}

/**
 * Calculates dynamic reporting period parameters based on transcript duration.
 * 
 * Rules:
 * - 1 Day -> Daily Report (1 Day)
 * - 2-6 Days -> Multi-Day Client Report (X Days Analyzed)
 * - Exactly 7 Days -> Weekly Client Intelligence Report (7 Days)
 * - 8-30 Days -> Multi-Week Client Intelligence Report (X Days)
 * - More than 30 Days -> Longitudinal Client Intelligence Report (X Days)
 */
export function calculateReportingPeriod(daysCount: number): ReportingPeriodInfo {
  const count = Math.max(1, daysCount || 1);

  if (count === 1) {
    return {
      title: "Daily Report",
      summaryLabel: "Daily Summary",
      badgeText: "1 Day",
      periodLabel: "analyzed day",
    };
  }

  if (count >= 2 && count <= 6) {
    return {
      title: "Multi-Day Client Report",
      summaryLabel: "Multi-Day Summary",
      badgeText: `${count} Days Analyzed`,
      periodLabel: `analyzed ${count}-day period`,
    };
  }

  if (count === 7) {
    return {
      title: "Weekly Client Intelligence Report",
      summaryLabel: "Weekly Summary",
      badgeText: "7 Days",
      periodLabel: "analyzed week",
    };
  }

  if (count >= 8 && count <= 30) {
    return {
      title: "Multi-Week Client Intelligence Report",
      summaryLabel: "Multi-Week Summary",
      badgeText: `${count} Days`,
      periodLabel: `analyzed ${count}-day period`,
    };
  }

  return {
    title: "Longitudinal Client Intelligence Report",
    summaryLabel: "Longitudinal Summary",
    badgeText: `${count} Days`,
    periodLabel: `analyzed ${count}-day period`,
  };
}
