import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  {
    label: "Highly Productive",
    value: 100,
    color: "#22c55e",
    icon: "zap",
    description: "Core goal advancement, deep work, high-impact tasks",
    sortOrder: 1,
    isDefault: true,
  },
  {
    label: "Productive",
    value: 75,
    color: "#3b82f6",
    icon: "briefcase",
    description: "Maintenance tasks, planning, necessary work",
    sortOrder: 2,
    isDefault: true,
  },
  {
    label: "Neutral",
    value: 50,
    color: "#eab308",
    icon: "coffee",
    description: "Breaks, meals, transitions between activities",
    sortOrder: 3,
    isDefault: true,
  },
  {
    label: "Low Productivity",
    value: 25,
    color: "#f97316",
    icon: "clock",
    description: "Aware procrastination, low-priority activities",
    sortOrder: 4,
    isDefault: true,
  },
  {
    label: "Non-Productive",
    value: 0,
    color: "#ef4444",
    icon: "x-circle",
    description: "Distractions, time-wasting, unproductive activities",
    sortOrder: 5,
    isDefault: true,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create default categories
  for (const category of defaultCategories) {
    await prisma.productivityCategory.upsert({
      where: { id: category.label.toLowerCase().replace(/\s+/g, "-") },
      update: category,
      create: {
        id: category.label.toLowerCase().replace(/\s+/g, "-"),
        ...category,
      },
    });
  }

  console.log("✅ Created default productivity categories");

  // Create default user settings
  const existingSettings = await prisma.userSettings.findFirst();
  if (!existingSettings) {
    await prisma.userSettings.create({
      data: {
        defaultIntervalMinutes: 15,
        defaultStartTime: "09:00",
        defaultEndTime: "17:00",
      },
    });
    console.log("✅ Created default user settings");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
