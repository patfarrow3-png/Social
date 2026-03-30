import { BarChart2, TrendingUp, Users, Eye, MousePointer, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderCard } from "@/components/layout/placeholder-card";

const metrics = [
  { label: "Total Reach", value: "—", change: "—", icon: Eye },
  { label: "Followers", value: "—", change: "—", icon: Users },
  { label: "Engagement Rate", value: "—", change: "—", icon: TrendingUp },
  { label: "Link Clicks", value: "—", change: "—", icon: MousePointer },
];

const features = [
  {
    title: "Audience Insights",
    description: "Demographics, location data, and active hours for your followers.",
    icon: Users,
  },
  {
    title: "Growth Trends",
    description: "Follower growth over time with trend analysis and forecasts.",
    icon: TrendingUp,
  },
  {
    title: "Post Performance",
    description: "Detailed metrics for each post including reach, saves, and shares.",
    icon: BarChart2,
  },
  {
    title: "Top Content",
    description: "Identify your best-performing content and replicate success.",
    icon: ArrowUpRight,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Track performance metrics, audience growth, and content engagement in real time."
        icon={BarChart2}
        badge="Coming Soon"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <metric.icon className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">{metric.change}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Engagement Over Time</h3>
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
          <div className="text-center">
            <BarChart2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Chart will appear here</p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <PlaceholderCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </div>
    </div>
  );
}
