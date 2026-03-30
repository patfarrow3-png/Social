import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Zap,
  Image,
  Film,
  Clapperboard,
  LayoutGrid,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopPost, Platform } from "@/types/analytics";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: Zap,
  linkedin: Zap,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "text-pink-400",
  facebook: "text-blue-400",
  twitter: "text-sky-400",
  tiktok: "text-white",
  linkedin: "text-blue-500",
};

const TYPE_ICONS = {
  photo: Image,
  video: Film,
  reel: Clapperboard,
  carousel: LayoutGrid,
  story: CircleDot,
};

const TYPE_COLORS: Record<string, string> = {
  photo: "bg-blue-500/15 text-blue-400",
  video: "bg-purple-500/15 text-purple-400",
  reel: "bg-pink-500/15 text-pink-400",
  carousel: "bg-amber-500/15 text-amber-400",
  story: "bg-emerald-500/15 text-emerald-400",
};

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-400/15 text-xs font-bold text-zinc-300">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-700/20 text-xs font-bold text-orange-400">
        3
      </span>
    );
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {rank}
    </span>
  );
}

// ─── Inline stat ─────────────────────────────────────────────────────────────

function Stat({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground/80">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

// ─── Impressions bar ─────────────────────────────────────────────────────────

function ImpressionsBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-blue-500/70"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{fmt(value)}</span>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function TopPostRow({ post, rank, maxImpressions }: { post: TopPost; rank: number; maxImpressions: number }) {
  const PlatformIcon = PLATFORM_ICONS[post.platform];
  const TypeIcon = TYPE_ICONS[post.postType] ?? Image;

  return (
    <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/30">
      {/* Rank */}
      <RankBadge rank={rank} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              TYPE_COLORS[post.postType] ?? "bg-muted text-muted-foreground"
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {post.postType}
          </span>
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium", PLATFORM_COLORS[post.platform])}>
            <PlatformIcon className="h-3.5 w-3.5" />
            {post.platform}
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
        </div>

        {/* Caption */}
        <p className="line-clamp-2 text-sm text-foreground/90 leading-snug">
          {post.caption}
        </p>

        {/* Stats */}
        <div className="mt-2 flex flex-wrap gap-3">
          <Stat icon={Heart}          value={fmt(post.likes)}     label="likes"    />
          <Stat icon={MessageCircle}  value={fmt(post.comments)}  label="comments" />
          <Stat icon={Share2}         value={fmt(post.shares)}    label="shares"   />
          <Stat icon={Eye}            value={fmt(post.reach)}     label="reach"    />
          <div className="flex items-center gap-1 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-medium text-amber-400">{post.engagementRate.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Impressions bar */}
      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <span className="text-xs text-muted-foreground">Impressions</span>
        <ImpressionsBar value={post.impressions} max={maxImpressions} />
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface TopPostsProps {
  posts: TopPost[];
}

export function TopPosts({ posts }: TopPostsProps) {
  const maxImpressions = posts[0]?.impressions ?? 1;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold text-foreground">Top Performing Posts</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ranked by impressions over the selected period
        </p>
      </div>

      <div className="divide-y divide-border px-3 py-2">
        {posts.map((post, i) => (
          <TopPostRow
            key={post.id}
            post={post}
            rank={i + 1}
            maxImpressions={maxImpressions}
          />
        ))}
      </div>
    </div>
  );
}

export function TopPostsSkeleton() {
  return (
    <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />
  );
}
