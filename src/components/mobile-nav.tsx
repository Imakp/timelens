"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Clock, BarChart3, Calendar, ListChecks, Settings, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Today: Clock,
  Review: ListChecks,
  History: Calendar,
  Analytics: BarChart3,
  Export: Download,
  Settings: Settings,
};

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Clock className="h-4 w-4 text-white" />
            </div>
            TimeLens
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {links.map((link) => {
            const Icon = iconMap[link.label] || Clock;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
                  "hover:bg-muted transition-colors",
                  "active:bg-muted/80"
                )}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                {link.label}
              </a>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
