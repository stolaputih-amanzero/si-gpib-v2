export function ProjectionSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1220] p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-20 bg-slate-900 rounded-2xl border border-slate-800" />
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
      {/* Chart Canvas Skeleton */}
      <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
    </div>
  );
}
