import { Newspaper, Rss, Search, Tag, Bell, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderCard } from "@/components/layout/placeholder-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockArticles = [
  {
    title: "The Future of Social Media Marketing in 2026",
    source: "Marketing Weekly",
    category: "Trends",
    time: "2 hours ago",
  },
  {
    title: "Instagram Rolls Out New Creator Monetization Tools",
    source: "Social Media Today",
    category: "Platform Updates",
    time: "5 hours ago",
  },
  {
    title: "Short-Form Video Continues to Dominate Engagement",
    source: "Digital Insights",
    category: "Research",
    time: "Yesterday",
  },
  {
    title: "How Brands Are Leveraging AI for Content Creation",
    source: "Content Strategist",
    category: "AI & Tools",
    time: "Yesterday",
  },
];

const features = [
  {
    title: "RSS Feed Aggregator",
    description: "Subscribe to industry blogs and news sources in one feed.",
    icon: Rss,
  },
  {
    title: "Keyword Monitoring",
    description: "Track specific topics, hashtags, and brand mentions.",
    icon: Search,
  },
  {
    title: "Category Tags",
    description: "Organize news by topic, platform, or custom categories.",
    icon: Tag,
  },
  {
    title: "Digest Alerts",
    description: "Receive daily or weekly summaries of the most important news.",
    icon: Bell,
  },
];

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="News Consolidator"
        description="Aggregate industry news, platform updates, and trending topics from across the web."
        icon={Newspaper}
        badge="Coming Soon"
      />

      <div className="flex gap-3">
        <Button variant="default" disabled>
          <Rss className="mr-2 h-4 w-4" />
          Add Feed
        </Button>
        <Button variant="outline" disabled>
          Manage Sources
        </Button>
      </div>

      {/* News Feed */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">Latest Articles</h3>
          <span className="text-xs text-muted-foreground">Sample data</span>
        </div>
        <div className="divide-y divide-border">
          {mockArticles.map((article) => (
            <div
              key={article.title}
              className="flex items-start justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{article.time}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {article.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{article.source}</p>
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40" />
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
