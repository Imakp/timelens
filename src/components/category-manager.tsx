"use client";

import { useState, useTransition } from "react";
import { updateCategory, createCategory, deleteCategory } from "@/lib/actions";
import type { ProductivityCategory, CategoryFormData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tags, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  categories: ProductivityCategory[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<ProductivityCategory | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [label, setLabel] = useState("");
  const [value, setValue] = useState(50);
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setLabel("");
    setValue(50);
    setColor("#3b82f6");
    setIcon("");
    setDescription("");
  };

  const openEditDialog = (category: ProductivityCategory) => {
    setEditingCategory(category);
    setLabel(category.label);
    setValue(category.value);
    setColor(category.color);
    setIcon(category.icon || "");
    setDescription(category.description || "");
  };

  const handleSave = () => {
    const data: CategoryFormData = {
      label,
      value,
      color,
      icon: icon || undefined,
      description: description || undefined,
    };

    startTransition(async () => {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        setEditingCategory(null);
      } else {
        await createCategory(data);
        setShowAddDialog(false);
      }
      resetForm();
    });
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 2) {
      alert("You must have at least 2 categories");
      return;
    }
    
    startTransition(async () => {
      await deleteCategory(id);
    });
  };

  const colorOptions = [
    "#22c55e", "#3b82f6", "#eab308", "#f97316", "#ef4444",
    "#8b5cf6", "#ec4899", "#14b8a6", "#64748b", "#0ea5e9",
  ];

  const CategoryForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="e.g., Deep Work"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Value (0-100)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="value"
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-24"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "h-8 w-8 rounded-full transition-transform hover:scale-110",
                color === c && "ring-2 ring-offset-2 ring-offset-background"
              )}
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
            />
          ))}
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 p-0 border-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="What qualifies for this category?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Productivity Categories
            </CardTitle>
            <CardDescription>
              Customize your productivity categories and their values
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-500 to-indigo-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Create a new productivity category
                </DialogDescription>
              </DialogHeader>
              <CategoryForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!label.trim() || isPending}>
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{category.label}</div>
                <div className="text-sm text-muted-foreground">
                  Value: {category.value}
                  {category.description && ` • ${category.description}`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(category)}
                  disabled={isPending}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  disabled={isPending || category.isDefault}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update this productivity category
              </DialogDescription>
            </DialogHeader>
            <CategoryForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!label.trim() || isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
