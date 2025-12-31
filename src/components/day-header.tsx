"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { closeDay, reopenDay, updateDailyLogSummary } from "@/lib/actions";
import {
  Calendar,
  Clock,
  Lock,
  Unlock,
  CheckCircle,
  Timer,
} from "lucide-react";

interface DayHeaderProps {
  date: Date;
  status: string;
  intervalMinutes: number;
  startTime: string;
  endTime: string;
  dailyLogId: string;
}

export function DayHeader({
  date,
  status,
  intervalMinutes,
  startTime,
  endTime,
  dailyLogId,
}: DayHeaderProps) {
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [daySummary, setDaySummary] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCloseDay = () => {
    startTransition(async () => {
      if (daySummary.trim()) {
        await updateDailyLogSummary(dailyLogId, daySummary);
      }
      await closeDay(dailyLogId);
      setShowCloseDialog(false);
    });
  };

  const handleReopenDay = () => {
    startTransition(async () => {
      await reopenDay(dailyLogId);
    });
  };

  const isClosed = status === "CLOSED";

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-500 flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {format(new Date(date), "EEEE, MMMM d")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{intervalMinutes}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isClosed ? (
                <>
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                  <span className="text-orange-500">Closed</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-green-500">Active</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isClosed ? (
            <Button
              variant="outline"
              onClick={handleReopenDay}
              disabled={isPending}
            >
              <Unlock className="h-4 w-4 mr-2" />
              Reopen Day
            </Button>
          ) : (
            <Button
              onClick={() => setShowCloseDialog(true)}
              disabled={isPending}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              Close Day
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Day</DialogTitle>
            <DialogDescription>
              Closing the day will lock all intervals and prevent further edits.
              You can add an optional reflection note.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="How was your day? (optional)"
            value={daySummary}
            onChange={(e) => setDaySummary(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseDay}
              disabled={isPending}
              className="bg-gradient-to-r from-violet-500 to-indigo-600"
            >
              Close Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
