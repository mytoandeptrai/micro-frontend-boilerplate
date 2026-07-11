import { useMemo } from "react"

import { filterTasks } from "../lib/taskFilters"
import { sortTasks } from "../lib/taskSort"
import { useTaskFilters } from "./useTaskFilters"
import { useTasks } from "./useTasks"

export function useFilteredTasks() {
  const tasksQuery = useTasks()
  const { keyword, status, priority, sortField, sortDirection } = useTaskFilters()

  const tasks = useMemo(() => {
    const filtered = filterTasks(tasksQuery.data ?? [], { keyword, status, priority })
    return sortTasks(filtered, sortField, sortDirection)
  }, [tasksQuery.data, keyword, status, priority, sortField, sortDirection])

  return {
    tasks,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
  }
}
