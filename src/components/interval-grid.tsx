"use client";

import { useState, useTransition } from "react";
import type { TimeIntervalWithCategory, ProductivityCategory } from "@/types";
import { formatTimeRange, isCurrentInterval } from "@/lib/scoring";
import { updateInterval } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Clock, Edit3, X } from "lucide-react";

interface IntervalGridProps {
  intervals: TimeIntervalWithCategory[];
  categories: ProductivityCategory[];
  dayStatus: string;
}

export function IntervalGrid({ intervals, categories, dayStatus }: IntervalGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isPending, startTransition] = useTransition();
  const isReadOnly = dayStatus === "CLOSED";

  const handleStartEdit = (interval: TimeIntervalWithCategory) => {
    if (isReadOnly) return;
    setEditingId(interval.id);
    setEditText(interval.activityText || "");
  };

  const handleSaveText = async () => {
    if (!editingId) return;
    
    startTransition(async () => {
      await updateInterval(editingId, { activityText: editText });
      setEditingId(null);
      setEditText("");
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleCategorySelect = async (intervalId: string, categoryId: string) => {
    if (isReadOnly) return;
    
    startTransition(async () => {
      await updateInterval(intervalId, { categoryId });
    });
  };



  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {intervals.map((interval) => {
        const isCurrent = isCurrentInterval(new Date(interval.startTime), new Date(interval.endTime));
        const isEditing = editingId === interval.id;
        const hasActivity = Boolean(interval.activityText);

        
        return (
          <Card
            key={interval.id}
            className={cn(
              "relative overflow-hidden transition-all duration-200",
              isCurrent && "ring-2 ring-violet-500 ring-offset-2 ring-offset-background",
              !hasActivity && !isEditing && "border-dashed",
              isReadOnly && "opacity-75"
            )}
            style={{
              borderLeftWidth: "4px",
              borderLeftColor: interval.category?.color || "transparent",
            }}
          >
            {/* Time header */}
            <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {formatTimeRange(new Date(interval.startTime), new Date(interval.endTime))}
                </span>
              </div>
              {isCurrent && (
                <span className="flex items-center gap-1 text-xs font-medium text-violet-500">
                  <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                  Now
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-3 min-h-[100px]">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value.slice(0, 100))}
                    placeholder="What did you do?"
                    className="min-h-[60px] resize-none text-sm"
                    autoFocus
                    disabled={isPending}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {editText.length}/100
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveText}
                        disabled={isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "h-full cursor-pointer rounded-md p-2 hover:bg-muted/50 transition-colors",
                    !hasActivity && "flex items-center justify-center"
                  )}
                  onClick={() => handleStartEdit(interval)}
                >
                  {hasActivity ? (
                    <p className="text-sm line-clamp-3">{interval.activityText}</p>
                  ) : (
                    <div className="text-center">
                      <Edit3 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {isReadOnly ? "No entry" : "Click to log"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category selector */}
            {hasActivity && !isEditing && (
              <div className="border-t p-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(interval.id, cat.id)}
                      disabled={isReadOnly || isPending}
                      className={cn(
                        "rounded-full px-3 py-1.5 sm:px-2 sm:py-0.5 text-xs font-medium transition-all",
                        "hover:ring-2 hover:ring-offset-1 hover:ring-offset-background",
                        "active:scale-95 touch-target",
                        interval.categoryId === cat.id
                          ? "ring-2 ring-offset-1 ring-offset-background"
                          : "opacity-60 hover:opacity-100",
                        isReadOnly && "pointer-events-none"
                      )}
                      style={{
                        backgroundColor: cat.color + "20",
                        color: cat.color,
                        borderColor: cat.color,
                        boxShadow: interval.categoryId === cat.id ? `0 0 0 2px ${cat.color}40` : undefined,
                      }}
                      title={cat.description || cat.label}
                    >
                      {cat.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
