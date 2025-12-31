import { getExportData } from "@/lib/export";
import { ExportPanel } from "@/components/export-panel";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const { startDate, endDate } = await getExportData(30);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Export Data</h1>
          <p className="text-sm text-muted-foreground">
            Download your productivity data in various formats
          </p>
        </div>
      </div>

      <ExportPanel defaultStartDate={startDate} defaultEndDate={endDate} />
    </div>
  );
}
