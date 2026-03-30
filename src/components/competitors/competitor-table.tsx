"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown, Trash2, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkline } from "./sparkline";
import type { CompetitorProfile, SortKey, SortState } from "@/types/competitors";
import { PLATFORM_META, formatFollowers, relativeTime } from "@/types/competitors";

interface CompetitorTableProps {
  profiles:        CompetitorProfile[];
  sort:            SortState;
  selectedId:      string | null;
  onSort:          (key: SortKey) => void;
  onSelect:        (profile: CompetitorProfile) => void;
  onDelete:        (id: string) => void;
  onRefresh:       (id: string) => void;
}

const COLUMNS: { key: SortKey | null; label: string; className?: string }[] = [
  { key: "competitorName",    label: "Competitor",       className: "w-[180px] min-w-[160px]" },
  { key: "handle",            label: "Handle",           className: "w-[140px] min-w-[120px]" },
  { key: "followers",         label: "Followers",        className: "w-[100px] text-right" },
  { key: "followerGrowthPct", label: "30d Δ%",           className: "w-[80px] text-right" },
  { key: "avgEngagementRate", label: "Avg Eng.",          className: "w-[90px] text-right" },
  { key: "postsPerWeek",      label: "Posts/wk",         className: "w-[80px] text-right" },
  { key: "lastPostedAt",      label: "Last Post",        className: "w-[100px]" },
  { key: null,                label: "30d Trend",        className: "w-[88px]" },
  { key: null,                label: "",                 className: "w-[88px] text-right" },
];

function SortIcon({ colKey, sort }: { colKey: SortKey | null; sort: SortState }) {
  if (!colKey) return null;
  if (sort.key !== colKey) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />;
  return sort.dir === "asc"
    ? <ChevronUp className="h-3 w-3 text-primary" />
    : <ChevronDown className="h-3 w-3 text-primary" />;
}

export function CompetitorTable({
  profiles, sort, selectedId, onSort, onSelect, onDelete, onRefresh,
}: CompetitorTableProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No competitors found.</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Add a competitor or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {COLUMNS.map(col => (
              <th
                key={col.label || "actions"}
                className={`px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground ${col.className ?? ""} ${col.key ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""}`}
                onClick={() => col.key && onSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon colKey={col.key} sort={sort} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map(p => {
            const meta     = PLATFORM_META[p.platform];
            const growth   = p.followerGrowthPct;
            const positive = growth >= 0;
            const isSelected = p.id === selectedId;

            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30 ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                {/* Competitor + platform */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${p.avatarColor} text-white text-[10px] font-semibold select-none`}>
                      {p.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground leading-tight">{p.competitorName}</p>
                      <span className={`inline-flex items-center rounded border px-1 py-px text-[9px] font-medium mt-0.5 ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Handle */}
                <td className="px-3 py-3 text-muted-foreground">
                  {meta.handlePrefix}{p.handle}
                </td>

                {/* Followers */}
                <td className="px-3 py-3 text-right font-medium text-foreground tabular-nums">
                  {formatFollowers(p.followers)}
                </td>

                {/* 30d % */}
                <td className={`px-3 py-3 text-right font-medium tabular-nums ${positive ? "text-emerald-400" : "text-red-400"}`}>
                  {positive ? "+" : ""}{growth}%
                </td>

                {/* Avg engagement */}
                <td className="px-3 py-3 text-right text-foreground tabular-nums">
                  {p.avgEngagementRate}%
                </td>

                {/* Posts/week */}
                <td className="px-3 py-3 text-right text-foreground tabular-nums">
                  {p.postsPerWeek}
                </td>

                {/* Last post */}
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                  {relativeTime(p.lastPostedAt)}
                </td>

                {/* Sparkline */}
                <td className="px-3 py-3">
                  <Sparkline data={p.followerHistory} positive={positive} />
                </td>

                {/* Actions */}
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="View details"
                      onClick={() => onSelect(p)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      title="Refresh"
                      onClick={() => onRefresh(p.id)}
                      disabled={p.isLoading}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${p.isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      title="Untrack"
                      onClick={() => onDelete(p.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
