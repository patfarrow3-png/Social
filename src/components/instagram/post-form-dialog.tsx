"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Post,
  PostType,
  PostStatus,
  POST_TYPE_LABELS,
  POST_STATUS_LABELS,
} from "@/types/instagram";

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (post: Post) => void;
  editPost?: Post | null;
}

const BLANK_FORM = {
  caption: "",
  postType: "photo" as PostType,
  status: "draft" as PostStatus,
  scheduledDate: "",
  mediaNote: "",
  tags: "",
};

export function PostFormDialog({
  open,
  onOpenChange,
  onSave,
  editPost,
}: PostFormDialogProps) {
  const [form, setForm] = useState(BLANK_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof BLANK_FORM, string>>>({});

  // Populate form when editing
  useEffect(() => {
    if (editPost) {
      setForm({
        caption: editPost.caption,
        postType: editPost.postType,
        status: editPost.status,
        scheduledDate: editPost.scheduledDate ?? "",
        mediaNote: editPost.mediaNote ?? "",
        tags: editPost.tags.join(", "),
      });
    } else {
      setForm(BLANK_FORM);
    }
    setErrors({});
  }, [editPost, open]);

  function validate() {
    const next: typeof errors = {};
    if (!form.caption.trim()) next.caption = "Caption is required.";
    if (form.status === "scheduled" && !form.scheduledDate)
      next.scheduledDate = "Scheduled date is required when status is Scheduled.";
    return next;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);

    const post: Post = {
      id: editPost?.id ?? crypto.randomUUID(),
      caption: form.caption.trim(),
      postType: form.postType,
      status: form.status,
      scheduledDate: form.status === "scheduled" ? form.scheduledDate : undefined,
      mediaNote: form.mediaNote.trim() || undefined,
      tags,
      createdAt: editPost?.createdAt ?? new Date().toISOString(),
    };

    onSave(post);
    onOpenChange(false);
  }

  const isEditing = !!editPost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Post" : "New Post Idea"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this post."
              : "Capture a new content idea. Fill in what you know — you can always come back to edit."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-2">
          {/* Caption */}
          <div className="space-y-1.5">
            <Label htmlFor="caption">
              Caption <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="caption"
              placeholder="Write your caption here… #hashtags and emojis welcome 🎉"
              className="min-h-[120px]"
              value={form.caption}
              onChange={(e) => {
                setForm((f) => ({ ...f, caption: e.target.value }));
                if (errors.caption) setErrors((e) => ({ ...e, caption: undefined }));
              }}
            />
            {errors.caption && (
              <p className="text-xs text-destructive">{errors.caption}</p>
            )}
            <p className="text-right text-xs text-muted-foreground">
              {form.caption.length} chars
            </p>
          </div>

          {/* Post Type + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Post Type</Label>
              <Select
                value={form.postType}
                onValueChange={(v) => setForm((f) => ({ ...f, postType: v as PostType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(POST_TYPE_LABELS) as PostType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {POST_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, status: v as PostStatus }));
                  if (v !== "scheduled") setErrors((e) => ({ ...e, scheduledDate: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(POST_STATUS_LABELS) as PostStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {POST_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduled Date — only visible when status = scheduled */}
          {form.status === "scheduled" && (
            <div className="space-y-1.5">
              <Label htmlFor="scheduledDate">
                Scheduled Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => {
                  setForm((f) => ({ ...f, scheduledDate: e.target.value }));
                  if (errors.scheduledDate)
                    setErrors((e) => ({ ...e, scheduledDate: undefined }));
                }}
              />
              {errors.scheduledDate && (
                <p className="text-xs text-destructive">{errors.scheduledDate}</p>
              )}
            </div>
          )}

          {/* Media Note */}
          <div className="space-y-1.5">
            <Label htmlFor="mediaNote">Media Note</Label>
            <Input
              id="mediaNote"
              placeholder="e.g. Studio photo of product on white background"
              value={form.mediaNote}
              onChange={(e) => setForm((f) => ({ ...f, mediaNote: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Brief description of the planned image or video asset.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="launch, product, bts"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated. The # prefix is optional.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? (
              "Save Changes"
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
