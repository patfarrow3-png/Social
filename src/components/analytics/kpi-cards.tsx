import { TrendingUp, TrendingDown, Eye, Users, Zap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary } from "@/types/analytics";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function ChangeChip({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        positive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
      )}
    >
      <Icon className="h-3 w-3" />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

// ─── Individual Card ──────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  subLabel: string;
  change: number;
  icon: React.ElementType;
  accentColor: string; // Tailwind text color class
  accentBg: string;   // Tailwind bg color class
}

function KpiCard({ label, value, subLabel, change, icon: Icon, accentColor, accentBg }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/60">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentBg)}>
          <Icon className={cn("h-5 w-5", accentColor)} />
        </div>
        <ChangeChip value={change} />
      </div>

      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground/80">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subLabel}</p>
    </div>
  );
}

// ─── KPI Strip ───────────────────────────────────────────────────────────────

export function KpiCards({ summary }: { summary: AnalyticsSummary }) {
  const cards: KpiCardProps[] = [
    {
      label: "Total Impressions",
      value: formatLargeNumber(summary.totalImpressions),
      subLabel: "Times your content was seen",
      change: summary.impressionsChange,
      icon: Eye,
      accentColor: "text-blue-400",
      accentBg: "bg-blue-500/15",
    },
    {
      label: "Avg Engagement Rate",
      value: `${summary.avgEngagementRate.toFixed(2)}%`,
      subLabel: "Likes + comments + shares ÷ reach",
      change: summary.engagementRateChange,
      icon: Zap,
      accentColor: "text-amber-400",
      accentBg: "bg-amber-500/15",
    },
    {
      label: "Follower Growth",
      value: `+${formatLargeNumber(summary.followerGrowth)}`,
      subLabel: `${formatLargeNumber(summary.totalFollowers)} total followers`,
      change: summary.followerGrowthChange,
      icon: Users,
      accentColor: "text-emerald-400",
      accentBg: "bg-emerald-500/15",
    },
    {
      label: "Posts Published",
      value: String(summary.totalPosts),
      subLabel: "Content pieces in this period",
      change: summary.postsChange,
      icon: FileText,
      accentColor: "text-purple-400",
      accentBg: "bg-purple-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border border-border bg-card" />
      ))}
    </div>
  );
}
