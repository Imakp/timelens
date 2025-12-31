"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import type { DailyLogWithIntervals } from "@/types";
import { calculateDailyScore } from "@/lib/scoring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  logs: DailyLogWithIntervals[];
}

type TimeRange = "7d" | "14d" | "30d";

export function AnalyticsDashboard({ logs }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const daysCount = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30;

  // Calculate daily scores and filter by time range
  const dailyData = useMemo(() => {
    const cutoffDate = subDays(new Date(), daysCount);
    
    return logs
      .filter((log) => new Date(log.date) >= cutoffDate)
      .map((log) => {
        const score = calculateDailyScore(log.intervals, log.intervalMinutes);
        return {
          date: new Date(log.date),
          dateStr: format(new Date(log.date), "MMM d"),
          dayName: format(new Date(log.date), "EEE"),
          score: score.productivityPercentage,
          logged: score.loggedIntervals,
          total: score.totalIntervals,
          coverage: Math.round((score.loggedIntervals / score.totalIntervals) * 100),
          breakdown: score.categoryBreakdown,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [logs, daysCount]);

  // Summary statistics
  const stats = useMemo(() => {
    if (dailyData.length === 0) {
      return {
        avgScore: 0,
        trend: 0,
        bestDay: null,
        worstDay: null,
        totalHours: 0,
        avgCoverage: 0,
        streakDays: 0,
      };
    }

    const scores = dailyData.map((d) => d.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate trend (compare first half to second half)
    const midpoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midpoint);
    const secondHalf = scores.slice(midpoint);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    const trend = secondAvg - firstAvg;

    const bestDay = dailyData.reduce((best, d) => (!best || d.score > best.score ? d : best), dailyData[0]);
    const worstDay = dailyData.reduce((worst, d) => (!worst || d.score < worst.score ? d : worst), dailyData[0]);

    const totalMinutes = dailyData.reduce((sum, d) => {
      const log = logs.find((l) => format(new Date(l.date), "yyyy-MM-dd") === format(d.date, "yyyy-MM-dd"));
      return sum + (log ? d.logged * log.intervalMinutes : 0);
    }, 0);

    const avgCoverage = dailyData.reduce((sum, d) => sum + d.coverage, 0) / dailyData.length;

    // Calculate streak
    let streakDays = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].coverage > 50) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      avgScore: Math.round(avgScore * 10) / 10,
      trend: Math.round(trend * 10) / 10,
      bestDay,
      worstDay,
      totalHours: Math.round(totalMinutes / 60),
      avgCoverage: Math.round(avgCoverage),
      streakDays,
    };
  }, [dailyData, logs]);

  // Category totals for the period
  const categoryTotals = useMemo(() => {
    const totals = new Map<string, { count: number; minutes: number; label: string; color: string }>();

    for (const day of dailyData) {
      for (const cat of day.breakdown) {
        const existing = totals.get(cat.categoryId);
        if (existing) {
          existing.count += cat.intervalCount;
          existing.minutes += cat.totalMinutes;
        } else {
          totals.set(cat.categoryId, {
            count: cat.intervalCount,
            minutes: cat.totalMinutes,
            label: cat.label,
            color: cat.color,
          });
        }
      }
    }

    return Array.from(totals.values()).sort((a, b) => b.minutes - a.minutes);
  }, [dailyData]);

  // Day of week analysis
  const dayOfWeekData = useMemo(() => {
    const dayMap = new Map<string, { scores: number[]; name: string }>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (const day of dailyData) {
      const dayIndex = day.date.getDay();
      const dayName = dayNames[dayIndex];
      const existing = dayMap.get(dayName);
      if (existing) {
        existing.scores.push(day.score);
      } else {
        dayMap.set(dayName, { scores: [day.score], name: dayName });
      }
    }

    return dayNames.map((name) => {
      const data = dayMap.get(name);
      const avg = data && data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : 0;
      return { name, avgScore: Math.round(avg) };
    });
  }, [dailyData]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["7d", "14d", "30d"] as TimeRange[]).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className={cn(
              timeRange === range && "bg-gradient-to-r from-violet-500 to-indigo-600"
            )}
          >
            {range === "7d" ? "7 Days" : range === "14d" ? "14 Days" : "30 Days"}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            {stats.trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
            <p className={cn(
              "text-xs",
              stats.trend > 0 ? "text-green-500" : "text-red-500"
            )}>
              {stats.trend > 0 ? "+" : ""}{stats.trend}% trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bestDay ? `${stats.bestDay.score.toFixed(0)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.bestDay ? format(stats.bestDay.date, "EEEE, MMM d") : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.totalHours / daysCount * 10) / 10}h/day avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Target className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays} days</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgCoverage}% avg coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trend</CardTitle>
          <CardDescription>Daily productivity scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dateStr" 
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-background/95 border px-3 py-2 shadow-lg backdrop-blur">
                          <p className="font-medium">{data.dayName}, {data.dateStr}</p>
                          <p className="text-sm text-violet-500">{data.score.toFixed(1)}% productive</p>
                          <p className="text-xs text-muted-foreground">
                            {data.logged}/{data.total} intervals ({data.coverage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Day of Week Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Day of Week Performance</CardTitle>
            <CardDescription>Average productivity by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-background/95 border px-3 py-2 shadow-lg">
                            <p className="font-medium">{payload[0].payload.name}</p>
                            <p className="text-sm text-violet-500">{payload[0].value}% avg</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Time by Category</CardTitle>
            <CardDescription>How you spent your time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryTotals.map((cat) => {
                const hours = Math.floor(cat.minutes / 60);
                const mins = cat.minutes % 60;
                const maxMinutes = Math.max(...categoryTotals.map((c) => c.minutes));
                const percentage = maxMinutes > 0 ? (cat.minutes / maxMinutes) * 100 : 0;

                return (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {hours}h {mins}m ({cat.count} intervals)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {categoryTotals.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No categorized data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
