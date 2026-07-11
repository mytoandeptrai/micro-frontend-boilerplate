import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"

import { useTaskStatistics } from "../../hooks/useTaskStatistics"
import type { TaskStatistics as TaskStatisticsData } from "../../lib/taskStats"

interface StatItem {
  key: keyof TaskStatisticsData
  label: string
}

const STAT_ITEMS: StatItem[] = [
  { key: "total", label: "Total Tasks" },
  { key: "todo", label: "Todo" },
  { key: "inProgress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "highPriority", label: "High Priority" },
]

export default function TaskStatistics() {
  const { stats, isLoading } = useTaskStatistics()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {STAT_ITEMS.map((item) => (
        <Card key={item.key}>
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {isLoading ? "…" : stats[item.key]}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
