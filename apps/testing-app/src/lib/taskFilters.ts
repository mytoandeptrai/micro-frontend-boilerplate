import type { Task, TaskPriority, TaskStatus } from "../types/task"

export function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase()
}

export interface TaskFilterCriteria {
  keyword?: string
  status?: TaskStatus | "all"
  priority?: TaskPriority | "all"
}

export function filterTasks(tasks: Task[], criteria: TaskFilterCriteria): Task[] {
  const keyword = normalizeKeyword(criteria.keyword ?? "")

  return tasks.filter((task) => {
    if (keyword && !task.title.toLowerCase().includes(keyword)) return false
    if (criteria.status && criteria.status !== "all" && task.status !== criteria.status) {
      return false
    }
    if (
      criteria.priority &&
      criteria.priority !== "all" &&
      task.priority !== criteria.priority
    ) {
      return false
    }
    return true
  })
}
