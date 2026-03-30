// ─── Platform ────────────────────────────────────────────────────────────────

export type CalendarPlatform =
  | "instagram"
  | "youtube"
  | "facebook"
  | "twitter"
  | "tiktok"
  | "linkedin";

export type CalendarPostType =
  | "photo"
  | "video"
  | "reel"
  | "carousel"
  | "story"
  | "short"
  | "thread"
  | "article";

export type CalendarPostStatus = "scheduled" | "published" | "draft";

// ─── Core post shape ─────────────────────────────────────────────────────────

export interface CalendarPost {
  id: string;
  /** Short chip-friendly title (shown on the calendar cell) */
  title: string;
  caption: string;
  platform: CalendarPlatform;
  postType: CalendarPostType;
  status: CalendarPostStatus;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24-hour), optional */
  time?: string;
  tags: string[];
  mediaNote?: string;
}

// ─── Platform display config ─────────────────────────────────────────────────

export interface PlatformConfig {
  label: string;
  abbrev: string;
  /** Tailwind classes for filter pill */
  filterActive: string;
  /** Tailwind classes for chip on calendar */
  chipClass: string;
  /** Tailwind icon color class */
  iconColor: string;
  /** Dot color for detail panel badge */
  dotColor: string;
}

export const PLATFORM_CONFIG: Record<CalendarPlatform, PlatformConfig> = {
  instagram: {
    label: "Instagram",
    abbrev: "IG",
    filterActive: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    chipClass:    "bg-pink-500/15 text-pink-300 border border-pink-500/25 hover:bg-pink-500/25",
    iconColor:    "text-pink-400",
    dotColor:     "bg-pink-400",
  },
  youtube: {
    label: "YouTube",
    abbrev: "YT",
    filterActive: "bg-red-500/20 text-red-300 border-red-500/30",
    chipClass:    "bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25",
    iconColor:    "text-red-400",
    dotColor:     "bg-red-400",
  },
  facebook: {
    label: "Facebook",
    abbrev: "FB",
    filterActive: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    chipClass:    "bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25",
    iconColor:    "text-blue-400",
    dotColor:     "bg-blue-400",
  },
  twitter: {
    label: "X / Twitter",
    abbrev: "X",
    filterActive: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    chipClass:    "bg-sky-500/15 text-sky-300 border border-sky-500/25 hover:bg-sky-500/25",
    iconColor:    "text-sky-400",
    dotColor:     "bg-sky-400",
  },
  tiktok: {
    label: "TikTok",
    abbrev: "TK",
    filterActive: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    chipClass:    "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/25",
    iconColor:    "text-cyan-400",
    dotColor:     "bg-cyan-400",
  },
  linkedin: {
    label: "LinkedIn",
    abbrev: "LI",
    filterActive: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    chipClass:    "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25",
    iconColor:    "text-indigo-400",
    dotColor:     "bg-indigo-400",
  },
};

export const PLATFORM_ORDER: CalendarPlatform[] = [
  "instagram",
  "youtube",
  "facebook",
  "twitter",
  "tiktok",
  "linkedin",
];

export const POST_TYPE_LABELS: Record<CalendarPostType, string> = {
  photo:   "Photo",
  video:   "Video",
  reel:    "Reel",
  carousel:"Carousel",
  story:   "Story",
  short:   "Short",
  thread:  "Thread",
  article: "Article",
};

export const STATUS_CONFIG: Record<
  CalendarPostStatus,
  { label: string; class: string }
> = {
  scheduled: { label: "Scheduled", class: "bg-blue-500/15 text-blue-300" },
  published: { label: "Published", class: "bg-emerald-500/15 text-emerald-300" },
  draft:     { label: "Draft",     class: "bg-muted text-muted-foreground" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format HH:MM (24h) to "h:mm AM/PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}
