export type PostType = "photo" | "video" | "reel" | "carousel" | "story";
export type PostStatus = "scheduled" | "draft" | "published" | "backlog";

export interface Post {
  id: string;
  caption: string;
  postType: PostType;
  status: PostStatus;
  scheduledDate?: string; // ISO date string, only relevant when status === "scheduled"
  mediaNote?: string;     // description of the planned media asset
  tags: string[];
  createdAt: string;      // ISO date string
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  photo: "Photo",
  video: "Video",
  reel: "Reel",
  carousel: "Carousel",
  story: "Story",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  scheduled: "Scheduled",
  draft: "Draft",
  published: "Published",
  backlog: "Backlog",
};

export const POST_TYPE_COLORS: Record<PostType, string> = {
  photo: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  video: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  reel: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  carousel: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  story: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  scheduled: "bg-blue-500/15 text-blue-400",
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-400",
  backlog: "bg-amber-500/15 text-amber-400",
};
