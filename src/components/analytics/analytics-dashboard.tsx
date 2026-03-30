"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { format, subDays } from "date-fns";
import { BarChart2, AlertCircle, RefreshCw, FlaskConical } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { KpiCards, KpiCardsSkeleton } from "@/components/analytics/kpi-cards";
import { TopPosts, TopPostsSkeleton } from "@/components/analytics/top-posts";
import { Button } from "@/components/ui/button";
import type { AnalyticsData, DateRange } from "@/types/analytics";

// ─── Dynamically import chart components (avoids recharts SSR issues) ────────

const ImpressionsChart = dynamic(
  () => import("@/components/analytics/impressions-chart").then((m) => ({ default: m.ImpressionsChart })),
  {
    ssr: false,
    loading: () => <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card" />,
  }
);

const EngagementChart = dynamic(
  () => import("@/components/analytics/engagement-chart").then((m) => ({ default: m.EngagementChart })),
  {
    ssr: false,
    loading: () => <div className="h-[320px] animate-pulse rounded-xl border border-border bg-card" />,
  }
);

const FollowerGrowthChart = dynamic(
  () => import("@/components/analytics/follower-growth-chart").then((m) => ({ default: m.FollowerGrowthChart })),
  {
    ssr: false,
    loading: () => <div className="h-[320px] animate-pulse rounded-xl border border-border bg-card" />,
  }
);

// ─── Default date range: last 30 days ────────────────────────────────────────

function defaultRange(): DateRange {
  const today = new Date();
  return {
    start: format(subDays(today, 29), "yyyy-MM-dd"),
    end: format(today, "yyyy-MM-dd"),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?start=${r.start}&end=${r.end}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and whenever range changes
  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  function handleRangeChange(r: DateRange) {
    setRange(r);
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
            <BarChart2 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Content performance metrics from your social accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <DateRangePicker value={range} onChange={handleRangeChange} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData(range)}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ── Mock data notice ─────────────────────────────────────────────── */}
      {data?.source === "mock" && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <span className="font-medium text-amber-300">Showing mock data.</span>{" "}
            <span className="text-amber-400/80">
              Set <code className="rounded bg-amber-500/15 px-1 py-0.5 text-xs">METRICOOL_API_TOKEN</code> and{" "}
              <code className="rounded bg-amber-500/15 px-1 py-0.5 text-xs">METRICOOL_BLOG_ID</code> in{" "}
              <code className="rounded bg-amber-500/15 px-1 py-0.5 text-xs">.env.local</code> to connect your real account.
            </span>
          </div>
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData(range)}
            className="ml-auto text-destructive hover:text-destructive"
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      {loading || !data ? (
        <KpiCardsSkeleton />
      ) : (
        <KpiCards summary={data.summary} />
      )}

      {/* ── Impressions chart (full width) ───────────────────────────────── */}
      {!loading && data && (
        <ImpressionsChart data={data.daily} />
      )}

      {/* ── Engagement + Follower Growth (2 col) ─────────────────────────── */}
      {!loading && data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <EngagementChart data={data.daily} />
          <FollowerGrowthChart data={data.daily} />
        </div>
      )}

      {/* ── Top posts ────────────────────────────────────────────────────── */}
      {loading || !data ? (
        <TopPostsSkeleton />
      ) : (
        <TopPosts posts={data.topPosts} />
      )}
    </div>
  );
}
