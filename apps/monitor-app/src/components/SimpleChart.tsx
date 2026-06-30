import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ActivityItem } from "../hooks/useActivity"
import type { StatsData } from "../hooks/useStats"

interface SimpleChartProps {
  stats: StatsData
  activity: ActivityItem[]
}

function buildActivityByDay(items: ActivityItem[]) {
  const counts: Record<string, number> = {}
  for (const item of items) {
    const day = item.createdAt.slice(0, 10)
    counts[day] = (counts[day] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

export default function SimpleChart({ stats, activity }: SimpleChartProps) {
  const roleData = [
    { name: "Admin", value: stats.adminCount },
    { name: "Member", value: stats.memberCount },
    { name: "Viewer", value: stats.viewerCount },
  ]

  const activityByDay = buildActivityByDay(activity)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roleData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Activity by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={activityByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                cursor={{ stroke: "hsl(var(--muted-foreground))" }}
              />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
