"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostChip } from "./post-chip";
import type { CalendarPost, CalendarPlatform } from "@/types/calendar";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_VISIBLE = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCalendarCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(first)),
    end:   endOfWeek(endOfMonth(first)),
  });
}

function postMatchesFilter(
  post: CalendarPost,
  filter: Set<CalendarPlatform> | "all"
): boolean {
  if (filter === "all") return true;
  return filter.has(post.platform);
}

// ─── Day cell ────────────────────────────────────────────────────────────────

interface DayCellProps {
  day: Date;
  posts: CalendarPost[];
  isSelected: boolean;
  currentMonth: number;
  filter: Set<CalendarPlatform> | "all";
  onSelect: (day: Date) => void;
  onChipClick: (post: CalendarPost) => void;
}

function DayCell({
  day,
  posts,
  isSelected,
  currentMonth,
  filter,
  onSelect,
  onChipClick,
}: DayCellProps) {
  const inMonth    = day.getMonth() === currentMonth;
  const todayDay   = isToday(day);
  const filteredPosts = posts.filter((p) => postMatchesFilter(p, filter));
  const visible    = filteredPosts.slice(0, MAX_CHIPS_VISIBLE);
  const overflow   = filteredPosts.length - MAX_CHIPS_VISIBLE;

  return (
    <div
      onClick={() => onSelect(day)}
      className={cn(
        "relative flex min-h-[100px] cursor-pointer flex-col rounded-lg border p-1.5 transition-all duration-100",
        isSelected
          ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/20",
        !inMonth && "opacity-40"
      )}
    >
      {/* Day number */}
      <div className="mb-1 flex justify-end pr-0.5">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
            todayDay
              ? "bg-primary font-bold text-primary-foreground"
              : inMonth
              ? "text-foreground"
              : "text-muted-foreground/50"
          )}
        >
          {format(day, "d")}
        </span>
      </div>

      {/* Post chips */}
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {visible.map((post) => (
          <PostChip
            key={post.id}
            post={post}
            onClick={(p) => {
              onSelect(day);
              onChipClick(p);
            }}
          />
        ))}

        {overflow > 0 && (
          <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main grid ────────────────────────────────────────────────────────────────

interface CalendarGridProps {
  year: number;
  month: number;
  posts: CalendarPost[];
  selectedDay: Date | null;
  filter: Set<CalendarPlatform> | "all";
  onDaySelect: (day: Date) => void;
  onChipClick: (post: CalendarPost) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarGrid({
  year,
  month,
  posts,
  selectedDay,
  filter,
  onDaySelect,
  onChipClick,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarGridProps) {
  const cells = getCalendarCells(year, month);
  const monthLabel = format(new Date(year, month, 1), "MMMM yyyy");

  // Index posts by date string for fast lookup
  const postsByDate = new Map<string, CalendarPost[]>();
  for (const post of posts) {
    const existing = postsByDate.get(post.date) ?? [];
    existing.push(post);
    postsByDate.set(post.date, existing);
  }

  // Sort chips within each day by time
  for (const [key, arr] of postsByDate) {
    postsByDate.set(
      key,
      arr.sort((a, b) => (a.time ?? "00:00").localeCompare(b.time ?? "00:00"))
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Month navigation header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToday}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Today
          </button>
          <button
            onClick={onPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {cells.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <DayCell
              key={key}
              day={day}
              posts={postsByDate.get(key) ?? []}
              isSelected={!!(selectedDay && isSameDay(day, selectedDay))}
              currentMonth={month}
              filter={filter}
              onSelect={onDaySelect}
              onChipClick={onChipClick}
            />
          );
        })}
      </div>
    </div>
  );
}
