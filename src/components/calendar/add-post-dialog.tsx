"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { CalendarPost, CalendarPlatform, CalendarPostType, CalendarPostStatus } from "@/types/calendar";
import { PLATFORM_ORDER, PLATFORM_CONFIG, POST_TYPE_LABELS } from "@/types/calendar";

// ─── Types per platform ───────────────────────────────────────────────────────

const PLATFORM_POST_TYPES: Record<CalendarPlatform, CalendarPostType[]> = {
  instagram: ["photo", "video", "reel", "carousel", "story"],
  youtube:   ["video", "short"],
  facebook:  ["photo", "video"],
  twitter:   ["thread"],
  tiktok:    ["short", "video"],
  linkedin:  ["article", "photo", "video"],
};

// ─── Blank form ───────────────────────────────────────────────────────────────

const BLANK: FormState = {
  title:    "",
  caption:  "",
  platform: "instagram",
  postType: "photo",
  status:   "scheduled",
  date:     "",
  time:     "10:00",
  tags:     "",
  mediaNote:"",
};

interface FormState {
  title:     string;
  caption:   string;
  platform:  CalendarPlatform;
  postType:  CalendarPostType;
  status:    CalendarPostStatus;
  date:      string;
  time:      string;
  tags:      string;
  mediaNote: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AddCalendarPostDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  onSave:        (post: CalendarPost) => void;
  prefillDate?:  Date | null;
}

export function AddCalendarPostDialog({
  open,
  onOpenChange,
  onSave,
  prefillDate,
}: AddCalendarPostDialogProps) {
  const [form, setForm] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Reset + prefill when dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        ...BLANK,
        date: prefillDate ? format(prefillDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      });
      setErrors({});
    }
  }, [open, prefillDate]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.title.trim())   errs.title   = "Title is required.";
    if (!form.caption.trim()) errs.caption = "Caption is required.";
    if (!form.date)           errs.date    = "Date is required.";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);

    onSave({
      id:        crypto.randomUUID(),
      title:     form.title.trim(),
      caption:   form.caption.trim(),
      platform:  form.platform,
      postType:  form.postType,
      status:    form.status,
      date:      form.date,
      time:      form.time || undefined,
      tags,
      mediaNote: form.mediaNote.trim() || undefined,
    });
    onOpenChange(false);
  }

  const availableTypes = PLATFORM_POST_TYPES[form.platform];

  // Reset post type when platform changes if current type is unavailable
  function handlePlatformChange(p: CalendarPlatform) {
    const types = PLATFORM_POST_TYPES[p];
    setForm((f) => ({
      ...f,
      platform: p,
      postType: types.includes(f.postType) ? f.postType : types[0],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Calendar</DialogTitle>
          <DialogDescription>
            Schedule a new post on the content calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="cal-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cal-title"
              placeholder="Short chip label, e.g. Spring launch teaser"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <Label htmlFor="cal-caption">
              Caption <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cal-caption"
              placeholder="Write your post copy here…"
              className="min-h-[100px]"
              value={form.caption}
              onChange={(e) => setField("caption", e.target.value)}
            />
            {errors.caption && <p className="text-xs text-destructive">{errors.caption}</p>}
          </div>

          {/* Platform + Post Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => handlePlatformChange(v as CalendarPlatform)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORM_ORDER.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PLATFORM_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Post Type</Label>
              <Select
                value={form.postType}
                onValueChange={(v) => setField("postType", v as CalendarPostType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableTypes.map((t) => (
                    <SelectItem key={t} value={t}>{POST_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setField("status", v as CalendarPostStatus)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cal-date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cal-date"
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cal-time">Time</Label>
              <Input
                id="cal-time"
                type="time"
                value={form.time}
                onChange={(e) => setField("time", e.target.value)}
              />
            </div>
          </div>

          {/* Media Note */}
          <div className="space-y-1.5">
            <Label htmlFor="cal-media">Media Note</Label>
            <Input
              id="cal-media"
              placeholder="Brief description of the planned asset"
              value={form.mediaNote}
              onChange={(e) => setField("mediaNote", e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="cal-tags">Tags</Label>
            <Input
              id="cal-tags"
              placeholder="launch, spring, product"
              value={form.tags}
              onChange={(e) => setField("tags", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated. # prefix optional.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
