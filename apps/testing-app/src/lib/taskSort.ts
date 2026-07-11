import type { Task } from "../types/task"

export type TaskSortField = "createdAt" | "deadline"
export type TaskSortDirection = "asc" | "desc"

/**
 * Tasks without the sorted field (e.g. no deadline) are pushed to the end,
 * regardless of direction.
 */
export function sortTasks(
  tasks: Task[],
  field: TaskSortField,
  direction: TaskSortDirection = "asc",
): Task[] {
  const withValue: Task[] = []
  const withoutValue: Task[] = []

  for (const task of tasks) {
    if (task[field]) withValue.push(task)
    else withoutValue.push(task)
  }

  withValue.sort((a, b) => {
    const diff = new Date(a[field] as string).getTime() - new Date(b[field] as string).getTime()
    return direction === "asc" ? diff : -diff
  })

  return [...withValue, ...withoutValue]
}
