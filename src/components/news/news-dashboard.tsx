"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Search, X, Rss, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { NewsCard }         from "./news-card";
import { NewsCardSkeleton } from "./news-skeleton";
import type { NewsArticle, NewsTopic } from "@/types/news";
import { NEWS_TOPICS, TOPIC_META } from "@/types/news";

// ─── Types ────────────────────────────────────────────────────────────────────

type TopicFilter = NewsTopic | "all";

interface FeedState {
  articles:  NewsArticle[];
  fetchedAt: string | null;
  isMock:    boolean;
  loading:   boolean;
  error:     string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NewsDashboard() {
  const [feed, setFeed] = useState<FeedState>({
    articles: [], fetchedAt: null, isMock: true, loading: true, error: null,
  });

  const [topic,  setTopic]  = useState<TopicFilter>("all");
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);
  const PAGE_SIZE = 12;

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchArticles = useCallback(async () => {
    setFeed(f => ({ ...f, loading: true, error: null }));
    try {
      const res = await fetch("/api/news?limit=60");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setFeed({ articles: data.articles, fetchedAt: data.fetchedAt, isMock: data.isMock, loading: false, error: null });
    } catch (e) {
      setFeed(f => ({ ...f, loading: false, error: "Failed to load news. Please try again." }));
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  // ── Filtering ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = feed.articles;
    if (topic !== "all") list = list.filter(a => a.topic === topic);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      );
    }
    return list;
  }, [feed.articles, topic, search]);

  // Reset page on filter change
  useEffect(() => setPage(1), [topic, search]);

  const paginated  = filtered.slice(0, page * PAGE_SIZE);
  const hasMore    = paginated.length < filtered.length;

  // ── Topic counts ──────────────────────────────────────────────────────
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { all: feed.articles.length };
    for (const t of NEWS_TOPICS) {
      counts[t] = feed.articles.filter(a => a.topic === t).length;
    }
    return counts;
  }, [feed.articles]);

  // ── Featured = first article of current filter ─────────────────────
  const [featured, ...rest] = paginated;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Mock data banner */}
      {!feed.loading && feed.isMock && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300/80">
          <Rss className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <span className="font-medium text-amber-300">Using mock data.</span>{" "}
            Set <code className="rounded bg-amber-500/10 px-1 text-xs">ENABLE_RSS=true</code> in{" "}
            <code className="rounded bg-amber-500/10 px-1 text-xs">.env.local</code> to pull live articles from RSS feeds.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={fetchArticles}
          disabled={feed.loading}
          className="gap-1.5 ml-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${feed.loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Topic filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setTopic("all")}
          className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
            topic === "all"
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
          }`}
        >
          All · {topicCounts.all}
        </button>
        {NEWS_TOPICS.map(t => {
          const meta  = TOPIC_META[t];
          const count = topicCounts[t] ?? 0;
          return (
            <button
              key={t}
              onClick={() => setTopic(prev => prev === t ? "all" : t)}
              className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
                topic === t
                  ? `${meta.badgeClass} border-current`
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              {meta.label} · {count}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {feed.error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-destructive/70" />
          <p className="text-muted-foreground">{feed.error}</p>
          <Button variant="outline" size="sm" onClick={fetchArticles}>Try again</Button>
        </div>
      )}

      {/* Loading skeletons */}
      {feed.loading && !feed.error && (
        <div className="flex flex-col gap-4">
          <NewsCardSkeleton featured />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!feed.loading && !feed.error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="text-muted-foreground">No articles match your filters.</p>
          <button
            onClick={() => { setTopic("all"); setSearch(""); }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Feed */}
      {!feed.loading && !feed.error && filtered.length > 0 && (
        <>
          {/* Featured article */}
          {featured && <NewsCard article={featured} featured />}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setPage(p => p + 1)}>
                Load more articles
              </Button>
            </div>
          )}

          {/* Footer */}
          {feed.fetchedAt && (
            <p className="text-center text-xs text-muted-foreground/50">
              Last refreshed {new Date(feed.fetchedAt).toLocaleTimeString()} · {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
