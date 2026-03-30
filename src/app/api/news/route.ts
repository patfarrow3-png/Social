/**
 * GET /api/news
 *
 * Query params:
 *   topic   - filter by NewsTopic (optional)
 *   q       - keyword search (optional)
 *   limit   - max articles (default 40)
 *
 * Returns NewsResponse.
 *
 * Live RSS fetching is enabled when ENABLE_RSS=true is set in .env.local.
 * Each feed source is fetched with a 5-second timeout and failed feeds are
 * skipped gracefully — the remaining articles are still returned.
 *
 * Without ENABLE_RSS, the deterministic mock dataset is returned instantly.
 *
 * RSS feed sources are defined in src/lib/mock-news-data.ts so you can
 * add / remove publications without touching this route.
 */

import { NextRequest, NextResponse } from "next/server";
import { MOCK_ARTICLES, RSS_SOURCES } from "@/lib/mock-news-data";
import { classifyTopic } from "@/types/news";
import type { NewsArticle, NewsResponse } from "@/types/news";

// ─── XML helpers ─────────────────────────────────────────────────────────────

/** Extract inner text of the first matching XML tag */
function tag(xml: string, name: string): string {
  // Try CDATA first, then plain text, then attribute
  const cdata = xml.match(new RegExp(`<${name}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, "i"));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  if (plain) return plain[1].trim().replace(/<[^>]+>/g, ""); // strip inner HTML
  return "";
}

/** Strip HTML tags and decode common entities */
function clean(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#038;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull first <item> blocks out of an RSS feed string */
function parseItems(xml: string, sourceName: string, sourceUrl: string): NewsArticle[] {
  const items = [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)];
  return items.slice(0, 10).map((m, i) => {
    const block   = m[1];
    const title   = clean(tag(block, "title"));
    const link    = clean(tag(block, "link")) || clean(tag(block, "guid"));
    const desc    = clean(tag(block, "description")) || clean(tag(block, "summary")) || clean(tag(block, "content:encoded"));
    const pubDate = tag(block, "pubDate") || tag(block, "published") || tag(block, "dc:date");
    const summary = desc.slice(0, 240) + (desc.length > 240 ? "…" : "");

    // Try to pull image from media:content or enclosure
    const imgMatch = block.match(/(?:media:content|enclosure)[^>]+url="([^"]+)"/i);
    const imageUrl = imgMatch?.[1];

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const topic = classifyTopic(title + " " + summary);

    return {
      id:          `${sourceName}-${i}-${Date.now()}`,
      title,
      summary,
      url:         link,
      source:      sourceName,
      sourceUrl,
      publishedAt,
      topic,
      imageUrl,
    } satisfies NewsArticle;
  }).filter(a => a.title && a.url);
}

// ─── Live RSS fetcher ─────────────────────────────────────────────────────────

async function fetchFeed(url: string, name: string, siteUrl: string): Promise<NewsArticle[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SocialCMS/1.0 (+https://github.com)" },
      next: { revalidate: 300 }, // 5-min edge cache
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseItems(xml, name, siteUrl);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const topic  = searchParams.get("topic") ?? undefined;
  const q      = searchParams.get("q")?.toLowerCase() ?? undefined;
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "40", 10), 80);

  const liveMode = process.env.ENABLE_RSS === "true";

  let articles: NewsArticle[];
  let isMock = true;

  if (liveMode) {
    const results = await Promise.allSettled(
      RSS_SOURCES.map(s => fetchFeed(s.url, s.name, s.siteUrl))
    );
    const all = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
    articles = all.length > 0 ? all : MOCK_ARTICLES;
    isMock   = all.length === 0;
  } else {
    articles = MOCK_ARTICLES;
  }

  // Sort newest first
  articles = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Apply filters
  if (topic && topic !== "all") {
    articles = articles.filter(a => a.topic === topic);
  }
  if (q) {
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q)
    );
  }

  articles = articles.slice(0, limit);

  const body: NewsResponse = {
    articles,
    fetchedAt: new Date().toISOString(),
    isMock,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": liveMode ? "public, s-maxage=300, stale-while-revalidate=60" : "no-store",
    },
  });
}
