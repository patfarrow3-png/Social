"use client";

import dynamic from "next/dynamic";
import { X, ExternalLink, RefreshCw, Trash2, Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CompetitorProfile } from "@/types/competitors";
import { PLATFORM_META, formatFollowers, relativeTime } from "@/types/competitors";

const FollowerChart = dynamic(() => import("./follower-chart").then(m => ({ default: m.FollowerChart })), {
  ssr: false,
  loading: () => <div className="h-[140px] animate-pulse rounded-lg bg-muted" />,
});

interface CompetitorDetailProps {
  profile:   CompetitorProfile;
  onClose:   () => void;
  onDelete:  (id: string) => void;
  onRefresh: (id: string) => void;
}

const POST_TYPE_LABELS: Record<string, string> = {
  photo: "Photo", video: "Video", reel: "Reel",
  carousel: "Carousel", short: "Short", article: "Article",
};

const POST_TYPE_COLORS: Record<string, string> = {
  photo:    "bg-blue-500/15 text-blue-300 border-blue-500/25",
  video:    "bg-purple-500/15 text-purple-300 border-purple-500/25",
  reel:     "bg-pink-500/15 text-pink-300 border-pink-500/25",
  carousel: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  short:    "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  article:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
};

export function CompetitorDetail({ profile, onClose, onDelete, onRefresh }: CompetitorDetailProps) {
  const meta = PLATFORM_META[profile.platform];
  const growthPositive = profile.followerGrowthPct >= 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${profile.avatarColor} text-white font-semibold text-sm select-none`}>
            {profile.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-foreground leading-tight">{profile.displayName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${meta.badgeClass}`}>
                {meta.label}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {meta.handlePrefix}{profile.handle}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Separator />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-px bg-border m-4 rounded-lg overflow-hidden">
          {[
            { label: meta.followerLabel,   value: formatFollowers(profile.followers) },
            {
              label: "30d Growth",
              value: `${growthPositive ? "+" : ""}${profile.followerGrowthPct}%`,
              color: growthPositive ? "text-emerald-400" : "text-red-400",
            },
            { label: "Avg Engagement",  value: `${profile.avgEngagementRate}%` },
            { label: "Posts / Week",    value: profile.postsPerWeek.toString() },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className={`mt-0.5 text-lg font-semibold leading-none ${color ?? "text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* 30-day follower trend */}
        <div className="px-4 pb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">30-Day Follower Trend</p>
          <FollowerChart data={profile.followerHistory} positive={growthPositive} />
        </div>

        <Separator />

        {/* Recent posts */}
        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Posts</p>
          <div className="space-y-3">
            {profile.recentPosts.map(post => (
              <div key={post.id} className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${POST_TYPE_COLORS[post.type] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {POST_TYPE_LABELS[post.type] ?? post.type}
                  </span>
                  <span className="text-[11px] text-muted-foreground ml-auto">{relativeTime(post.publishedAt)}</span>
                </div>
                <p className="text-xs text-foreground line-clamp-2 mb-2">{post.caption}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatFollowers(post.likes)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{formatFollowers(post.comments)}</span>
                  <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{formatFollowers(post.shares)}</span>
                  <span className="ml-auto font-medium text-foreground">{post.engagementRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {profile.notes && (
          <>
            <Separator />
            <div className="px-4 py-4">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
              <p className="text-xs text-foreground">{profile.notes}</p>
            </div>
          </>
        )}

        {/* Meta footer */}
        <div className="px-4 pb-4">
          <p className="text-[11px] text-muted-foreground">
            Added {relativeTime(profile.addedAt)} · Last posted {relativeTime(profile.lastPostedAt)} · {profile.totalPosts.toLocaleString()} total posts
          </p>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-2 p-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onRefresh(profile.id)}
          disabled={profile.isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${profile.isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          onClick={() => onDelete(profile.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Untrack
        </Button>
      </div>
    </div>
  );
}
