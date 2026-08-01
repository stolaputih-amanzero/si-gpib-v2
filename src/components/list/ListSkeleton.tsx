'use client';

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-line-hairline animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-4 py-4 min-h-[76px]">
          {/* Chip Icon Skeleton (44x44px) */}
          <div className="h-11 w-11 rounded-xl bg-surface-sunken shrink-0 skeleton" />

          {/* Text Lines Skeleton */}
          <div className="flex-1 space-y-2 py-0.5">
            <div className="h-4 bg-surface-sunken rounded w-3/5 skeleton" />
            <div className="h-3 bg-surface-sunken rounded w-2/5 skeleton" />
            <div className="h-3 bg-surface-sunken rounded w-1/4 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
