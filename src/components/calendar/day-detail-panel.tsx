"use client";

import { format } from "date-fns";
import {
  Instagram, Youtube, Facebook, Twitter, Music2, Linkedin,
  X, Clock, Tag, FileText, Trash2, CheckCircle2, CalendarClock, FilePenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type CalendarPost,
  type CalendarPlatform,
  PLATFORM_CONFIG,
  POST_TYPE_LABELS,
  STATUS_CONFIG,
  formatTime,
} from "@/types/calendar";
import { Button } from "@/components/ui/button";

const PLATFORM_ICONS: Record<CalendarPlatform, React.ElementType> = {
  instagram: Instagram,
  youtube:   Youtube,
  facebook:  Facebook,
  twitter:   Twitter,
  tiktok:    Music2,
  linkedin:  Linkedin,
};

// ─── Single post row ─────────────────────────────────────────────────────────

interface PostRowProps {
  post: CalendarPost;
  onDelete: (id: string) => void;
}

function PostRow({ post, onDelete }: PostRowProps) {
  const cfg        = PLATFORM_CONFIG[post.platform];
  const PlatIcon   = PLATFORM_ICONS[post.platform];
  const statusCfg  = STATUS_CONFIG[post.status];

  return (
    <div className="group rounded-lg border border-border bg-muted/10 p-4 transition-colors hover:bg-muted/20">
      {/* Header row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform badge */}
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.filterActive)}>
            <PlatIcon className="h-3 w-3" />
            {cfg.label}
          </span>
          {/* Post type */}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {POST_TYPE_LABELS[post.postType]}
          </span>
          {/* Status */}
          <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", statusCfg.class)}>
            {post.status === "published" && <CheckCircle2 className="h-3 w-3" />}
            {post.status === "scheduled" && <CalendarClock className="h-3 w-3" />}
            {post.status === "draft"     && <FilePenLine className="h-3 w-3" />}
            {statusCfg.label}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(post.id)}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          title="Delete post"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <p className="font-medium text-foreground">{post.title}</p>

      {/* Time */}
      {post.time && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatTime(post.time)}
        </div>
      )}

      {/* Caption */}
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
        {post.caption}
      </p>

      {/* Media note */}
      {post.mediaNote && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-muted/40 px-3 py-2">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{post.mediaNote}</p>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 5).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Tag className="h-2.5 w-2.5" />
              {t}
            </span>
          ))}
          {post.tags.length > 5 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{post.tags.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

interface DayDetailPanelProps {
  day: Date | null;
  posts: CalendarPost[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onAddPost: () => void;
  filter: Set<CalendarPlatform> | "all";
}

export function DayDetailPanel({
  day,
  posts,
  onClose,
  onDelete,
  onAddPost,
  filter,
}: DayDetailPanelProps) {
  if (!day) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
        <CalendarClock className="mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Select a day</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Click any date on the calendar to see its content
        </p>
      </div>
    );
  }

  const filteredPosts = posts
    .filter((p) => filter === "all" || filter.has(p.platform))
    .sort((a, b) => (a.time ?? "00:00").localeCompare(b.time ?? "00:00"));

  const dayLabel  = format(day, "EEEE, MMMM d");
  const yearLabel = format(day, "yyyy");

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-semibold text-foreground">{dayLabel}</p>
          <p className="text-xs text-muted-foreground">
            {yearLabel} &middot;{" "}
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={onAddPost} className="h-7 px-2.5 text-xs">
            + Add
          </Button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Post list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">No posts for this day</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddPost}
              className="mt-3"
            >
              + Add post
            </Button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostRow key={post.id} post={post} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
