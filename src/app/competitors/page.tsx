import { Users, TrendingUp, Eye, BarChart2, Bell, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderCard } from "@/components/layout/placeholder-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const competitors = [
  {
    handle: "@competitor_one",
    followers: "—",
    engagementRate: "—",
    postsPerWeek: "—",
    trend: "up",
  },
  {
    handle: "@competitor_two",
    followers: "—",
    engagementRate: "—",
    postsPerWeek: "—",
    trend: "down",
  },
  {
    handle: "@competitor_three",
    followers: "—",
    engagementRate: "—",
    postsPerWeek: "—",
    trend: "neutral",
  },
];

const features = [
  {
    title: "Profile Monitoring",
    description: "Track follower counts, post frequency, and engagement trends.",
    icon: Eye,
  },
  {
    title: "Content Analysis",
    description: "See what content formats and topics perform best for competitors.",
    icon: BarChart2,
  },
  {
    title: "Growth Benchmarking",
    description: "Compare your growth rate against the competition over time.",
    icon: TrendingUp,
  },
  {
    title: "Alerts & Notifications",
    description: "Get notified when a competitor posts or hits a milestone.",
    icon: Bell,
  },
];

export default function CompetitorsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Competitor Tracker"
        description="Monitor competitor activity, benchmark your growth, and stay ahead of the curve."
        icon={Users}
        badge="Coming Soon"
      />

      <div className="flex gap-3">
        <Button variant="default" disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Competitors Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">Tracked Accounts</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Handle</span>
            <span>Followers</span>
            <span>Eng. Rate</span>
            <span>Posts/Week</span>
            <span>Trend</span>
          </div>
          {competitors.map((c) => (
            <div
              key={c.handle}
              className="grid grid-cols-5 gap-4 px-6 py-4 text-sm"
            >
              <span className="font-medium text-primary">{c.handle}</span>
              <span className="text-muted-foreground">{c.followers}</span>
              <span className="text-muted-foreground">{c.engagementRate}</span>
              <span className="text-muted-foreground">{c.postsPerWeek}</span>
              <Badge
                variant={
                  c.trend === "up"
                    ? "default"
                    : c.trend === "down"
                    ? "destructive"
                    : "secondary"
                }
                className="w-fit"
              >
                {c.trend}
              </Badge>
            </div>
          ))}
        </div>
      </div>

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
