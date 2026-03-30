"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Image,
  Film,
  Clapperboard,
  LayoutGrid,
  CircleDot,
  Tag,
  Trash2,
  Pencil,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Post,
  PostStatus,
  POST_TYPE_LABELS,
  POST_TYPE_COLORS,
  POST_STATUS_COLORS,
  POST_STATUS_LABELS,
} from "@/types/instagram";
import { Button } from "@/components/ui/button";

const POST_TYPE_ICONS = {
  photo: Image,
  video: Film,
  reel: Clapperboard,
  carousel: LayoutGrid,
  story: CircleDot,
};

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PostStatus) => void;
  onEdit: (post: Post) => void;
}

const STATUS_TRANSITIONS: Record<PostStatus, { label: string; next: PostStatus }[]> = {
  backlog: [
    { label: "Move to Draft", next: "draft" },
    { label: "Mark Published", next: "published" },
  ],
  draft: [
    { label: "Schedule", next: "scheduled" },
    { label: "Move to Backlog", next: "backlog" },
    { label: "Mark Published", next: "published" },
  ],
  scheduled: [
    { label: "Mark Published", next: "published" },
    { label: "Back to Draft", next: "draft" },
  ],
  published: [
    { label: "Move to Backlog", next: "backlog" },
  ],
};

function formatScheduledDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function timeAgo(iso: string) {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostCard({ post, onDelete, onStatusChange, onEdit }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const TypeIcon = POST_TYPE_ICONS[post.postType];
  const transitions = STATUS_TRANSITIONS[post.status];

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card transition-all duration-150 hover:border-border/70 hover:shadow-lg hover:shadow-black/20">
      {/* Card top bar: type badge + status + menu */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          {/* Post type pill */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              POST_TYPE_COLORS[post.postType]
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {POST_TYPE_LABELS[post.postType]}
          </span>
          {/* Status dot */}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              POST_STATUS_COLORS[post.status]
            )}
          >
            {POST_STATUS_LABELS[post.status]}
          </span>
        </div>

        {/* Action menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 min-w-[160px] overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => { onEdit(post); setMenuOpen(false); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit post
                </button>
                {transitions.map((t) => (
                  <button
                    key={t.next}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => { onStatusChange(post.id, t.next); setMenuOpen(false); }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => { onDelete(post.id); setMenuOpen(false); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3 flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground">
          {post.caption}
        </p>
      </div>

      {/* Media note */}
      {post.mediaNote && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground line-clamp-2">{post.mediaNote}</p>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
          {post.tags.length > 4 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{post.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: date info */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        {post.scheduledDate ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span>{formatScheduledDate(post.scheduledDate)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Created {timeAgo(post.createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
