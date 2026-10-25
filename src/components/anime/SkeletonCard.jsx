export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card/40">
      <div className="aspect-[2/3] animate-pulse bg-gradient-to-br from-muted via-card to-muted" />
      <div className="space-y-2 p-2.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-muted/70" />
      </div>
    </div>
  );
}

================================================================================
