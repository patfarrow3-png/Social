"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { format, isToday } from "date-fns";
import {
  CalendarDays, Plus, CheckCircle2, CalendarClock, FilePenLine,
} from "lucide-react";
import { CalendarGrid }        from "./calendar-grid";
import { DayDetailPanel }      from "./day-detail-panel";
import { PlatformFilter }      from "./platform-filter";
import { AddCalendarPostDialog } from "./add-post-dialog";
import { Button }              from "@/components/ui/button";
import { SEED_CALENDAR }       from "@/lib/seed-calendar";
import {
  type CalendarPost,
  type CalendarPlatform,
  PLATFORM_ORDER,
} from "@/types/calendar";

// ─── State reducer ───────────────────────────────────────────────────────────

type Action =
  | { type: "ADD";    post: CalendarPost }
  | { type: "DELETE"; id: string }
  | { type: "LOAD";   posts: CalendarPost[] };

function reducer(state: CalendarPost[], action: Action): CalendarPost[] {
  switch (action.type) {
    case "ADD":    return [...state, action.post];
    case "DELETE": return state.filter((p) => p.id !== action.id);
    case "LOAD":   return action.posts;
    default:       return state;
  }
}

const STORAGE_KEY = "cms-calendar-posts";

// ─── Stats strip ─────────────────────────────────────────────────────────────

function StatsStrip({ posts }: { posts: CalendarPost[] }) {
  const scheduled = posts.filter((p) => p.status === "scheduled").length;
  const published = posts.filter((p) => p.status === "published").length;
  const draft     = posts.filter((p) => p.status === "draft").length;

  const stats = [
    { label: "Scheduled", value: scheduled, icon: CalendarClock, color: "text-blue-400",    bg: "bg-blue-500/10"    },
    { label: "Published",  value: published, icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Drafts",     value: draft,     icon: FilePenLine,   color: "text-amber-400",   bg: "bg-amber-500/10"   },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex items-center gap-2.5 rounded-lg border border-border ${s.bg} px-4 py-2.5`}
        >
          <s.icon className={`h-4 w-4 ${s.color}`} />
          <span className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
          <span className="text-sm text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CalendarDashboard() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [posts, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);

  const [selectedDay, setSelectedDay]         = useState<Date | null>(null);
  const [dialogOpen,  setDialogOpen]           = useState(false);
  const [filter, setFilter]                   = useState<Set<CalendarPlatform> | "all">("all");

  // ── Persist ──────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      dispatch({ type: "LOAD", posts: stored ? JSON.parse(stored) : SEED_CALENDAR });
    } catch {
      dispatch({ type: "LOAD", posts: SEED_CALENDAR });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts, hydrated]);

  // ── Navigation ────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else               setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else               setMonth((m) => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleAdd = useCallback((post: CalendarPost) => {
    dispatch({ type: "ADD", post });
    // Navigate to the month of the new post
    const d = new Date(post.date + "T00:00:00");
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelectedDay(d);
  }, []);

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: "DELETE", id });
  }, []);

  // ── Day selection ────────────────────────────────────────────────────────

  function handleDaySelect(day: Date) {
    setSelectedDay((prev) => (prev && format(prev, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") ? null : day));
  }

  // ── Per-platform counts (for filter badges) ───────────────────────────────

  const platformCounts = PLATFORM_ORDER.reduce((acc, p) => {
    acc[p] = posts.filter((post) => post.platform === p).length;
    return acc;
  }, {} as Record<CalendarPlatform, number>);

  // ── Posts for selected day ────────────────────────────────────────────────

  const selectedDayPosts = selectedDay
    ? posts.filter((p) => p.date === format(selectedDay, "yyyy-MM-dd"))
    : [];

  // ── Visible label for selected day ────────────────────────────────────────

  const selectedIsToday = selectedDay ? isToday(selectedDay) : false;

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Content Calendar
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {posts.length} posts scheduled across{" "}
              {new Set(posts.map((p) => p.platform)).size} platforms
            </p>
          </div>
        </div>

        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="mb-5">
        <StatsStrip posts={posts} />
      </div>

      {/* ── Platform filter ──────────────────────────────────────────────── */}
      <div className="mb-4">
        <PlatformFilter
          selected={filter}
          onChange={setFilter}
          counts={platformCounts}
        />
      </div>

      {/* ── Selected day indicator (mobile) ──────────────────────────────── */}
      {selectedDay && (
        <p className="mb-2 text-xs text-muted-foreground sm:hidden">
          {selectedIsToday ? "Today" : format(selectedDay, "EEEE, MMMM d")}
          {" · "}{selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Main layout: calendar + detail panel ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <CalendarGrid
          year={year}
          month={month}
          posts={posts}
          selectedDay={selectedDay}
          filter={filter}
          onDaySelect={handleDaySelect}
          onChipClick={(post) => {
            const d = new Date(post.date + "T00:00:00");
            setSelectedDay(d);
          }}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onToday={goToday}
        />

        <DayDetailPanel
          day={selectedDay}
          posts={selectedDayPosts}
          onClose={() => setSelectedDay(null)}
          onDelete={handleDelete}
          onAddPost={() => setDialogOpen(true)}
          filter={filter}
        />
      </div>

      {/* ── Add post dialog ───────────────────────────────────────────────── */}
      <AddCalendarPostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAdd}
        prefillDate={selectedDay}
      />
    </>
  );
}
