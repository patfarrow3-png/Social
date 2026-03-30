// ─── Core metric shapes ────────────────────────────────────────────────────

export interface DailyMetric {
  /** Display label, e.g. "Mar 01" */
  date: string;
  impressions: number;
  reach: number;
  engagementRate: number;
  /** Cumulative follower count on this day */
  followers: number;
  /** Net new followers on this day */
  followerGrowth: number;
}

export interface TopPost {
  id: string;
  caption: string;
  platform: Platform;
  postType: "photo" | "video" | "reel" | "carousel" | "story";
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  publishedAt: string; // ISO date string
}

export interface AnalyticsSummary {
  totalImpressions: number;
  /** % change vs previous period (positive = up) */
  impressionsChange: number;
  avgEngagementRate: number;
  engagementRateChange: number;
  totalFollowers: number;
  /** Absolute net new followers over the period */
  followerGrowth: number;
  /** % growth rate */
  followerGrowthChange: number;
  totalPosts: number;
  postsChange: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  daily: DailyMetric[];
  topPosts: TopPost[];
  dateRange: { start: string; end: string };
  /** "metricool" when sourced from the real API, "mock" otherwise */
  source: "metricool" | "mock";
}

// ─── Utility types ─────────────────────────────────────────────────────────

export type Platform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "tiktok"
  | "linkedin";

export type DatePreset = "7d" | "14d" | "30d" | "90d";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}
