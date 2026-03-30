import { cn } from "@/lib/utils";
import { type CalendarPost, PLATFORM_CONFIG, POST_TYPE_LABELS } from "@/types/calendar";

interface PostChipProps {
  post: CalendarPost;
  onClick?: (post: CalendarPost) => void;
  compact?: boolean;
}

export function PostChip({ post, onClick, compact = false }: PostChipProps) {
  const cfg = PLATFORM_CONFIG[post.platform];

  return (
    <button
      type="button"
      onClick={() => onClick?.(post)}
      title={`${cfg.label} · ${POST_TYPE_LABELS[post.postType]} · ${post.title}`}
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-xs font-medium transition-colors truncate",
        cfg.chipClass,
        post.status === "draft" && "opacity-60 border-dashed"
      )}
    >
      {/* Platform abbreviation dot */}
      <span className="shrink-0 font-bold tracking-tight leading-none">
        {cfg.abbrev}
      </span>

      {!compact && (
        <span className="truncate leading-tight">{post.title}</span>
      )}
    </button>
  );
}
