export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="flex gap-5 rounded-xl border border-border bg-card p-5 animate-pulse">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex gap-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="h-5 w-4/5 rounded bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-full rounded bg-muted" />
            <div className="h-3.5 w-5/6 rounded bg-muted" />
            <div className="h-3.5 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-14 rounded bg-muted" />
        <div className="h-3.5 w-10 rounded bg-muted" />
      </div>
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-4/5 rounded bg-muted" />
      <div className="space-y-1.5 pt-1">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
      <div className="h-3 w-24 rounded bg-muted mt-auto" />
    </div>
  );
}
