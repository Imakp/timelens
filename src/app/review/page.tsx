import { getOrCreateDailyLog, getCategories } from "@/lib/actions";
import { BulkCategorization } from "@/components/bulk-categorization";
import { DailySummary } from "@/components/daily-summary";
import { format } from "date-fns";
import { ListChecks } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailyLog, categories] = await Promise.all([
    getOrCreateDailyLog(today),
    getCategories(),
  ]);

  // Get uncategorized intervals (have text but no category)
  const uncategorizedIntervals = dailyLog.intervals.filter(
    (i) => i.activityText && !i.categoryId
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
          <ListChecks className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Day Review</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(dailyLog.date), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <DailySummary
        intervals={dailyLog.intervals}
        intervalMinutes={dailyLog.intervalMinutes}
        daySummary={dailyLog.daySummary}
      />

      {/* Bulk Categorization */}
      <BulkCategorization
        intervals={uncategorizedIntervals}
        categories={categories}
        totalIntervals={dailyLog.intervals.length}
      />
    </div>
  );
}
