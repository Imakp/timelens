"use server";

import prisma from "@/lib/db";
import { generateIntervals } from "@/lib/scoring";
import { revalidatePath } from "next/cache";
import type { DayStatus, UpdateIntervalData, CategoryFormData } from "@/types";

// ============================================================================
// User Settings
// ============================================================================

export async function getUserSettings() {
  let settings = await prisma.userSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        defaultIntervalMinutes: 15,
        defaultStartTime: "09:00",
        defaultEndTime: "17:00",
      },
    });
  }
  
  return settings;
}

export async function updateUserSettings(data: {
  defaultIntervalMinutes?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
}) {
  const settings = await getUserSettings();
  
  const updated = await prisma.userSettings.update({
    where: { id: settings.id },
    data,
  });
  
  revalidatePath("/settings");
  return updated;
}

// ============================================================================
// Productivity Categories
// ============================================================================

export async function getCategories() {
  return prisma.productivityCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createCategory(data: CategoryFormData) {
  const maxSort = await prisma.productivityCategory.aggregate({
    _max: { sortOrder: true },
  });
  
  const category = await prisma.productivityCategory.create({
    data: {
      ...data,
      sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
  
  revalidatePath("/settings");
  return category;
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>) {
  const category = await prisma.productivityCategory.update({
    where: { id },
    data,
  });
  
  revalidatePath("/settings");
  revalidatePath("/");
  return category;
}

export async function deleteCategory(id: string) {
  // Soft delete - just mark as inactive
  await prisma.productivityCategory.update({
    where: { id },
    data: { isActive: false },
  });
  
  revalidatePath("/settings");
  revalidatePath("/");
}

// ============================================================================
// Configuration Templates
// ============================================================================

export async function getTemplates() {
  return prisma.configurationTemplate.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTemplate(data: {
  name: string;
  intervalMinutes: number;
  startTime: string;
  endTime: string;
}) {
  const template = await prisma.configurationTemplate.create({ data });
  revalidatePath("/settings");
  return template;
}

export async function deleteTemplate(id: string) {
  await prisma.configurationTemplate.delete({ where: { id } });
  revalidatePath("/settings");
}

// ============================================================================
// Daily Logs
// ============================================================================

export async function getDailyLog(date: Date) {
  // Normalize date to midnight UTC
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  return prisma.dailyLog.findUnique({
    where: { date: normalizedDate },
    include: {
      intervals: {
        include: { category: true },
        orderBy: { startTime: "asc" },
      },
    },
  });
}

export async function getOrCreateDailyLog(
  date: Date,
  config?: {
    intervalMinutes?: number;
    startTime?: string;
    endTime?: string;
  }
) {
  // Normalize date to midnight UTC
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  // Check if log exists
  let dailyLog = await getDailyLog(normalizedDate);
  
  if (dailyLog) {
    return dailyLog;
  }
  
  // Get default settings if config not provided
  const settings = await getUserSettings();
  const intervalMinutes = config?.intervalMinutes ?? settings.defaultIntervalMinutes;
  const startTime = config?.startTime ?? settings.defaultStartTime;
  const endTime = config?.endTime ?? settings.defaultEndTime;
  
  // Generate intervals for the day
  const intervals = generateIntervals(normalizedDate, startTime, endTime, intervalMinutes);
  
  // Create daily log with intervals
  dailyLog = await prisma.dailyLog.create({
    data: {
      date: normalizedDate,
      intervalMinutes,
      startTime,
      endTime,
      intervals: {
        create: intervals.map((interval) => ({
          startTime: interval.startTime,
          endTime: interval.endTime,
        })),
      },
    },
    include: {
      intervals: {
        include: { category: true },
        orderBy: { startTime: "asc" },
      },
    },
  });
  
  revalidatePath("/");
  return dailyLog;
}

export async function updateDailyLogSummary(id: string, daySummary: string) {
  const updated = await prisma.dailyLog.update({
    where: { id },
    data: { daySummary },
  });
  
  revalidatePath("/");
  revalidatePath("/review");
  return updated;
}

export async function closeDay(id: string) {
  const updated = await prisma.dailyLog.update({
    where: { id },
    data: {
      status: "CLOSED" as DayStatus,
      closedAt: new Date(),
    },
  });
  
  revalidatePath("/");
  revalidatePath("/review");
  return updated;
}

export async function reopenDay(id: string) {
  const updated = await prisma.dailyLog.update({
    where: { id },
    data: {
      status: "REOPENED" as DayStatus,
      closedAt: null,
    },
  });
  
  revalidatePath("/");
  revalidatePath("/review");
  return updated;
}

export async function markDayAsPartial(id: string, isPartial: boolean) {
  const updated = await prisma.dailyLog.update({
    where: { id },
    data: { isPartial },
  });
  
  revalidatePath("/");
  return updated;
}

// ============================================================================
// Time Intervals
// ============================================================================

export async function updateInterval(id: string, data: UpdateIntervalData) {
  const updateData: Record<string, unknown> = {};
  
  if (data.activityText !== undefined) {
    updateData.activityText = data.activityText;
    // Set loggedAt if this is a new entry
    if (data.activityText) {
      updateData.loggedAt = new Date();
    }
  }
  
  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId;
  }
  
  const updated = await prisma.timeInterval.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });
  
  revalidatePath("/");
  return updated;
}

export async function bulkUpdateCategories(
  updates: { intervalId: string; categoryId: string }[]
) {
  const results = await Promise.all(
    updates.map((update) =>
      prisma.timeInterval.update({
        where: { id: update.intervalId },
        data: { categoryId: update.categoryId },
        include: { category: true },
      })
    )
  );
  
  revalidatePath("/");
  revalidatePath("/review");
  return results;
}

// ============================================================================
// Analytics
// ============================================================================

export async function getDailyLogs(startDate: Date, endDate: Date) {
  return prisma.dailyLog.findMany({
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
}

export async function getRecentLogs(days: number = 7) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  return getDailyLogs(startDate, endDate);
}
