// ─── Platforms ───────────────────────────────────────────────────────────────

export type CompetitorPlatform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "linkedin";

export const COMPETITOR_PLATFORMS: CompetitorPlatform[] = [
  "instagram", "youtube", "tiktok", "twitter", "facebook", "linkedin",
];

export interface PlatformMeta {
  label:       string;
  abbrev:      string;
  handlePrefix: string; // "@" | "" (YouTube uses channel names)
  followerLabel: string; // "Followers" | "Subscribers"
  /** Tailwind classes for the platform badge */
  badgeClass:  string;
  iconColor:   string;
}

export const PLATFORM_META: Record<CompetitorPlatform, PlatformMeta> = {
  instagram: {
    label:        "Instagram",
    abbrev:       "IG",
    handlePrefix: "@",
    followerLabel:"Followers",
    badgeClass:   "bg-pink-500/15 text-pink-300 border-pink-500/25",
    iconColor:    "text-pink-400",
  },
  youtube: {
    label:        "YouTube",
    abbrev:       "YT",
    handlePrefix: "",
    followerLabel:"Subscribers",
    badgeClass:   "bg-red-500/15 text-red-300 border-red-500/25",
    iconColor:    "text-red-400",
  },
  tiktok: {
    label:        "TikTok",
    abbrev:       "TK",
    handlePrefix: "@",
    followerLabel:"Followers",
    badgeClass:   "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    iconColor:    "text-cyan-400",
  },
  twitter: {
    label:        "X / Twitter",
    abbrev:       "X",
    handlePrefix: "@",
    followerLabel:"Followers",
    badgeClass:   "bg-sky-500/15 text-sky-300 border-sky-500/25",
    iconColor:    "text-sky-400",
  },
  facebook: {
    label:        "Facebook",
    abbrev:       "FB",
    handlePrefix: "",
    followerLabel:"Followers",
    badgeClass:   "bg-blue-500/15 text-blue-300 border-blue-500/25",
    iconColor:    "text-blue-400",
  },
  linkedin: {
    label:        "LinkedIn",
    abbrev:       "LI",
    handlePrefix: "",
    followerLabel:"Followers",
    badgeClass:   "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    iconColor:    "text-indigo-400",
  },
};

// ─── Data shapes ─────────────────────────────────────────────────────────────

export interface RecentPost {
  id:             string;
  type:           "photo" | "video" | "reel" | "carousel" | "short" | "article";
  caption:        string;
  likes:          number;
  comments:       number;
  shares:         number;
  engagementRate: number;
  publishedAt:    string; // ISO date
}

export interface CompetitorProfile {
  id:                   string;
  /** User-supplied friendly name for grouping (e.g. "Nike") */
  competitorName:       string;
  platform:             CompetitorPlatform;
  handle:               string;
  displayName:          string;
  /** Tailwind bg class for the avatar placeholder circle */
  avatarColor:          string;
  followers:            number;
  /** 30 daily follower counts, oldest → newest — used for sparkline & chart */
  followerHistory:      number[];
  followerGrowth30d:    number;     // absolute
  followerGrowthPct:    number;     // %
  avgLikes:             number;
  avgComments:          number;
  avgShares:            number;
  avgEngagementRate:    number;
  postsPerWeek:         number;
  totalPosts:           number;
  lastPostedAt:         string;     // ISO date
  recentPosts:          RecentPost[];
  addedAt:              string;     // ISO date
  /** True while a "fetch" is in flight */
  isLoading?:           boolean;
  notes?:               string;
  /** "mock" — will be "live" when real API is wired */
  source:               "mock" | "live";
}

// ─── Sort / filter state ─────────────────────────────────────────────────────

export type SortKey =
  | "competitorName"
  | "handle"
  | "followers"
  | "followerGrowthPct"
  | "avgEngagementRate"
  | "postsPerWeek"
  | "lastPostedAt";

export type SortDir = "asc" | "desc";

export interface SortState { key: SortKey; dir: SortDir }

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = diff / 3_600_000;
  if (hours < 1)  return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days}d ago`;
  if (days < 14)  return "1 week ago";
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
