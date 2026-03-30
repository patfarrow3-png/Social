/**
 * GET /api/instagram/media?limit=12&after=<cursor>
 *
 * Fetches the connected account's published Instagram posts via the
 * Instagram Graph API.
 *
 * Query params:
 *   limit   — number of posts to return (default 12, max 30)
 *   after   — pagination cursor for the next page
 *
 * Required env vars:
 *   INSTAGRAM_ACCESS_TOKEN  — long-lived user access token
 *
 * Returns mock data when the token is absent.
 */

import { NextRequest, NextResponse } from "next/server";
import type { MediaResponse, IGMediaPage } from "@/types/instagram-api";
import { MOCK_MEDIA } from "@/types/instagram-api";

const GRAPH  = "https://graph.instagram.com/v21.0";
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 30);
  const after = searchParams.get("after") ?? "";
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json<MediaResponse>({
      posts:     MOCK_MEDIA,
      isMock:    true,
      fetchedAt: new Date().toISOString(),
    });
  }

  try {
    const cursor = after ? `&after=${encodeURIComponent(after)}` : "";
    const url = `${GRAPH}/me/media?fields=${FIELDS}&limit=${limit}${cursor}&access_token=${token}`;

    const res = await fetch(url, { next: { revalidate: 180 } }); // 3-min edge cache

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message ?? `HTTP ${res.status}`;
      return NextResponse.json<MediaResponse>({
        posts:     MOCK_MEDIA,
        isMock:    true,
        fetchedAt: new Date().toISOString(),
        error:     msg,
      });
    }

    const page: IGMediaPage = await res.json();

    return NextResponse.json<MediaResponse>(
      {
        posts:     page.data ?? [],
        isMock:    false,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json<MediaResponse>({
      posts:     MOCK_MEDIA,
      isMock:    true,
      fetchedAt: new Date().toISOString(),
      error:     msg,
    });
  }
}
