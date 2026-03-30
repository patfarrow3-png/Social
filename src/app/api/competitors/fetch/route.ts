/**
 * POST /api/competitors/fetch
 *
 * Body: { handle: string; platform: string; competitorName: string }
 *
 * Returns a CompetitorProfile, either from a live platform API (when credentials
 * are present) or from the deterministic mock generator.
 *
 * To wire up real data, add the relevant env vars and implement the
 * fetchLiveProfile() branches below:
 *
 *   INSTAGRAM_ACCESS_TOKEN   — Instagram Graph API (business account)
 *   YOUTUBE_API_KEY          — YouTube Data API v3 (free 10,000 req/day)
 *   TWITTER_BEARER_TOKEN     — Twitter/X API v2 Basic
 *   TIKTOK_CLIENT_KEY        — TikTok Research API
 *   FACEBOOK_ACCESS_TOKEN    — Facebook Graph API (page token)
 *   LINKEDIN_ACCESS_TOKEN    — LinkedIn Marketing API
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCompetitorProfile } from "@/lib/mock-competitor-data";
import type { CompetitorPlatform } from "@/types/competitors";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.handle || !body?.platform || !body?.competitorName) {
    return NextResponse.json(
      { error: "handle, platform, and competitorName are required" },
      { status: 400 }
    );
  }

  const { handle, platform, competitorName } = body as {
    handle:         string;
    platform:       CompetitorPlatform;
    competitorName: string;
  };

  const validPlatforms: CompetitorPlatform[] = [
    "instagram", "youtube", "tiktok", "twitter", "facebook", "linkedin",
  ];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  // Simulate network latency so the loading state is visible
  await new Promise((r) => setTimeout(r, 900));

  // In production: check for platform-specific env vars and call the real API.
  // Fall back (or always use) the mock generator.
  const profile = generateCompetitorProfile(handle, platform, competitorName);

  return NextResponse.json(profile, {
    headers: { "Cache-Control": "no-store" },
  });
}
