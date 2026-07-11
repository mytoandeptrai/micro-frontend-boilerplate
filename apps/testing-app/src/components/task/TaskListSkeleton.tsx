import { Skeleton } from "@ops/ui/components/skeleton"

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4"] as const

export default function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {SKELETON_ROWS.map((rowId) => (
        <Skeleton key={rowId} className="h-16 w-full" />
      ))}
    </div>
  )
}
