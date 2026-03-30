"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CompetitorProfile, CompetitorPlatform } from "@/types/competitors";
import { COMPETITOR_PLATFORMS, PLATFORM_META } from "@/types/competitors";

interface AddCompetitorDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  onAdd:        (profile: CompetitorProfile) => void;
  existingNames: string[];
}

const BLANK = { competitorName: "", platform: "instagram" as CompetitorPlatform, handle: "", notes: "" };

export function AddCompetitorDialog({
  open, onOpenChange, onAdd, existingNames,
}: AddCompetitorDialogProps) {
  const [form, setForm]       = useState(BLANK);
  const [errors, setErrors]   = useState<Partial<typeof BLANK>>({});
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) { setForm(BLANK); setErrors({}); }
  }, [open]);

  function setField<K extends keyof typeof BLANK>(k: K, v: typeof BLANK[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function validate() {
    const e: Partial<typeof BLANK> = {};
    if (!form.competitorName.trim()) e.competitorName = "Name is required.";
    if (!form.handle.trim())         e.handle         = "Handle is required.";
    return e;
  }

  async function handleAdd() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setFetching(true);
    try {
      const res = await fetch("/api/competitors/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle:         form.handle.replace(/^@/, ""),
          platform:       form.platform,
          competitorName: form.competitorName.trim(),
        }),
      });
      if (!res.ok) throw new Error("Fetch failed");
      const profile: CompetitorProfile = await res.json();
      if (form.notes.trim()) profile.notes = form.notes.trim();
      onAdd(profile);
      onOpenChange(false);
    } catch {
      setErrors(e => ({ ...e, handle: "Could not fetch data. Please try again." }));
    } finally {
      setFetching(false);
    }
  }

  const meta = PLATFORM_META[form.platform];

  return (
    <Dialog open={open} onOpenChange={fetching ? undefined : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
          <DialogDescription>
            Track a competitor's public profile. You can add multiple platform
            accounts for the same competitor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-2">
          {/* Competitor name */}
          <div className="space-y-1.5">
            <Label htmlFor="cmp-name">
              Competitor name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cmp-name"
              placeholder="e.g. Nike"
              value={form.competitorName}
              onChange={e => setField("competitorName", e.target.value)}
              list="existing-names"
            />
            {/* Autocomplete from existing names */}
            <datalist id="existing-names">
              {existingNames.map(n => <option key={n} value={n} />)}
            </datalist>
            {errors.competitorName && (
              <p className="text-xs text-destructive">{errors.competitorName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use the same name to group multiple platform accounts together.
            </p>
          </div>

          {/* Platform + Handle row */}
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={v => setField("platform", v as CompetitorPlatform)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPETITOR_PLATFORMS.map(p => (
                    <SelectItem key={p} value={p}>{PLATFORM_META[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cmp-handle">
                Handle <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cmp-handle"
                placeholder={meta.handlePrefix
                  ? `${meta.handlePrefix}username`
                  : "Channel / page name"}
                value={form.handle}
                onChange={e => setField("handle", e.target.value)}
              />
              {errors.handle && (
                <p className="text-xs text-destructive">{errors.handle}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cmp-notes">Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input
              id="cmp-notes"
              placeholder="e.g. Direct competitor in the mid-market segment"
              value={form.notes}
              onChange={e => setField("notes", e.target.value)}
            />
          </div>

          {/* Mock data notice */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2.5 text-xs text-amber-400/80">
            <span className="font-medium text-amber-300">Using mock data.</span>{" "}
            Add platform API credentials in <code className="rounded bg-amber-500/10 px-1">.env.local</code> to pull live data.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={fetching}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={fetching}>
            {fetching ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Fetching data…</>
            ) : (
              <><Plus className="mr-1.5 h-4 w-4" />Add &amp; Fetch Data</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
