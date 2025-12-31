import { getRecentLogs, getCategories } from "@/lib/actions";
import { CalendarView } from "@/components/calendar-view";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [logs, categories] = await Promise.all([
    getRecentLogs(30), // Last 30 days
    getCategories(),
  ]);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">
            View your productivity history and trends
          </p>
        </div>
      </div>

      <CalendarView logs={logs} categories={categories} />
    </div>
  );
}
