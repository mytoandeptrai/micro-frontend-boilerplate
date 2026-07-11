import { Badge } from "@ops/ui/components/badge"

import type { TaskStatus } from "../../types/task"

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  completed: "Completed",
}

const STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "outline"> = {
  todo: "outline",
  "in-progress": "default",
  completed: "secondary",
}

interface TaskStatusBadgeProps {
  status: TaskStatus
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
