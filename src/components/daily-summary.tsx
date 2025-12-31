"use client";

import { useMemo } from "react";
import type { TimeIntervalWithCategory } from "@/types";
import { calculateDailyScore } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface DailySummaryProps {
  intervals: TimeIntervalWithCategory[];
  intervalMinutes: number;
  daySummary?: string | null;
}

export function DailySummary({ intervals, intervalMinutes, daySummary }: DailySummaryProps) {
  const score = useMemo(
    () => calculateDailyScore(intervals, intervalMinutes),
    [intervals, intervalMinutes]
  );

  const chartData = useMemo(() => {
    return score.categoryBreakdown.map((cat) => ({
      name: cat.label,
      value: cat.intervalCount,
      color: cat.color,
      minutes: cat.totalMinutes,
    }));
  }, [score.categoryBreakdown]);

  const loggedPercentage = Math.round(
    (score.loggedIntervals / score.totalIntervals) * 100
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    if (percentage >= 25) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 75) return "from-green-500/20 to-green-500/5";
    if (percentage >= 50) return "from-yellow-500/20 to-yellow-500/5";
    if (percentage >= 25) return "from-orange-500/20 to-orange-500/5";
    return "from-red-500/20 to-red-500/5";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Productivity Score */}
      <Card className={`bg-gradient-to-br ${getScoreGradient(score.productivityPercentage)}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
          <TrendingUp className={`h-4 w-4 ${getScoreColor(score.productivityPercentage)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getScoreColor(score.productivityPercentage)}`}>
            {score.productivityPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {score.loggedIntervals} logged intervals
          </p>
        </CardContent>
      </Card>

      {/* Logging Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Logging Coverage</CardTitle>
          {loggedPercentage >= 80 ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{loggedPercentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {score.loggedIntervals} of {score.totalIntervals} intervals
          </p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
              style={{ width: `${loggedPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Total Time Logged */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {Math.floor((score.loggedIntervals * intervalMinutes) / 60)}h{" "}
            {(score.loggedIntervals * intervalMinutes) % 60}m
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            of {Math.floor((score.totalIntervals * intervalMinutes) / 60)}h{" "}
            {(score.totalIntervals * intervalMinutes) % 60}m possible
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg bg-background/95 border px-3 py-2 shadow-lg backdrop-blur">
                            <p className="font-medium" style={{ color: data.color }}>
                              {data.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} intervals ({data.minutes} min)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "10px" }}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
              No categorized intervals yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Summary */}
      {daySummary && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Day Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{daySummary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
