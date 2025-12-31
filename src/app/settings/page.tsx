import { getUserSettings, getCategories, getTemplates } from "@/lib/actions";
import { SettingsForm } from "@/components/settings-form";
import { CategoryManager } from "@/components/category-manager";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, categories, templates] = await Promise.all([
    getUserSettings(),
    getCategories(),
    getTemplates(),
  ]);

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your interval and category preferences
          </p>
        </div>
      </div>

      {/* Default Settings */}
      <SettingsForm
        defaultIntervalMinutes={settings.defaultIntervalMinutes}
        defaultStartTime={settings.defaultStartTime}
        defaultEndTime={settings.defaultEndTime}
        templates={templates}
      />

      {/* Category Management */}
      <CategoryManager categories={categories} />
    </div>
  );
}
