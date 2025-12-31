import { getRecentLogs } from "@/lib/actions";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const logs = await getRecentLogs(30); // Last 30 days

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Trends, patterns, and insights from your productivity data
          </p>
        </div>
      </div>

      <AnalyticsDashboard logs={logs} />
    </div>
  );
}

