"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ExternalLink, Heart, MessageCircle, RefreshCw,
  Image as ImageIcon, Video, LayoutGrid, AlertCircle, Rss,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IGMedia, MediaResponse } from "@/types/instagram-api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = diff / 3_600_000;
  if (hours < 1)   return `${Math.floor(diff / 60_000)}m ago`;
  if (hours < 24)  return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 7)    return `${Math.floor(days)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const MEDIA_TYPE_ICON: Record<string, React.ElementType> = {
  IMAGE:          ImageIcon,
  VIDEO:          Video,
  REELS:          Video,
  CAROUSEL_ALBUM: LayoutGrid,
};

const MEDIA_TYPE_LABEL: Record<string, string> = {
  IMAGE:          "Photo",
  VIDEO:          "Video",
  REELS:          "Reel",
  CAROUSEL_ALBUM: "Carousel",
};

// ─── Post card ────────────────────────────────────────────────────────────────

function LivePostCard({ post }: { post: IGMedia }) {
  const TypeIcon  = MEDIA_TYPE_ICON[post.media_type] ?? ImageIcon;
  const typeLabel = MEDIA_TYPE_LABEL[post.media_type] ?? post.media_type;
  const thumb     = post.thumbnail_url ?? post.media_url;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-border/80"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={post.caption?.slice(0, 80) ?? "Instagram post"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Type badge */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-white/10 bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          <TypeIcon className="h-3 w-3" />
          {typeLabel}
        </span>

        {/* External link hint */}
        <span className="absolute right-2 top-2 rounded border border-white/10 bg-black/60 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ExternalLink className="h-3 w-3 text-white" />
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Caption */}
        {post.caption ? (
          <p className="line-clamp-2 text-xs text-foreground leading-relaxed">{post.caption}</p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic">No caption</p>
        )}

        {/* Stats */}
        <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatCount(post.like_count)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatCount(post.comments_count)}
            </span>
          </div>
          <span>{relativeTime(post.timestamp)}</span>
        </div>
      </div>
    </a>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function LivePostSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card animate-pulse">
      <div className="aspect-square w-full bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="mt-1 flex gap-3">
          <div className="h-3 w-8 rounded bg-muted" />
          <div className="h-3 w-8 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LiveFeed() {
  const [state, setState] = useState<{
    posts:     IGMedia[];
    loading:   boolean;
    isMock:    boolean;
    error:     string | null;
    fetchedAt: string | null;
  }>({ posts: [], loading: true, isMock: true, error: null, fetchedAt: null });

  const fetch_ = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res  = await fetch("/api/instagram/media?limit=12");
      const data: MediaResponse = await res.json();
      setState({
        posts:     data.posts,
        loading:   false,
        isMock:    data.isMock,
        error:     data.error ?? null,
        fetchedAt: data.fetchedAt,
      });
    } catch {
      setState(s => ({ ...s, loading: false, error: "Failed to load posts." }));
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {state.loading ? "Loading…" : state.isMock && state.posts.length === 0
            ? "Connect your account to see live posts"
            : `${state.posts.length} published post${state.posts.length !== 1 ? "s" : ""}`}
        </p>
        <Button variant="outline" size="sm" onClick={fetch_} disabled={state.loading} className="gap-1.5">
          <RefreshCw className={cn("h-3.5 w-3.5", state.loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Token not configured notice */}
      {!state.loading && state.isMock && state.posts.length === 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300/80">
          <Rss className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p>
              <span className="font-medium text-amber-300">Instagram token not configured.</span>{" "}
              Add <code className="rounded bg-amber-500/10 px-1 text-xs">INSTAGRAM_ACCESS_TOKEN</code> to{" "}
              <code className="rounded bg-amber-500/10 px-1 text-xs">.env.local</code> to load live posts from{" "}
              <span className="font-medium">@_trippygrippy_</span>.
            </p>
            <p className="text-xs text-amber-300/60">
              See <code className="rounded bg-amber-500/10 px-1">.env.local.example</code> for setup instructions.
            </p>
          </div>
        </div>
      )}

      {/* API error */}
      {state.error && !state.isMock && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>API error: {state.error}</span>
        </div>
      )}

      {/* Skeleton loading */}
      {state.loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <LivePostSkeleton key={i} />)}
        </div>
      )}

      {/* Posts grid */}
      {!state.loading && state.posts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {state.posts.map(post => <LivePostCard key={post.id} post={post} />)}
        </div>
      )}

      {/* Footer timestamp */}
      {state.fetchedAt && !state.loading && state.posts.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground/40">
          Last synced {new Date(state.fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
