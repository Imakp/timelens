import type { 
  ProductivityCategory as PrismaCategory,
  DailyLog as PrismaDailyLog,
  TimeInterval as PrismaInterval,
  UserSettings as PrismaSettings,
  ConfigurationTemplate as PrismaTemplate
} from "@prisma/client";

// Re-export Prisma types for convenience
export type ProductivityCategory = PrismaCategory;
export type DailyLog = PrismaDailyLog;
export type TimeInterval = PrismaInterval;
export type UserSettings = PrismaSettings;
export type ConfigurationTemplate = PrismaTemplate;

// Valid interval durations in minutes
export type IntervalDuration = 5 | 10 | 15 | 20 | 30 | 45 | 60;

// Day status enum
export type DayStatus = "ACTIVE" | "CLOSED" | "REOPENED";

// Interval with its related category
export interface TimeIntervalWithCategory extends TimeInterval {
  category: ProductivityCategory | null;
}

// Daily log with all its intervals
export interface DailyLogWithIntervals extends DailyLog {
  intervals: TimeIntervalWithCategory[];
}

// Calculated productivity score for a day
export interface DailyScore {
  date: Date;
  productivityPercentage: number;
  loggedIntervals: number;
  totalIntervals: number;
  categoryBreakdown: CategoryBreakdown[];
}

// Breakdown of time spent in each category
export interface CategoryBreakdown {
  categoryId: string;
  label: string;
  color: string;
  value: number;
  intervalCount: number;
  totalMinutes: number;
}

// Form data for updating an interval
export interface UpdateIntervalData {
  activityText?: string | null;
  categoryId?: string | null;
}

// Form data for creating/updating a category
export interface CategoryFormData {
  label: string;
  value: number;
  color: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}

// Analytics data for a date range
export interface AnalyticsData {
  dateRange: { start: Date; end: Date };
  dailyScores: DailyScore[];
  averageScore: number;
  bestDay: { date: Date; score: number } | null;
  worstDay: { date: Date; score: number } | null;
  totalLoggedMinutes: number;
  categoryTotals: CategoryBreakdown[];
}

// Default interval duration options
export const INTERVAL_DURATIONS: IntervalDuration[] = [5, 10, 15, 20, 30, 45, 60];

// Default time options for start/end times
export const DEFAULT_START_TIME = "06:00";
export const DEFAULT_END_TIME = "23:00";

// Maximum characters for activity text
export const MAX_ACTIVITY_CHARS = 100;
