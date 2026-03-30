// ─── Instagram Graph API response types ──────────────────────────────────────
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api

export type IGMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";

export interface IGProfile {
  id:                  string;
  username:            string;
  name:                string;
  biography:           string;
  followers_count:     number;
  follows_count:       number;
  media_count:         number;
  profile_picture_url: string;
  website:             string;
}

export interface IGMedia {
  id:             string;
  caption?:       string;
  media_type:     IGMediaType;
  media_url?:     string;
  thumbnail_url?: string;
  permalink:      string;
  timestamp:      string;
  like_count:     number;
  comments_count: number;
}

export interface IGMediaPage {
  data:   IGMedia[];
  paging?: {
    cursors?: { before: string; after: string };
    next?:    string;
  };
}

// ─── API response shapes returned by our internal routes ─────────────────────

export interface ProfileResponse {
  profile:  IGProfile | null;
  isMock:   boolean;
  error?:   string;
}

export interface MediaResponse {
  posts:     IGMedia[];
  isMock:    boolean;
  fetchedAt: string;
  error?:    string;
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

export const MOCK_PROFILE: IGProfile = {
  id:                  "17841400000000000",
  username:            "_trippygrippy_",
  name:                "Trippy Grippy",
  biography:           "Visual artist · Digital creator · Sharing the journey ✨",
  followers_count:     0,
  follows_count:       0,
  media_count:         0,
  profile_picture_url: "",
  website:             "https://www.instagram.com/_trippygrippy_/",
};

export const MOCK_MEDIA: IGMedia[] = [];
