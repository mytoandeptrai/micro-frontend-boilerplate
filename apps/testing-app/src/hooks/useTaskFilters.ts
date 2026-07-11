import { useQueryState } from "nuqs"

import type { TaskSortDirection, TaskSortField } from "../lib/taskSort"
import type { TaskPriority, TaskStatus } from "../types/task"

export type TaskStatusFilterValue = TaskStatus | "all"
export type TaskPriorityFilterValue = TaskPriority | "all"

const STATUS_VALUES: TaskStatusFilterValue[] = ["all", "todo", "in-progress", "completed"]
const PRIORITY_VALUES: TaskPriorityFilterValue[] = ["all", "low", "medium", "high"]
const SORT_FIELD_VALUES: TaskSortField[] = ["createdAt", "deadline"]
const SORT_DIRECTION_VALUES: TaskSortDirection[] = ["asc", "desc"]

export function useTaskFilters() {
  const [keyword, setKeyword] = useQueryState("q", { defaultValue: "" })

  const [status, setStatus] = useQueryState<TaskStatusFilterValue>("status", {
    defaultValue: "all",
    parse: (value) =>
      STATUS_VALUES.includes(value as TaskStatusFilterValue)
        ? (value as TaskStatusFilterValue)
        : "all",
  })

  const [priority, setPriority] = useQueryState<TaskPriorityFilterValue>("priority", {
    defaultValue: "all",
    parse: (value) =>
      PRIORITY_VALUES.includes(value as TaskPriorityFilterValue)
        ? (value as TaskPriorityFilterValue)
        : "all",
  })

  const [sortField, setSortField] = useQueryState<TaskSortField>("sortBy", {
    defaultValue: "createdAt",
    parse: (value) =>
      SORT_FIELD_VALUES.includes(value as TaskSortField) ? (value as TaskSortField) : "createdAt",
  })

  const [sortDirection, setSortDirection] = useQueryState<TaskSortDirection>("sortDir", {
    defaultValue: "desc",
    parse: (value) =>
      SORT_DIRECTION_VALUES.includes(value as TaskSortDirection)
        ? (value as TaskSortDirection)
        : "desc",
  })

  return {
    keyword,
    setKeyword,
    status,
    setStatus,
    priority,
    setPriority,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
  }
}
