// ─── Topics ──────────────────────────────────────────────────────────────────

export type NewsTopic = "tools" | "research" | "business" | "platforms" | "trends";

export const NEWS_TOPICS: NewsTopic[] = ["tools", "research", "business", "platforms", "trends"];

export interface TopicMeta {
  label:      string;
  badgeClass: string;
  keywords:   string[];
}

export const TOPIC_META: Record<NewsTopic, TopicMeta> = {
  tools: {
    label:      "Tools",
    badgeClass: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    keywords:   ["tool", "app", "software", "platform launch", "feature", "update", "api", "automation", "ai", "analytics", "scheduler", "plugin"],
  },
  research: {
    label:      "Research",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    keywords:   ["study", "report", "survey", "data", "research", "statistics", "benchmark", "trend", "insight", "analysis", "findings"],
  },
  business: {
    label:      "Business",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    keywords:   ["revenue", "funding", "acquisition", "partnership", "brand", "campaign", "strategy", "marketing", "agency", "budget", "roi", "advertis"],
  },
  platforms: {
    label:      "Platforms",
    badgeClass: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    keywords:   ["instagram", "tiktok", "youtube", "twitter", "facebook", "linkedin", "snapchat", "pinterest", "threads", "algorithm", "creator", "monetiz"],
  },
  trends: {
    label:      "Trends",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    keywords:   ["trend", "viral", "grow", "engagement", "reach", "content", "reel", "short", "influencer", "community", "audience"],
  },
};

// ─── Article ─────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id:          string;
  title:       string;
  summary:     string;
  url:         string;
  source:      string;
  sourceUrl:   string;
  publishedAt: string; // ISO date
  topic:       NewsTopic;
  imageUrl?:   string;
}

// ─── Feed source ─────────────────────────────────────────────────────────────

export interface NewsFeedSource {
  name:    string;
  url:     string;
  /** URL of the publication's home */
  siteUrl: string;
  topic:   NewsTopic;
}

// ─── API response ─────────────────────────────────────────────────────────────

export interface NewsResponse {
  articles: NewsArticle[];
  fetchedAt: string;
  /** true when env var credentials are absent and mock data is used */
  isMock:    boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function classifyTopic(text: string): NewsTopic {
  const lower = text.toLowerCase();
  for (const topic of NEWS_TOPICS) {
    if (TOPIC_META[topic].keywords.some(kw => lower.includes(kw))) {
      return topic;
    }
  }
  return "trends";
}

export function relativeNewsTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = diff / 60_000;
  if (mins < 60)   return `${Math.floor(mins)}m ago`;
  const hours = mins / 60;
  if (hours < 24)  return `${Math.floor(hours)}h ago`;
  const days  = hours / 24;
  if (days < 7)    return `${Math.floor(days)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
