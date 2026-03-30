"use client";

import {
  Instagram, Youtube, Facebook, Twitter, Music2, Linkedin, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type CalendarPlatform,
  PLATFORM_CONFIG,
  PLATFORM_ORDER,
} from "@/types/calendar";

const PLATFORM_ICONS: Record<CalendarPlatform, React.ElementType> = {
  instagram: Instagram,
  youtube:   Youtube,
  facebook:  Facebook,
  twitter:   Twitter,
  tiktok:    Music2,
  linkedin:  Linkedin,
};

interface PlatformFilterProps {
  selected: Set<CalendarPlatform> | "all";
  onChange: (value: Set<CalendarPlatform> | "all") => void;
  counts: Record<CalendarPlatform, number>;
}

export function PlatformFilter({ selected, onChange, counts }: PlatformFilterProps) {
  const isAll = selected === "all";

  function togglePlatform(p: CalendarPlatform) {
    if (isAll) {
      // Deselect everything except this one
      onChange(new Set([p]));
      return;
    }
    const next = new Set(selected);
    if (next.has(p)) {
      next.delete(p);
      if (next.size === 0) {
        onChange("all");
      } else {
        onChange(next);
      }
    } else {
      next.add(p);
      if (next.size === PLATFORM_ORDER.length) {
        onChange("all");
      } else {
        onChange(next);
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* All button */}
      <button
        onClick={() => onChange("all")}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          isAll
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        All
      </button>

      {/* Per-platform buttons */}
      {PLATFORM_ORDER.map((p) => {
        const cfg    = PLATFORM_CONFIG[p];
        const Icon   = PLATFORM_ICONS[p];
        const active = !isAll && selected.has(p);
        const count  = counts[p] ?? 0;

        return (
          <button
            key={p}
            onClick={() => togglePlatform(p)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? cfg.filterActive
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
            {count > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                active ? "bg-white/10" : "bg-muted"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
