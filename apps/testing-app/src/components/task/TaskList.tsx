import { useFilteredTasks } from "../../hooks/useFilteredTasks"
import { useTaskFilters } from "../../hooks/useTaskFilters"
import TaskEmptyState from "./TaskEmptyState"
import TaskErrorState from "./TaskErrorState"
import TaskItem from "./TaskItem"
import TaskListSkeleton from "./TaskListSkeleton"

export default function TaskList() {
  const { tasks, isLoading, isError, error, refetch } = useFilteredTasks()
  const { keyword, status, priority } = useTaskFilters()

  const hasActiveFilters = keyword.trim() !== "" || status !== "all" || priority !== "all"

  if (isLoading) return <TaskListSkeleton />
  if (isError) return <TaskErrorState message={error?.message} onRetry={() => refetch()} />
  if (tasks.length === 0) return <TaskEmptyState hasActiveFilters={hasActiveFilters} />

  return (
    <ul className="flex flex-col">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
