import { Button } from "@ops/ui/components/button"

import { useTaskFilters, type TaskStatusFilterValue } from "../../hooks/useTaskFilters"

const STATUS_OPTIONS: { value: TaskStatusFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

export default function TaskStatusFilter() {
  const { status, setStatus } = useTaskFilters()

  return (
    <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0" aria-label="Filter by status">
      {STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={status === option.value ? "default" : "outline"}
          onClick={() => setStatus(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </fieldset>
  )
}
