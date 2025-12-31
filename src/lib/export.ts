"use server";

import prisma from "@/lib/db";
import { format } from "date-fns";
import { calculateDailyScore } from "@/lib/scoring";

export async function exportToCSV(startDate: Date, endDate: Date): Promise<string> {
  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      intervals: {
        include: { category: true },
        orderBy: { startTime: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  // CSV header
  const headers = [
    "Date",
    "Interval Start",
    "Interval End",
    "Activity",
    "Category",
    "Category Value",
    "Logged At",
  ].join(",");

  // CSV rows
  const rows: string[] = [];
  
  for (const log of logs) {
    const dateStr = format(new Date(log.date), "yyyy-MM-dd");
    
    for (const interval of log.intervals) {
      const startStr = format(new Date(interval.startTime), "HH:mm");
      const endStr = format(new Date(interval.endTime), "HH:mm");
      const activity = interval.activityText 
        ? `"${interval.activityText.replace(/"/g, '""')}"` 
        : "";
      const category = interval.category?.label || "";
      const categoryValue = interval.category?.value ?? "";
      const loggedAt = interval.loggedAt 
        ? format(new Date(interval.loggedAt), "yyyy-MM-dd HH:mm:ss") 
        : "";

      rows.push([
        dateStr,
        startStr,
        endStr,
        activity,
        category,
        categoryValue,
        loggedAt,
      ].join(","));
    }
  }

  return [headers, ...rows].join("\n");
}

export async function exportToMarkdown(startDate: Date, endDate: Date): Promise<string> {
  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      intervals: {
        include: { category: true },
        orderBy: { startTime: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });

  let markdown = `# Productivity Report\n\n`;
  markdown += `**Period**: ${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}\n\n`;
  markdown += `**Generated**: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}\n\n`;
  markdown += `---\n\n`;

  // Summary stats
  let totalScore = 0;
  let totalLogged = 0;
  let totalIntervals = 0;

  for (const log of logs) {
    const score = calculateDailyScore(log.intervals, log.intervalMinutes);
    totalScore += score.productivityPercentage;
    totalLogged += score.loggedIntervals;
    totalIntervals += score.totalIntervals;
  }

  const avgScore = logs.length > 0 ? totalScore / logs.length : 0;

  markdown += `## Summary\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Days Tracked | ${logs.length} |\n`;
  markdown += `| Average Score | ${avgScore.toFixed(1)}% |\n`;
  markdown += `| Total Intervals Logged | ${totalLogged} |\n`;
  markdown += `| Coverage | ${totalIntervals > 0 ? Math.round((totalLogged / totalIntervals) * 100) : 0}% |\n\n`;

  // Daily breakdown
  markdown += `## Daily Breakdown\n\n`;

  for (const log of logs) {
    const dateStr = format(new Date(log.date), "EEEE, MMMM d, yyyy");
    const score = calculateDailyScore(log.intervals, log.intervalMinutes);
    
    markdown += `### ${dateStr}\n\n`;
    markdown += `**Score**: ${score.productivityPercentage.toFixed(1)}% | `;
    markdown += `**Logged**: ${score.loggedIntervals}/${score.totalIntervals} intervals\n\n`;

    if (log.daySummary) {
      markdown += `> ${log.daySummary}\n\n`;
    }

    // Category breakdown
    if (score.categoryBreakdown.length > 0) {
      markdown += `| Category | Time | Intervals |\n`;
      markdown += `|----------|------|-----------|\n`;
      for (const cat of score.categoryBreakdown) {
        const hours = Math.floor(cat.totalMinutes / 60);
        const mins = cat.totalMinutes % 60;
        markdown += `| ${cat.label} | ${hours}h ${mins}m | ${cat.intervalCount} |\n`;
      }
      markdown += `\n`;
    }

    // Top activities
    const activities = log.intervals
      .filter((i) => i.activityText)
      .slice(0, 5);
    
    if (activities.length > 0) {
      markdown += `**Activities**:\n`;
      for (const activity of activities) {
        const time = format(new Date(activity.startTime), "HH:mm");
        markdown += `- ${time}: ${activity.activityText}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  return markdown;
}

export async function getExportData(days: number = 7) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}
