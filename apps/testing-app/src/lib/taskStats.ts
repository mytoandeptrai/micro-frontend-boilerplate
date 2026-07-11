import type { Task } from "../types/task"

export interface TaskStatistics {
  total: number
  todo: number
  inProgress: number
  completed: number
  highPriority: number
}

export function computeStats(tasks: Task[]): TaskStatistics {
  const stats: TaskStatistics = {
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
  }

  for (const task of tasks) {
    stats.total += 1
    if (task.status === "todo") stats.todo += 1
    if (task.status === "in-progress") stats.inProgress += 1
    if (task.status === "completed") stats.completed += 1
    if (task.priority === "high") stats.highPriority += 1
  }

  return stats
}
