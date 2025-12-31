import type { TimeIntervalWithCategory, DailyScore, CategoryBreakdown } from "@/types";

/**
 * Calculate the daily productivity score based on logged intervals
 */
export function calculateDailyScore(
  intervals: TimeIntervalWithCategory[],
  intervalMinutes: number
): DailyScore {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter intervals that have both activity text and category assigned
  const loggedIntervals = intervals.filter(
    (i) => i.activityText && i.categoryId && i.category
  );

  // Calculate category breakdown
  const categoryMap = new Map<string, { 
    categoryId: string;
    label: string;
    color: string;
    value: number;
    intervalCount: number;
    totalMinutes: number;
  }>();

  for (const interval of loggedIntervals) {
    if (!interval.category) continue;
    
    const existing = categoryMap.get(interval.categoryId!);
    if (existing) {
      existing.intervalCount++;
      existing.totalMinutes += intervalMinutes;
    } else {
      categoryMap.set(interval.categoryId!, {
        categoryId: interval.categoryId!,
        label: interval.category.label,
        color: interval.category.color,
        value: interval.category.value,
        intervalCount: 1,
        totalMinutes: intervalMinutes,
      });
    }
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.values());

  // Calculate productivity percentage
  // Total = sum of (category value * interval count)
  // Max possible = 100 * logged interval count
  const totalScore = categoryBreakdown.reduce(
    (sum, cat) => sum + cat.value * cat.intervalCount,
    0
  );
  const maxPossible = loggedIntervals.length * 100;

  const productivityPercentage =
    maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

  return {
    date: today,
    productivityPercentage: Math.round(productivityPercentage * 10) / 10,
    loggedIntervals: loggedIntervals.length,
    totalIntervals: intervals.length,
    categoryBreakdown,
  };
}

/**
 * Generate time intervals for a given date and configuration
 */
export function generateIntervals(
  date: Date,
  startTime: string,
  endTime: string,
  intervalMinutes: number
): { startTime: Date; endTime: Date }[] {
  const intervals: { startTime: Date; endTime: Date }[] = [];
  
  // Parse start and end times
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  
  // Create start datetime
  const currentStart = new Date(date);
  currentStart.setHours(startHour, startMin, 0, 0);
  
  // Create end datetime for the day
  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMin, 0, 0);
  
  // Generate intervals
  while (currentStart < dayEnd) {
    const intervalEnd = new Date(currentStart.getTime() + intervalMinutes * 60 * 1000);
    
    // Don't go past the end time
    if (intervalEnd > dayEnd) {
      break;
    }
    
    intervals.push({
      startTime: new Date(currentStart),
      endTime: new Date(intervalEnd),
    });
    
    currentStart.setTime(intervalEnd.getTime());
  }
  
  return intervals;
}

/**
 * Format time as HH:MM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format time range as "HH:MM - HH:MM"
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Check if an interval is the current active interval
 */
export function isCurrentInterval(start: Date, end: Date): boolean {
  const now = new Date();
  return now >= start && now < end;
}

/**
 * Get the logging coverage percentage
 */
export function getLoggingCoverage(
  loggedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((loggedCount / totalCount) * 100);
}
