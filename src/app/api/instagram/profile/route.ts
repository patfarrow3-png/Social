/**
 * GET /api/instagram/profile
 *
 * Fetches the connected Instagram account's public profile using the
 * Instagram Graph API.
 *
 * Required env vars:
 *   INSTAGRAM_ACCESS_TOKEN  — long-lived user access token
 *
 * When the token is absent, returns mock profile data so the UI
 * degrades gracefully during development.
 *
 * Setup guide: see .env.local.example
 */

import { NextResponse } from "next/server";
import type { ProfileResponse } from "@/types/instagram-api";
import { MOCK_PROFILE } from "@/types/instagram-api";

const GRAPH = "https://graph.instagram.com/v21.0";
const FIELDS = "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website";

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json<ProfileResponse>(
      { profile: MOCK_PROFILE, isMock: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const res = await fetch(
      `${GRAPH}/me?fields=${FIELDS}&access_token=${token}`,
      { next: { revalidate: 300 } } // 5-min edge cache
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message ?? `HTTP ${res.status}`;
      return NextResponse.json<ProfileResponse>(
        { profile: MOCK_PROFILE, isMock: true, error: msg },
        { status: 200 }
      );
    }

    const profile = await res.json();
    return NextResponse.json<ProfileResponse>(
      { profile, isMock: false },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json<ProfileResponse>(
      { profile: MOCK_PROFILE, isMock: true, error: msg },
      { status: 200 }
    );
  }
}
