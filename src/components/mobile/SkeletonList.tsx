import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-surface-elevated rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
          <Skeleton variant="avatar" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
            <Skeleton variant="text" className="h-3 w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
