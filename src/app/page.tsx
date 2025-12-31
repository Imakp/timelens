import { getOrCreateDailyLog, getCategories } from "@/lib/actions";
import { IntervalGrid } from "@/components/interval-grid";
import { DailySummary } from "@/components/daily-summary";
import { DayHeader } from "@/components/day-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailyLog, categories] = await Promise.all([
    getOrCreateDailyLog(today),
    getCategories(),
  ]);

  return (
    <div className="container py-6 space-y-6">
      {/* Day Header */}
      <DayHeader
        date={dailyLog.date}
        status={dailyLog.status}
        intervalMinutes={dailyLog.intervalMinutes}
        startTime={dailyLog.startTime}
        endTime={dailyLog.endTime}
        dailyLogId={dailyLog.id}
      />

      {/* Summary Stats */}
      <DailySummary
        intervals={dailyLog.intervals}
        intervalMinutes={dailyLog.intervalMinutes}
        daySummary={dailyLog.daySummary}
      />

      {/* Interval Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <IntervalGrid
          intervals={dailyLog.intervals}
          categories={categories}
          dayStatus={dailyLog.status}
        />
      </div>
    </div>
  );
}
