/**
 * Deterministic mock competitor data generator.
 *
 * The same {handle, platform} pair always produces the same numbers, so the
 * dashboard is consistent across page reloads and looks like real scraped data.
 *
 * In production, swap `mockFetchProfile` for calls to the platform APIs:
 *   - Instagram Graph API (requires business account)
 *   - YouTube Data API v3 (free quota)
 *   - TikTok Research API (academic / business)
 *   - Twitter/X API v2 (Basic tier)
 *   - Facebook Graph API (page token)
 *   - LinkedIn Marketing API (partner access)
 */

import { subDays, formatISO } from "date-fns";
import type { CompetitorProfile, CompetitorPlatform, RecentPost } from "@/types/competitors";

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function seededRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

function randBetween(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.round(randBetween(rng, min, max));
}

// ─── Per-platform param ranges ────────────────────────────────────────────────

const PARAMS: Record<
  CompetitorPlatform,
  { follMin: number; follMax: number; engMin: number; engMax: number; ppwMin: number; ppwMax: number }
> = {
  instagram: { follMin: 50_000,   follMax: 4_500_000, engMin: 1.2, engMax: 6.5,  ppwMin: 1,   ppwMax: 7   },
  youtube:   { follMin: 8_000,    follMax: 3_000_000, engMin: 0.8, engMax: 4.5,  ppwMin: 0.5, ppwMax: 3   },
  tiktok:    { follMin: 80_000,   follMax: 8_000_000, engMin: 3.0, engMax: 16,   ppwMin: 5,   ppwMax: 14  },
  twitter:   { follMin: 5_000,    follMax: 900_000,   engMin: 0.2, engMax: 2.5,  ppwMin: 5,   ppwMax: 21  },
  facebook:  { follMin: 15_000,   follMax: 2_500_000, engMin: 0.2, engMax: 2.0,  ppwMin: 2,   ppwMax: 8   },
  linkedin:  { follMin: 1_500,    follMax: 300_000,   engMin: 0.8, engMax: 5.0,  ppwMin: 1,   ppwMax: 5   },
};

// ─── Avatar colour pool ───────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-pink-600", "bg-purple-600", "bg-blue-600", "bg-cyan-600",
  "bg-emerald-600", "bg-amber-600", "bg-orange-600", "bg-rose-600",
  "bg-violet-600", "bg-teal-600",
];

// ─── Caption templates per platform ──────────────────────────────────────────

const CAPTIONS: Record<CompetitorPlatform, string[]> = {
  instagram: [
    "New drop just landed 🔥 Swipe to see every detail →",
    "Behind the scenes of our latest campaign ✨ #BTS",
    "Which colour is your favourite? Comment below 👇",
    "This one took 6 months to perfect. Worth every second. 🙌",
    "Our community is everything 💙 Thank you for 1M!",
    "Can you guess what we're launching next week? 👀",
  ],
  youtube: [
    "We went behind the scenes of our biggest production yet.",
    "Full product breakdown — everything you need to know.",
    "I tried this for 30 days. Here's what actually happened.",
    "The complete guide to getting started in 2026.",
    "We interviewed 10 experts. Here's what they all agreed on.",
  ],
  tiktok: [
    "This trend but make it us 🎵 #FYP #Trending",
    "POV: you just discovered this hack 🤯 #LifeHack",
    "We tried the viral thing so you don't have to 😂",
    "Tell me you're obsessed without telling me #viral",
    "Replying to @user — here's the full answer 🔥",
  ],
  twitter: [
    "Hot take: most brands are still doing social media wrong. A thread 🧵",
    "We just crossed 500K. Thank you. Genuinely.",
    "The platform updates today are wild. Here's what it means for you:",
    "Ask me anything about content strategy — dropping answers all day.",
    "Sharing our Q1 numbers publicly because transparency matters. 📊",
  ],
  facebook: [
    "Big announcement incoming 🎉 Share this with someone who needs to see it.",
    "Our community poll results are in — you voted and we listened!",
    "Flash sale: 24 hours only. Details in the comments below 👇",
    "We're going LIVE tomorrow at 3PM. Mark your calendars!",
    "Customer story of the week — this one made the whole team tear up. 🥹",
  ],
  linkedin: [
    "3 years ago we had 5 employees. Today we have 47. Here's what changed.",
    "The hiring landscape in 2026 has completely shifted. Our perspective:",
    "We just closed our Series A. What we learned about fundraising in a tough market.",
    "Transparent revenue report: Q1 2026. No fluff, just numbers.",
    "The one thing we'd do differently if we started over. Honest answer below.",
  ],
};

// ─── Post type distribution per platform ─────────────────────────────────────

const POST_TYPES: Record<
  CompetitorPlatform,
  RecentPost["type"][]
> = {
  instagram: ["reel", "photo", "carousel", "reel", "photo", "carousel", "video"],
  youtube:   ["video", "video", "short", "video", "short"],
  tiktok:    ["short", "short", "video", "short", "short"],
  twitter:   ["article", "article", "article", "article"],
  facebook:  ["video", "photo", "article", "video", "photo"],
  linkedin:  ["article", "article", "photo", "article", "video"],
};

// ─── Core generator ──────────────────────────────────────────────────────────

const REF_DATE = new Date("2026-03-30T12:00:00Z");

export function generateCompetitorProfile(
  handle: string,
  platform: CompetitorPlatform,
  competitorName: string,
  addedAt = REF_DATE.toISOString(),
): CompetitorProfile {
  const seed  = `${platform}::${handle.toLowerCase()}`;
  const rng   = seededRng(seed);
  const p     = PARAMS[platform];

  // ── Follower baseline ────────────────────────────────────────────────────
  const followers = Math.round(
    p.follMin + rng() * (p.follMax - p.follMin)
  );

  // ── 30-day follower history ───────────────────────────────────────────────
  // Trend: slightly upward with noise
  const trendSlope = (rng() - 0.3) * 0.005; // −0.15 % to +0.35% daily
  const followerHistory: number[] = [];
  let cur = followers - Math.round(followers * trendSlope * 30);
  for (let d = 29; d >= 0; d--) {
    const noise  = (rng() - 0.5) * followers * 0.003;
    cur += Math.round(followers * trendSlope + noise);
    followerHistory.push(Math.max(0, cur));
  }
  followerHistory.push(followers); // last point is current

  const followerGrowth30d   = followers - followerHistory[0];
  const followerGrowthPct   = parseFloat(((followerGrowth30d / followerHistory[0]) * 100).toFixed(2));

  // ── Engagement metrics ───────────────────────────────────────────────────
  const avgEngagementRate   = parseFloat(randBetween(rng, p.engMin, p.engMax).toFixed(2));
  const avgLikes            = Math.round(followers * (avgEngagementRate / 100) * randBetween(rng, 0.7, 0.95));
  const avgComments         = Math.round(avgLikes * randBetween(rng, 0.03, 0.12));
  const avgShares           = Math.round(avgLikes * randBetween(rng, 0.01, 0.07));

  // ── Posting frequency ────────────────────────────────────────────────────
  const postsPerWeek        = parseFloat(randBetween(rng, p.ppwMin, p.ppwMax).toFixed(1));
  const totalPosts          = randInt(rng, 80, 2400);

  // ── Last posted ──────────────────────────────────────────────────────────
  const hoursAgo            = randInt(rng, 2, 72);
  const lastPostedAt        = subDays(REF_DATE, hoursAgo / 24).toISOString();

  // ── Recent posts ─────────────────────────────────────────────────────────
  const types    = POST_TYPES[platform];
  const captions = CAPTIONS[platform];
  const recentPosts: RecentPost[] = Array.from({ length: 6 }).map((_, i) => {
    const postFollowers    = Math.round(followers * randBetween(rng, 0.3, 1.5));
    const likes            = Math.round(postFollowers * (avgEngagementRate / 100) * randBetween(rng, 0.5, 1.5));
    const comments         = Math.round(likes * randBetween(rng, 0.03, 0.15));
    const shares           = Math.round(likes * randBetween(rng, 0.01, 0.08));
    const postEng          = parseFloat((((likes + comments + shares) / postFollowers) * 100).toFixed(2));
    const daysAgo          = i * Math.ceil(7 / postsPerWeek) + randInt(rng, 0, 2);
    return {
      id:             `${seed}-post-${i}`,
      type:           types[i % types.length],
      caption:        captions[i % captions.length],
      likes,
      comments,
      shares,
      engagementRate: postEng,
      publishedAt:    formatISO(subDays(REF_DATE, daysAgo)),
    };
  });

  // ── Avatar colour ────────────────────────────────────────────────────────
  let h = 0;
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  const avatarColor = AVATAR_COLORS[h % AVATAR_COLORS.length];

  return {
    id:               crypto.randomUUID(),
    competitorName,
    platform,
    handle:           handle.replace(/^@/, ""),
    displayName:      competitorName,
    avatarColor,
    followers,
    followerHistory,
    followerGrowth30d,
    followerGrowthPct,
    avgLikes,
    avgComments,
    avgShares,
    avgEngagementRate,
    postsPerWeek,
    totalPosts,
    lastPostedAt,
    recentPosts,
    addedAt,
    source:           "mock",
  };
}

// ─── Pre-built seed profiles ─────────────────────────────────────────────────

const SEED_SPECS: Array<{ name: string; platform: CompetitorPlatform; handle: string }> = [
  { name: "StyleHouse",     platform: "instagram", handle: "stylehouse_co"     },
  { name: "StyleHouse",     platform: "tiktok",    handle: "stylehouse_co"     },
  { name: "StyleHouse",     platform: "youtube",   handle: "StyleHouse"        },
  { name: "UrbanPeak",      platform: "instagram", handle: "urbanpeak"         },
  { name: "UrbanPeak",      platform: "twitter",   handle: "urbanpeak"         },
  { name: "TrendForge",     platform: "instagram", handle: "trendforge"        },
  { name: "TrendForge",     platform: "tiktok",    handle: "trendforge"        },
  { name: "CreativeHive",   platform: "youtube",   handle: "CreativeHive"      },
  { name: "CreativeHive",   platform: "instagram", handle: "creativehive"      },
  { name: "ModernRoot",     platform: "instagram", handle: "modernroot"        },
  { name: "ModernRoot",     platform: "linkedin",  handle: "Modern Root"       },
  { name: "NovaCulture",    platform: "tiktok",    handle: "novaculture"       },
  { name: "NovaCulture",    platform: "instagram", handle: "novaculture"       },
  { name: "NovaCulture",    platform: "youtube",   handle: "NovaCulture"       },
];

export const SEED_COMPETITORS: CompetitorProfile[] = SEED_SPECS.map(({ name, platform, handle }) =>
  generateCompetitorProfile(handle, platform, name)
);
