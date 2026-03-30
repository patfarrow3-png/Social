import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/types/news";
import { TOPIC_META, relativeNewsTime } from "@/types/news";

interface NewsCardProps {
  article: NewsArticle;
  /** When true, renders a wider horizontal layout */
  featured?: boolean;
}

export function NewsCard({ article, featured = false }: NewsCardProps) {
  const meta = TOPIC_META[article.topic];

  if (featured) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-5 rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80 hover:bg-card/80"
      >
        {/* Left: text */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {/* Topic + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}>
              {meta.label}
            </span>
            <span className="text-xs text-muted-foreground">{article.source}</span>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground/60">{relativeNewsTime(article.publishedAt)}</span>
          </div>

          {/* Headline */}
          <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {article.summary}
          </p>

          {/* Read more */}
          <div className="mt-auto flex items-center gap-1 text-xs text-primary/70 group-hover:text-primary transition-colors pt-1">
            Read full article
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 hover:bg-card/80"
    >
      {/* Topic pill + meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}>
          {meta.label}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground/60">{relativeNewsTime(article.publishedAt)}</span>
      </div>

      {/* Headline */}
      <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
        {article.summary}
      </p>

      {/* Footer: source + link icon */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[11px] text-muted-foreground/70 truncate">{article.source}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
      </div>
    </a>
  );
}
