"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { exportToCSV, exportToMarkdown } from "@/lib/export";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FileSpreadsheet, Download, Loader2 } from "lucide-react";

interface ExportPanelProps {
  defaultStartDate: Date;
  defaultEndDate: Date;
}

export function ExportPanel({ defaultStartDate, defaultEndDate }: ExportPanelProps) {
  const [startDate, setStartDate] = useState(format(defaultStartDate, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(defaultEndDate, "yyyy-MM-dd"));
  const [isPending, startTransition] = useTransition();

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    startTransition(async () => {
      const content = await exportToCSV(new Date(startDate), new Date(endDate));
      downloadFile(
        content,
        `timelens-export-${startDate}-to-${endDate}.csv`,
        "text/csv;charset=utf-8;"
      );
    });
  };

  const handleExportMarkdown = () => {
    startTransition(async () => {
      const content = await exportToMarkdown(new Date(startDate), new Date(endDate));
      downloadFile(
        content,
        `timelens-report-${startDate}-to-${endDate}.md`,
        "text/markdown;charset=utf-8;"
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select the period to export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* CSV Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">CSV Export</CardTitle>
                <CardDescription>Spreadsheet-compatible format</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export all logged intervals with timestamps, activities, and categories. 
              Perfect for importing into Excel, Google Sheets, or data analysis tools.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Date, time, and activity text</li>
              <li>• Category assignments and values</li>
              <li>• Entry timestamps</li>
            </ul>
            <Button
              onClick={handleExportCSV}
              disabled={isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download CSV
            </Button>
          </CardContent>
        </Card>

        {/* Markdown Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                <FileText className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Markdown Report</CardTitle>
                <CardDescription>Formatted weekly review</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a formatted report with summary statistics, daily breakdowns, 
              and category analysis. Great for journaling or team sharing.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Summary statistics</li>
              <li>• Daily productivity scores</li>
              <li>• Category time breakdowns</li>
            </ul>
            <Button
              onClick={handleExportMarkdown}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Markdown
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
