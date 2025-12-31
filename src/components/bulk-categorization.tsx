"use client";

import { useState, useTransition } from "react";
import type { TimeIntervalWithCategory, ProductivityCategory } from "@/types";
import { updateInterval } from "@/lib/actions";
import { formatTimeRange } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkCategorizationProps {
  intervals: TimeIntervalWithCategory[];
  categories: ProductivityCategory[];
  totalIntervals: number;
}

export function BulkCategorization({
  intervals,
  categories,
  totalIntervals,
}: BulkCategorizationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localIntervals, setLocalIntervals] = useState(intervals);
  const [isPending, startTransition] = useTransition();

  const currentInterval = localIntervals[currentIndex];
  const progressPercentage = Math.round(
    ((totalIntervals - localIntervals.length) / totalIntervals) * 100
  );

  const handleCategorySelect = (categoryId: string) => {
    if (!currentInterval) return;

    startTransition(async () => {
      await updateInterval(currentInterval.id, { categoryId });
      
      // Remove from local list and move to next
      const newIntervals = localIntervals.filter((_, i) => i !== currentIndex);
      setLocalIntervals(newIntervals);
      
      // Adjust index if needed
      if (currentIndex >= newIntervals.length) {
        setCurrentIndex(Math.max(0, newIntervals.length - 1));
      }
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(localIntervals.length - 1, prev + 1));
  };

  if (localIntervals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">All Done!</h3>
          <p className="text-muted-foreground">
            All logged intervals have been categorized.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Uncategorized Entries</CardTitle>
            <span className="text-sm text-muted-foreground">
              {localIntervals.length} remaining
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {progressPercentage}% of intervals categorized
          </p>
        </CardContent>
      </Card>

      {currentInterval && (
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatTimeRange(
                  new Date(currentInterval.startTime),
                  new Date(currentInterval.endTime)
                )}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {localIntervals.length}
            </span>
          </div>

          {/* Activity Text */}
          <div className="p-6">
            <p className="text-lg text-center mb-6">
              &ldquo;{currentInterval.activityText}&rdquo;
            </p>

            {/* Category Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  disabled={isPending}
                  className={cn(
                    "rounded-xl p-4 text-center transition-all",
                    "hover:scale-105 hover:shadow-lg",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                    isPending && "opacity-50 pointer-events-none"
                  )}
                  style={{
                    backgroundColor: cat.color + "20",
                    borderColor: cat.color,
                    border: "2px solid",
                  }}
                >
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: cat.color }}
                  >
                    {cat.value}
                  </div>
                  <div className="text-sm font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentIndex === 0 || isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={currentIndex >= localIntervals.length - 1 || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
