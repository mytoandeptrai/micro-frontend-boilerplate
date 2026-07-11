import { useMemo } from "react"

import { computeStats } from "../lib/taskStats"
import { useTasks } from "./useTasks"

export function useTaskStatistics() {
  const tasksQuery = useTasks()

  const stats = useMemo(() => computeStats(tasksQuery.data ?? []), [tasksQuery.data])

  return {
    stats,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
  }
}
