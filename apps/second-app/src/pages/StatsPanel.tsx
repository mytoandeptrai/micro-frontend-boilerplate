import { useEventSubscription } from "@ops/shared-core"
import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"
import { useRef, useState } from "react"
import { useStore } from "shell/store"

interface Stats {
  total: number
  completed: number
  pending: number
}

export default function StatsPanel() {
  const user = useStore.use.user()
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 })
  // Tracks completed state per task so task:removed can decrement the right counter —
  // the event payload itself only carries taskId, not whether it was completed.
  const completedByTaskId = useRef(new Map<string, boolean>())

  useEventSubscription("task:added", ({ task }) => {
    completedByTaskId.current.set(task.id, task.completed)
    setStats((prev) => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }))
  })

  useEventSubscription("task:completed", ({ taskId, completed }) => {
    completedByTaskId.current.set(taskId, completed)
    setStats((prev) => ({
      ...prev,
      completed: prev.completed + (completed ? 1 : -1),
      pending: prev.pending + (completed ? -1 : 1),
    }))
  })

  useEventSubscription("task:removed", ({ taskId }) => {
    const wasCompleted = completedByTaskId.current.get(taskId) ?? false
    completedByTaskId.current.delete(taskId)
    setStats((prev) => ({
      total: prev.total - 1,
      completed: prev.completed - (wasCompleted ? 1 : 0),
      pending: prev.pending - (wasCompleted ? 0 : 1),
    }))
  })

  const cards = [
    { label: "Total Tasks", value: stats.total },
    { label: "Completed", value: stats.completed },
    { label: "Pending", value: stats.pending },
  ]

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Stats{user ? ` — ${user.name}` : ""}</h1>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {cards.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
