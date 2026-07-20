import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <Skeleton variant="text" className="h-8 w-1/2 mb-2" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Skeleton variant="card" className="h-28" />
        <Skeleton variant="card" className="h-28" />
      </div>

      <div className="space-y-4 mt-8">
        <Skeleton variant="text" className="h-6 w-1/3" />
        <div className="space-y-3">
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
        </div>
      </div>
    </div>
  )
}
