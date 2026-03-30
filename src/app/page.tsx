import {
  Instagram,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  TrendingUp,
  Activity,
  Image,
} from "lucide-react";
import Link from "next/link";
import { PlaceholderCard } from "@/components/layout/placeholder-card";

const sections = [
  {
    title: "Instagram Manager",
    description: "Schedule posts, manage stories, and track engagement.",
    href: "/instagram",
    icon: Instagram,
  },
  {
    title: "Analytics",
    description: "Deep-dive metrics, growth trends, and audience insights.",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Content Calendar",
    description: "Plan and visualize your publishing schedule.",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Competitor Tracker",
    description: "Monitor competitor activity and benchmark performance.",
    href: "/competitors",
    icon: Users,
  },
  {
    title: "News Consolidator",
    description: "Aggregate industry news and trending topics.",
    href: "/news",
    icon: Newspaper,
  },
];

const stats = [
  { label: "Posts Scheduled", value: "—", icon: Image },
  { label: "Avg. Engagement Rate", value: "—", icon: TrendingUp },
  { label: "Accounts Tracked", value: "—", icon: Users },
  { label: "Active Feeds", value: "—", icon: Activity },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome to CMS Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your central hub for social media content management, analytics, and competitive intelligence.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <stat.icon className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Section Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Sections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="block">
              <PlaceholderCard
                title={section.title}
                description={section.description}
                icon={section.icon}
                className="h-full cursor-pointer hover:border-primary/40 hover:bg-card/80"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
