import { useEventSubscription } from "@ops/shared"
import { useQueryClient } from "@tanstack/react-query"
import { Eye, Shield, UserCheck, Users } from "lucide-react"
import { ActivityLog } from "../components/ActivityLog"
import SimpleChart from "../components/SimpleChart"
import { StatsCard } from "../components/StatsCard"
import { useActivity } from "../hooks/useActivity"
import { useStats } from "../hooks/useStats"

export default function Dashboard() {
  const queryClient = useQueryClient()
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: activityData, isLoading: activityLoading, page, setPage } = useActivity()

  useEventSubscription("member:added", () => {
    queryClient.invalidateQueries({ queryKey: ["stats"] })
    queryClient.invalidateQueries({ queryKey: ["activity"] })
  })

  useEventSubscription("member:removed", () => {
    queryClient.invalidateQueries({ queryKey: ["stats"] })
    queryClient.invalidateQueries({ queryKey: ["activity"] })
  })

  return (
    <div className="min-h-full bg-muted/30 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of team activity</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard label="Total" value={stats?.totalMembers} isLoading={statsLoading} icon={Users} />
        <StatsCard label="Active" value={stats?.activeMembers} isLoading={statsLoading} icon={UserCheck} variant="success" />
        <StatsCard label="Admins" value={stats?.adminCount} isLoading={statsLoading} icon={Shield} />
        <StatsCard label="Members" value={stats?.memberCount} isLoading={statsLoading} icon={Users} />
        <StatsCard label="Viewers" value={stats?.viewerCount} isLoading={statsLoading} icon={Eye} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityLog
          items={activityData?.data ?? []}
          meta={activityData?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 }}
          page={page}
          onPageChange={setPage}
          isLoading={activityLoading}
        />

        {stats && activityData ? (
          <SimpleChart stats={stats} activity={activityData.data} />
        ) : (
          <div className="h-full min-h-64 animate-pulse rounded-xl border bg-muted" />
        )}
      </div>
    </div>
  )
}
