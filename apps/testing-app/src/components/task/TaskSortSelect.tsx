import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ops/ui/components/select"

import { useTaskFilters } from "../../hooks/useTaskFilters"
import type { TaskSortDirection, TaskSortField } from "../../lib/taskSort"

interface SortOption {
  value: string
  field: TaskSortField
  direction: TaskSortDirection
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: "createdAt-desc", field: "createdAt", direction: "desc", label: "Newest created" },
  { value: "createdAt-asc", field: "createdAt", direction: "asc", label: "Oldest created" },
  { value: "deadline-asc", field: "deadline", direction: "asc", label: "Deadline (soonest)" },
  { value: "deadline-desc", field: "deadline", direction: "desc", label: "Deadline (latest)" },
]

export default function TaskSortSelect() {
  const { sortField, sortDirection, setSortField, setSortDirection } = useTaskFilters()
  const currentValue = `${sortField}-${sortDirection}`

  function handleChange(next: string) {
    const option = SORT_OPTIONS.find((candidate) => candidate.value === next)
    if (!option) return
    setSortField(option.field)
    setSortDirection(option.direction)
  }

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-48" aria-label="Sort tasks">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
