"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { DatePreset, DateRange } from "@/types/analytics";

// ─── Presets ────────────────────────────────────────────────────────────────

const PRESETS: { label: string; value: DatePreset; days: number }[] = [
  { label: "7d",  value: "7d",  days: 6  },
  { label: "14d", value: "14d", days: 13 },
  { label: "30d", value: "30d", days: 29 },
  { label: "90d", value: "90d", days: 89 },
];

function presetToRange(days: number): DateRange {
  const today = new Date();
  return {
    start: format(subDays(today, days), "yyyy-MM-dd"),
    end:   format(today, "yyyy-MM-dd"),
  };
}

function displayRange(range: DateRange): string {
  const s = new Date(range.start + "T00:00:00");
  const e = new Date(range.end   + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(s)} – ${fmt(e)}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.start);
  const [customEnd, setCustomEnd] = useState(value.end);

  // Which preset is currently active (if any)
  const activePreset = PRESETS.find((p) => {
    const pr = presetToRange(p.days);
    return pr.start === value.start && pr.end === value.end;
  })?.value ?? null;

  function applyPreset(days: number) {
    const range = presetToRange(days);
    setCustomStart(range.start);
    setCustomEnd(range.end);
    onChange(range);
    setOpen(false);
  }

  function applyCustom() {
    if (customStart && customEnd && customStart <= customEnd) {
      onChange({ start: customStart, end: customEnd });
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="font-medium">{displayRange(value)}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-11 z-20 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            {/* Preset pills */}
            <div className="border-b border-border px-4 pt-3 pb-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quick select
              </p>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => applyPreset(p.days)}
                    className={cn(
                      "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                      activePreset === p.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    Last {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom range */}
            <div className="px-4 py-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Custom range
              </p>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">From</label>
                    <input
                      type="date"
                      value={customStart}
                      max={customEnd}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">To</label>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart}
                      max={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={applyCustom}
                  disabled={!customStart || !customEnd || customStart > customEnd}
                >
                  Apply range
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
