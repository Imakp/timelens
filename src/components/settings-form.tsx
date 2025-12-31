"use client";

import { useState, useTransition } from "react";
import { updateUserSettings, createTemplate, deleteTemplate } from "@/lib/actions";
import { INTERVAL_DURATIONS } from "@/types";
import type { ConfigurationTemplate } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Save, Plus, Trash2 } from "lucide-react";

interface SettingsFormProps {
  defaultIntervalMinutes: number;
  defaultStartTime: string;
  defaultEndTime: string;
  templates: ConfigurationTemplate[];
}

export function SettingsForm({
  defaultIntervalMinutes,
  defaultStartTime,
  defaultEndTime,
  templates,
}: SettingsFormProps) {
  const [intervalMinutes, setIntervalMinutes] = useState(defaultIntervalMinutes);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [isPending, startTransition] = useTransition();

  // Template dialog state
  const [templateName, setTemplateName] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      await updateUserSettings({
        defaultIntervalMinutes: intervalMinutes,
        defaultStartTime: startTime,
        defaultEndTime: endTime,
      });
    });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    
    startTransition(async () => {
      await createTemplate({
        name: templateName,
        intervalMinutes,
        startTime,
        endTime,
      });
      setTemplateName("");
      setShowTemplateDialog(false);
    });
  };

  const handleApplyTemplate = (template: ConfigurationTemplate) => {
    setIntervalMinutes(template.intervalMinutes);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
  };

  const handleDeleteTemplate = (id: string) => {
    startTransition(async () => {
      await deleteTemplate(id);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Interval Configuration
        </CardTitle>
        <CardDescription>
          Set your default interval duration and active logging window
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interval Duration */}
        <div className="space-y-2">
          <Label htmlFor="interval">Interval Duration</Label>
          <Select
            value={intervalMinutes.toString()}
            onValueChange={(v) => setIntervalMinutes(Number(v))}
          >
            <SelectTrigger id="interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_DURATIONS.map((duration) => (
                <SelectItem key={duration} value={duration.toString()}>
                  {duration} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Window */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Templates */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                    disabled={isPending}
                  >
                    {template.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={isPending}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-gradient-to-r from-violet-500 to-indigo-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Defaults
          </Button>
          
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Configuration Template</DialogTitle>
                <DialogDescription>
                  Save your current settings as a reusable template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Weekday, Weekend, Night Shift"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || isPending}
                >
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
