"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import type { DailyLogWithIntervals, ProductivityCategory } from "@/types";
import { calculateDailyScore } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  logs: DailyLogWithIntervals[];
  categories: ProductivityCategory[];
}

export function CalendarView({ logs }: CalendarViewProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate scores for each day
  const dayScores = useMemo(() => {
    const scores = new Map<string, { score: number; logged: number; total: number }>();
    
    for (const log of logs) {
      const dateKey = format(new Date(log.date), "yyyy-MM-dd");
      const score = calculateDailyScore(log.intervals, log.intervalMinutes);
      scores.set(dateKey, {
        score: score.productivityPercentage,
        logged: score.loggedIntervals,
        total: score.totalIntervals,
      });
    }
    
    return scores;
  }, [logs]);

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return "bg-muted/30";
    if (score >= 75) return "bg-green-500/30 hover:bg-green-500/40";
    if (score >= 50) return "bg-yellow-500/30 hover:bg-yellow-500/40";
    if (score >= 25) return "bg-orange-500/30 hover:bg-orange-500/40";
    return "bg-red-500/30 hover:bg-red-500/40";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOffset = monthStart.getDay();

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const loggedDays = logs.filter(l => 
      new Date(l.date) >= monthStart && new Date(l.date) <= monthEnd
    );
    
    if (loggedDays.length === 0) {
      return { avgScore: 0, totalDays: 0, bestDay: null, totalHours: 0 };
    }
    
    let totalScore = 0;
    let bestDay: { date: Date; score: number } | null = null;
    let totalMinutes = 0;
    
    for (const log of loggedDays) {
      const score = calculateDailyScore(log.intervals, log.intervalMinutes);
      totalScore += score.productivityPercentage;
      totalMinutes += score.loggedIntervals * log.intervalMinutes;
      
      if (!bestDay || score.productivityPercentage > bestDay.score) {
        bestDay = { date: new Date(log.date), score: score.productivityPercentage };
      }
    }
    
    return {
      avgScore: Math.round(totalScore / loggedDays.length),
      totalDays: loggedDays.length,
      bestDay,
      totalHours: Math.round(totalMinutes / 60),
    };
  }, [logs, monthStart, monthEnd]);

  return (
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.avgScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Days Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.bestDay 
                ? `${monthlyStats.bestDay.score.toFixed(0)}%`
                : "—"}
            </div>
            {monthlyStats.bestDay && (
              <p className="text-xs text-muted-foreground">
                {format(monthlyStats.bestDay.date, "MMM d")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{format(today, "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Day cells */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayData = dayScores.get(dateKey);
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={dateKey}
                  className={cn(
                    "aspect-square rounded-lg p-1 transition-colors cursor-pointer",
                    getScoreColor(dayData?.score),
                    isTodayDate && "ring-2 ring-violet-500 ring-offset-2 ring-offset-background"
                  )}
                  title={dayData ? `${dayData.score.toFixed(0)}% - ${dayData.logged}/${dayData.total} intervals` : "No data"}
                >
                  <div className="h-full flex flex-col items-center justify-center">
                    <span className={cn(
                      "text-sm font-medium",
                      isTodayDate && "text-violet-500"
                    )}>
                      {format(day, "d")}
                    </span>
                    {dayData && (
                      <span className="text-xs text-muted-foreground">
                        {dayData.score.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500/30" />
              <span className="text-xs text-muted-foreground">75-100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-500/30" />
              <span className="text-xs text-muted-foreground">50-74%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-orange-500/30" />
              <span className="text-xs text-muted-foreground">25-49%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-500/30" />
              <span className="text-xs text-muted-foreground">0-24%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
