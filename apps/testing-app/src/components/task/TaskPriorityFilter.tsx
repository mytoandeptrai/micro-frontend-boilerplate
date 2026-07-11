import { Button } from "@ops/ui/components/button"

import { useTaskFilters, type TaskPriorityFilterValue } from "../../hooks/useTaskFilters"

const PRIORITY_OPTIONS: { value: TaskPriorityFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export default function TaskPriorityFilter() {
  const { priority, setPriority } = useTaskFilters()

  return (
    <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0" aria-label="Filter by priority">
      {PRIORITY_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={priority === option.value ? "default" : "outline"}
          onClick={() => setPriority(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </fieldset>
  )
}
