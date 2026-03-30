/**
 * Metricool API v2 client
 *
 * Configuration (set in .env.local):
 *   METRICOOL_API_TOKEN   — API token from Metricool → Settings → API
 *   METRICOOL_BLOG_ID     — Numeric brand/blog ID from the same screen
 *
 * When these env vars are absent the client returns realistic mock data so
 * the dashboard is fully usable without an account.
 *
 * Metricool API reference: https://app.metricool.com/api/swagger-ui/
 */

import { format, eachDayOfInterval, parseISO, subDays } from "date-fns";
import type {
  AnalyticsData,
  DailyMetric,
  TopPost,
  AnalyticsSummary,
} from "@/types/analytics";

// ─── Constants ──────────────────────────────────────────────────────────────

const METRICOOL_BASE = "https://app.metricool.com/api/analytics/v2.0";

// ─── Public entry point ─────────────────────────────────────────────────────

export async function fetchAnalytics(
  startDate: string,
  endDate: string
): Promise<AnalyticsData> {
  const token = process.env.METRICOOL_API_TOKEN;
  const blogId = process.env.METRICOOL_BLOG_ID;

  if (token && blogId) {
    try {
      return await fetchFromMetricool(token, blogId, startDate, endDate);
    } catch (err) {
      console.error("[metricool] API request failed, falling back to mock data:", err);
    }
  }

  return buildMockData(startDate, endDate);
}

// ─── Real API implementation ─────────────────────────────────────────────────

async function fetchFromMetricool(
  token: string,
  blogId: string,
  startDate: string,
  endDate: string
): Promise<AnalyticsData> {
  const headers = { "X-Mc-Auth": token, "Content-Type": "application/json" };
  const qs = `blogId=${blogId}&initDate=${startDate}&endDate=${endDate}`;

  // Fetch Instagram stats and posts in parallel
  const [statsRes, postsRes] = await Promise.all([
    fetch(`${METRICOOL_BASE}/instagram/data?${qs}`, { headers, next: { revalidate: 300 } }),
    fetch(`${METRICOOL_BASE}/instagram/posts?${qs}&limit=10`, { headers, next: { revalidate: 300 } }),
  ]);

  if (!statsRes.ok) throw new Error(`Metricool stats ${statsRes.status}`);
  if (!postsRes.ok) throw new Error(`Metricool posts ${postsRes.status}`);

  const statsJson = await statsRes.json();
  const postsJson = await postsRes.json();

  return transformMetricoolResponse(statsJson, postsJson, startDate, endDate);
}

/**
 * Map Metricool's raw API response to our internal AnalyticsData shape.
 * Adjust field names here if Metricool's schema changes.
 */
function transformMetricoolResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postsRaw: any,
  startDate: string,
  endDate: string
): AnalyticsData {
  // Metricool returns an array of daily objects under stats.data
  const dailyRaw: DailyMetric[] = (stats.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any): DailyMetric => ({
      date: format(parseISO(d.date), "MMM dd"),
      impressions: d.impressions ?? 0,
      reach: d.reach ?? 0,
      engagementRate: parseFloat((d.engagementRate ?? 0).toFixed(2)),
      followers: d.followers ?? 0,
      followerGrowth: d.followerGrowth ?? d.newFollowers ?? 0,
    })
  );

  const totalImpressions = dailyRaw.reduce((s, d) => s + d.impressions, 0);
  const avgEngagementRate =
    dailyRaw.length
      ? parseFloat(
          (dailyRaw.reduce((s, d) => s + d.engagementRate, 0) / dailyRaw.length).toFixed(2)
        )
      : 0;
  const followerGrowth = dailyRaw.reduce((s, d) => s + d.followerGrowth, 0);
  const totalFollowers = dailyRaw[dailyRaw.length - 1]?.followers ?? stats.followers ?? 0;

  const summary: AnalyticsSummary = {
    totalImpressions,
    impressionsChange: stats.impressionsChange ?? 0,
    avgEngagementRate,
    engagementRateChange: stats.engagementRateChange ?? 0,
    totalFollowers,
    followerGrowth,
    followerGrowthChange:
      totalFollowers > 0 ? parseFloat(((followerGrowth / (totalFollowers - followerGrowth)) * 100).toFixed(1)) : 0,
    totalPosts: stats.totalPosts ?? postsRaw.total ?? 0,
    postsChange: stats.postsChange ?? 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topPosts: TopPost[] = (postsRaw.posts ?? postsRaw ?? []).slice(0, 10).map((p: any): TopPost => ({
    id: String(p.id ?? p.postId ?? Math.random()),
    caption: p.caption ?? p.text ?? "",
    platform: "instagram",
    postType: p.type ?? p.postType ?? "photo",
    impressions: p.impressions ?? 0,
    reach: p.reach ?? 0,
    likes: p.likes ?? p.reactions ?? 0,
    comments: p.comments ?? 0,
    shares: p.shares ?? 0,
    engagementRate: parseFloat((p.engagementRate ?? 0).toFixed(2)),
    publishedAt: p.publishedAt ?? p.date ?? new Date().toISOString(),
  }));

  return {
    summary,
    daily: dailyRaw,
    topPosts,
    dateRange: { start: startDate, end: endDate },
    source: "metricool",
  };
}

// ─── Mock data generator ─────────────────────────────────────────────────────

/**
 * Deterministic PRNG so the same date range always produces the same numbers.
 * Not crypto-quality — just good enough for consistent mock charts.
 */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(s) / 0xffffffff;
  };
}

function buildMockData(startDate: string, endDate: string): AnalyticsData {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });
  const seedVal = start.getTime() + end.getTime();
  const rand = seededRand(seedVal);

  // Base values that drift over time
  let followers = 10_400 + Math.floor(rand() * 2_000);
  const daily: DailyMetric[] = days.map((day) => {
    const base = 3_500 + Math.floor(rand() * 5_500);
    const growth = Math.floor(rand() * 40) - 5; // -5 to +35
    followers += growth;
    return {
      date: format(day, "MMM dd"),
      impressions: base,
      reach: Math.floor(base * (0.55 + rand() * 0.3)),
      engagementRate: parseFloat((2.5 + rand() * 4.5).toFixed(2)),
      followers,
      followerGrowth: growth,
    };
  });

  const totalImpressions = daily.reduce((s, d) => s + d.impressions, 0);
  const avgEngagementRate = parseFloat(
    (daily.reduce((s, d) => s + d.engagementRate, 0) / daily.length).toFixed(2)
  );
  const followerGrowth = daily.reduce((s, d) => s + d.followerGrowth, 0);
  const totalFollowers = daily[daily.length - 1].followers;

  // Previous-period comparison (roughly ±15%)
  const prevImpressions = Math.floor(totalImpressions * (0.85 + rand() * 0.3));
  const prevEngagement = parseFloat((avgEngagementRate * (0.85 + rand() * 0.3)).toFixed(2));
  const prevFollowers = totalFollowers - followerGrowth - Math.floor(rand() * 200);

  const summary: AnalyticsSummary = {
    totalImpressions,
    impressionsChange: parseFloat(
      (((totalImpressions - prevImpressions) / prevImpressions) * 100).toFixed(1)
    ),
    avgEngagementRate,
    engagementRateChange: parseFloat(
      (((avgEngagementRate - prevEngagement) / prevEngagement) * 100).toFixed(1)
    ),
    totalFollowers,
    followerGrowth,
    followerGrowthChange: parseFloat(
      (((totalFollowers - prevFollowers) / prevFollowers) * 100).toFixed(1)
    ),
    totalPosts: 6 + Math.floor(rand() * 14),
    postsChange: Math.floor(rand() * 5) - 1,
  };

  const platforms: TopPost["platform"][] = ["instagram", "instagram", "instagram", "facebook", "tiktok"];
  const types: TopPost["postType"][] = ["reel", "photo", "carousel", "reel", "video", "photo", "carousel", "story", "video", "reel"];
  const captions = [
    "Behind the scenes of our latest shoot ✨ The team nailed every detail — from lighting to composition.",
    "3 ways to style this piece for any occasion 🎨 Which look is your favourite? Drop it below 👇",
    "We asked, you answered 📊 Our community poll results are in and the verdict is clear.",
    "Good morning from the studio 🌅 Starting this week with big energy and even bigger goals.",
    "The story behind our brand — how a small idea became something we're incredibly proud of.",
    "New drop incoming 👀 You're not ready. April 15. Mark your calendar.",
    "Customer of the month spotlight 💙 Real people, real results — this is why we do what we do.",
    "Quick tip that changed how we approach content creation. Save this one for later 🔖",
    "Day in the life: what a full shoot day actually looks like from 6am to wrap.",
    "5 things we wish we knew before launching. Thread 🧵",
  ];

  const topPosts: TopPost[] = Array.from({ length: 10 }).map((_, i) => {
    const impressions = 5_000 + Math.floor(rand() * 40_000);
    const reach = Math.floor(impressions * (0.55 + rand() * 0.35));
    const likes = Math.floor(reach * (0.03 + rand() * 0.12));
    const comments = Math.floor(likes * (0.05 + rand() * 0.15));
    const shares = Math.floor(likes * (0.02 + rand() * 0.08));
    const engagementRate = parseFloat(
      (((likes + comments + shares) / reach) * 100).toFixed(2)
    );
    const daysAgo = Math.floor(rand() * (days.length - 1));
    return {
      id: String(i + 1),
      caption: captions[i % captions.length],
      platform: platforms[i % platforms.length],
      postType: types[i % types.length],
      impressions,
      reach,
      likes,
      comments,
      shares,
      engagementRate,
      publishedAt: subDays(end, daysAgo).toISOString(),
    };
  });

  // Sort by impressions descending
  topPosts.sort((a, b) => b.impressions - a.impressions);

  return {
    summary,
    daily,
    topPosts,
    dateRange: { start: startDate, end: endDate },
    source: "mock",
  };
}
