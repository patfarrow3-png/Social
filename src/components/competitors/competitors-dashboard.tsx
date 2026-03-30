"use client";

import { useEffect, useReducer, useState, useMemo } from "react";
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Badge }  from "@/components/ui/badge";
import { AddCompetitorDialog } from "./add-competitor-dialog";
import { CompetitorTable }    from "./competitor-table";
import { CompetitorDetail }   from "./competitor-detail";
import { SEED_COMPETITORS }   from "@/lib/mock-competitor-data";
import type { CompetitorProfile, CompetitorPlatform, SortKey, SortState } from "@/types/competitors";
import { COMPETITOR_PLATFORMS, PLATFORM_META, formatFollowers } from "@/types/competitors";

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "LOAD";    profiles: CompetitorProfile[] }
  | { type: "ADD";     profile:  CompetitorProfile   }
  | { type: "DELETE";  id:       string              }
  | { type: "REFRESH_START"; id: string              }
  | { type: "REFRESH_DONE";  profile: CompetitorProfile };

function reducer(state: CompetitorProfile[], action: Action): CompetitorProfile[] {
  switch (action.type) {
    case "LOAD":          return action.profiles;
    case "ADD":           return [action.profile, ...state];
    case "DELETE":        return state.filter(p => p.id !== action.id);
    case "REFRESH_START": return state.map(p => p.id === action.id ? { ...p, isLoading: true } : p);
    case "REFRESH_DONE":  return state.map(p => p.id === action.profile.id ? { ...action.profile, isLoading: false } : p);
    default:              return state;
  }
}

const STORAGE_KEY = "cms-competitor-profiles";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortProfiles(profiles: CompetitorProfile[], sort: SortState): CompetitorProfile[] {
  return [...profiles].sort((a, b) => {
    let av: string | number = a[sort.key] as string | number;
    let bv: string | number = b[sort.key] as string | number;
    if (typeof av === "string" && typeof bv === "string") {
      av = av.toLowerCase(); bv = bv.toLowerCase();
    }
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ?  1 : -1;
    return 0;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CompetitorsDashboard() {
  const [profiles, dispatch] = useReducer(reducer, []);
  const [hydrated,  setHydrated]  = useState(false);
  const [addOpen,   setAddOpen]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [platformFilter, setPlatformFilter] = useState<CompetitorPlatform | "all">("all");
  const [sort, setSort] = useState<SortState>({ key: "competitorName", dir: "asc" });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Hydrate from localStorage or seed data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      dispatch({ type: "LOAD", profiles: stored ? JSON.parse(stored) : SEED_COMPETITORS });
    } catch {
      dispatch({ type: "LOAD", profiles: SEED_COMPETITORS });
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles, hydrated]);

  // Handle sort toggle
  function handleSort(key: SortKey) {
    setSort(s => s.key === key
      ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "asc" }
    );
  }

  // Add new competitor
  function handleAdd(profile: CompetitorProfile) {
    dispatch({ type: "ADD", profile });
    setSelectedId(profile.id);
  }

  // Delete competitor
  function handleDelete(id: string) {
    if (selectedId === id) setSelectedId(null);
    dispatch({ type: "DELETE", id });
  }

  // Refresh competitor data
  async function handleRefresh(id: string) {
    const p = profiles.find(x => x.id === id);
    if (!p) return;
    dispatch({ type: "REFRESH_START", id });
    try {
      const res = await fetch("/api/competitors/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: p.handle, platform: p.platform, competitorName: p.competitorName }),
      });
      if (!res.ok) throw new Error();
      const fresh: CompetitorProfile = await res.json();
      dispatch({ type: "REFRESH_DONE", profile: { ...fresh, id, notes: p.notes, addedAt: p.addedAt } });
    } catch {
      dispatch({ type: "REFRESH_DONE", profile: { ...p, isLoading: false } });
    }
  }

  // Refresh all
  async function handleRefreshAll() {
    for (const p of profiles) await handleRefresh(p.id);
  }

  // Filtered + sorted profiles
  const visible = useMemo(() => {
    let list = profiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.competitorName.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
      );
    }
    if (platformFilter !== "all") {
      list = list.filter(p => p.platform === platformFilter);
    }
    return sortProfiles(list, sort);
  }, [profiles, search, platformFilter, sort]);

  const selectedProfile = profiles.find(p => p.id === selectedId) ?? null;

  // Existing competitor names for autocomplete
  const existingNames = useMemo(() =>
    [...new Set(profiles.map(p => p.competitorName))].sort(),
  [profiles]);

  // KPI summary
  const totalFollowers = profiles.reduce((s, p) => s + p.followers, 0);
  const avgEngagement  = profiles.length
    ? (profiles.reduce((s, p) => s + p.avgEngagementRate, 0) / profiles.length).toFixed(1)
    : "0.0";
  const uniqueBrands   = new Set(profiles.map(p => p.competitorName)).size;

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Competitors tracked", value: uniqueBrands.toString() },
          { label: "Platform accounts",   value: profiles.length.toString() },
          { label: "Total followers",     value: formatFollowers(totalFollowers) },
          { label: "Avg engagement",      value: `${avgEngagement}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search competitors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Platform pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              platformFilter === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            All
          </button>
          {COMPETITOR_PLATFORMS.map(plat => {
            const meta  = PLATFORM_META[plat];
            const count = profiles.filter(p => p.platform === plat).length;
            if (count === 0) return null;
            return (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat === platformFilter ? "all" : plat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  platformFilter === plat
                    ? `${meta.badgeClass} border-current`
                    : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                {meta.abbrev} · {count}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh all
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add competitor
          </Button>
        </div>
      </div>

      {/* Main area: table + optional detail panel */}
      <div className={`flex gap-4 items-start ${selectedProfile ? "lg:grid lg:grid-cols-[1fr_360px]" : ""}`}>
        {/* Table */}
        <div className="min-w-0 flex-1 rounded-xl border border-border bg-card overflow-hidden">
          <CompetitorTable
            profiles={visible}
            sort={sort}
            selectedId={selectedId}
            onSort={handleSort}
            onSelect={p => setSelectedId(prev => prev === p.id ? null : p.id)}
            onDelete={handleDelete}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Detail panel */}
        {selectedProfile && (
          <div className="hidden lg:block w-[360px] shrink-0 sticky top-4 max-h-[calc(100vh-6rem)]">
            <CompetitorDetail
              profile={selectedProfile}
              onClose={() => setSelectedId(null)}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </div>

      {/* Add dialog */}
      <AddCompetitorDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
        existingNames={existingNames}
      />
    </div>
  );
}
