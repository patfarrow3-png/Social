import { CalendarDays, Plus, Clock, Instagram, Tag } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderCard } from "@/components/layout/placeholder-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const upcomingPosts = [
  { title: "Product launch teaser", platform: "Instagram", time: "Today, 3:00 PM", status: "scheduled" },
  { title: "Behind-the-scenes reel", platform: "Instagram", time: "Tomorrow, 10:00 AM", status: "draft" },
  { title: "Weekly tips carousel", platform: "Instagram", time: "Wed, 12:00 PM", status: "draft" },
];

const features = [
  {
    title: "Drag & Drop Scheduling",
    description: "Visually arrange your content across days and weeks.",
    icon: CalendarDays,
  },
  {
    title: "Best Time Suggestions",
    description: "AI-powered recommendations for maximum reach timing.",
    icon: Clock,
  },
  {
    title: "Multi-Platform View",
    description: "See all your scheduled content across platforms at a glance.",
    icon: Instagram,
  },
  {
    title: "Content Labels",
    description: "Organize posts with custom tags and campaign labels.",
    icon: Tag,
  },
];

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Calendar"
        description="Plan, organize, and visualize your entire publishing schedule from one place."
        icon={CalendarDays}
        badge="Coming Soon"
      />

      <div className="flex gap-3">
        <Button variant="default" disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
        <Button variant="outline" disabled>
          Import Schedule
        </Button>
      </div>

      {/* Calendar Placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">March 2026</h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 5;
            const isCurrentMonth = day >= 1 && day <= 31;
            const isToday = day === 30;
            return (
              <div
                key={i}
                className={`rounded-md py-2 text-xs transition-colors ${
                  isToday
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isCurrentMonth
                    ? "text-foreground hover:bg-muted cursor-pointer"
                    : "text-muted-foreground/30"
                }`}
              >
                {isCurrentMonth ? day : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Posts */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Upcoming Posts</h3>
        <div className="space-y-3">
          {upcomingPosts.map((post) => (
            <div
              key={post.title}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {post.platform} &middot; {post.time}
                </p>
              </div>
              <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>
                {post.status}
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
