import { SkeletonList } from "@/components/mobile/SkeletonList"

export default function PosPelkesLoading() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <SkeletonList count={5} />
      </div>
    </div>
  )
}
