export function ProjectionSkeleton() {
  return (
    <div className="min-h-screen bg-surface-base p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-20 bg-surface-1 rounded-2xl border border-border-subtle" />
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-32 bg-surface-1 rounded-2xl border border-border-subtle" />
        <div className="h-32 bg-surface-1 rounded-2xl border border-border-subtle" />
        <div className="h-32 bg-surface-1 rounded-2xl border border-border-subtle" />
      </div>
      {/* Chart Canvas Skeleton */}
      <div className="h-64 bg-surface-1 rounded-2xl border border-border-subtle" />
    </div>
  );
}
