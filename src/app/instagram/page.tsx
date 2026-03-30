import { Instagram, Image, Heart, MessageCircle, Send, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderCard } from "@/components/layout/placeholder-card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Post Scheduler",
    description: "Queue and schedule posts with optimal timing recommendations.",
    icon: Clock,
  },
  {
    title: "Media Library",
    description: "Manage your image and video assets in one place.",
    icon: Image,
  },
  {
    title: "Engagement Hub",
    description: "Reply to comments and DMs without leaving the dashboard.",
    icon: MessageCircle,
  },
  {
    title: "Story Manager",
    description: "Design, schedule, and track Instagram Stories performance.",
    icon: Heart,
  },
  {
    title: "Direct Messages",
    description: "Monitor and respond to DMs with templated replies.",
    icon: Send,
  },
];

export default function InstagramPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Instagram Manager"
        description="Schedule posts, manage content, and track engagement across your Instagram accounts."
        icon={Instagram}
        badge="Coming Soon"
      />

      <div className="flex gap-3">
        <Button variant="default" disabled>
          <Instagram className="mr-2 h-4 w-4" />
          Connect Account
        </Button>
        <Button variant="outline" disabled>
          New Post
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <PlaceholderCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Instagram className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No Instagram accounts connected yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Connect your first account to get started.
        </p>
      </div>
    </div>
  );
}
