"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import {
  Plus,
  Instagram,
  CalendarClock,
  FileText,
  CheckCircle2,
  Archive,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Wifi,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/instagram/post-card";
import { PostFormDialog } from "@/components/instagram/post-form-dialog";
import { ProfileStats } from "@/components/instagram/profile-stats";
import { LiveFeed } from "@/components/instagram/live-feed";
import { Post, PostStatus } from "@/types/instagram";
import { SEED_POSTS } from "@/lib/seed-posts";
import { cn } from "@/lib/utils";

// ─── State management ──────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; post: Post }
  | { type: "UPDATE"; post: Post }
  | { type: "DELETE"; id: string }
  | { type: "SET_STATUS"; id: string; status: PostStatus }
  | { type: "LOAD"; posts: Post[] };

function postsReducer(state: Post[], action: Action): Post[] {
  switch (action.type) {
    case "ADD":
      return [action.post, ...state];
    case "UPDATE":
      return state.map((p) => (p.id === action.post.id ? action.post : p));
    case "DELETE":
      return state.filter((p) => p.id !== action.id);
    case "SET_STATUS":
      return state.map((p) =>
        p.id === action.id ? { ...p, status: action.status } : p
      );
    case "LOAD":
      return action.posts;
    default:
      return state;
  }
}

const STORAGE_KEY = "cms-instagram-posts";

// ─── Tab config ─────────────────────────────────────────────────────────────

const TABS: {
  value: PostStatus;
  label: string;
  icon: React.ElementType;
  emptyTitle: string;
  emptyDesc: string;
}[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    icon: CalendarClock,
    emptyTitle: "No scheduled posts",
    emptyDesc: "Posts set with a future publish date will appear here.",
  },
  {
    value: "draft",
    label: "Drafts",
    icon: FileText,
    emptyTitle: "No drafts yet",
    emptyDesc: "Work-in-progress posts live here until they're ready.",
  },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2,
    emptyTitle: "Nothing published yet",
    emptyDesc: "Posts you've marked as published will show up here.",
  },
  {
    value: "backlog",
    label: "Backlog",
    icon: Archive,
    emptyTitle: "Backlog is empty",
    emptyDesc: "Park future ideas and campaigns here for later.",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function InstagramDashboard() {
  const [posts, dispatch] = useReducer(postsReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PostStatus | "live">("scheduled");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Hydrate from localStorage (or seed) ─────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "LOAD", posts: JSON.parse(stored) });
      } else {
        dispatch({ type: "LOAD", posts: SEED_POSTS });
      }
    } catch {
      dispatch({ type: "LOAD", posts: SEED_POSTS });
    }
    setHydrated(true);
  }, []);

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }
  }, [posts, hydrated]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    (post: Post) => {
      if (editPost) {
        dispatch({ type: "UPDATE", post });
      } else {
        dispatch({ type: "ADD", post });
      }
      setEditPost(null);
    },
    [editPost]
  );

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const handleStatusChange = useCallback((id: string, status: PostStatus) => {
    dispatch({ type: "SET_STATUS", id, status });
    setActiveTab(status);
  }, []);

  const handleEdit = useCallback((post: Post) => {
    setEditPost(post);
    setDialogOpen(true);
  }, []);

  const openNewPost = () => {
    setEditPost(null);
    setDialogOpen(true);
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const counts = TABS.reduce(
    (acc, t) => ({
      ...acc,
      [t.value]: posts.filter((p) => p.status === t.value).length,
    }),
    {} as Record<PostStatus, number>
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.status === (activeTab === "live" ? "published" : activeTab) &&
      (search === "" ||
        p.caption.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
        (p.mediaNote ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  // Sort: scheduled by date asc, others by createdAt desc
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === "scheduled" && a.scheduledDate && b.scheduledDate) {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPosts = posts.length;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/20">
            <Instagram className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Instagram Manager
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-sm text-pink-400 font-medium">@_Trippygrippy_</span>
              <span className="text-muted-foreground/40 text-sm">·</span>
              <span className="text-sm text-muted-foreground">
                {totalPosts} post{totalPosts !== 1 ? "s" : ""} across all stages
              </span>
            </div>
          </div>
        </div>
        <Button onClick={openNewPost} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* ── Live profile stats ────────────────────────────────────────── */}
      <ProfileStats />

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:border-border/60 hover:bg-card/80"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div>
                <p
                  className={cn(
                    "text-xl font-bold tabular-nums",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {counts[tab.value]}
                </p>
                <p className="text-xs text-muted-foreground">{tab.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as PostStatus | "live")}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs font-medium tabular-nums">
                    {counts[tab.value]}
                  </span>
                </TabsTrigger>
              );
            })}
            <TabsTrigger value="live" className="gap-1.5">
              <Wifi className="h-3.5 w-3.5" />
              Live Posts
            </TabsTrigger>
          </TabsList>

          {/* Search + view toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts…"
                className="w-52 pl-8 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center rounded-md border border-border p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {!hydrated ? (
              // Loading skeleton
              <div
                className={cn(
                  "gap-4",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col"
                )}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-52 animate-pulse rounded-xl border border-border bg-card"
                  />
                ))}
              </div>
            ) : sortedPosts.length === 0 ? (
              <EmptyState
                title={search ? "No results found" : tab.emptyTitle}
                description={
                  search
                    ? `No posts matched "${search}". Try a different search term.`
                    : tab.emptyDesc
                }
                icon={tab.icon}
                onAdd={search ? undefined : openNewPost}
              />
            ) : (
              <div
                className={cn(
                  "gap-4",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col"
                )}
              >
                {sortedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}

        {/* Live Posts tab */}
        <TabsContent value="live">
          <LiveFeed />
        </TabsContent>
      </Tabs>

      {/* ── Dialog ─────────────────────────────────────────────────────── */}
      <PostFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditPost(null);
        }}
        onSave={handleSave}
        editPost={editPost}
      />
    </>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({
  title,
  description,
  icon: Icon,
  onAdd,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {onAdd && (
        <Button onClick={onAdd} variant="outline" className="mt-6">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Post
        </Button>
      )}
    </div>
  );
}
