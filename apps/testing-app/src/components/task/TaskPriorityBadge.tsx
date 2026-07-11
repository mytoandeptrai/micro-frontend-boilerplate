import { Badge } from "@ops/ui/components/badge"

import type { TaskPriority } from "../../types/task"

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const PRIORITY_VARIANT: Record<TaskPriority, "secondary" | "outline" | "destructive"> = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
}

interface TaskPriorityBadgeProps {
  priority: TaskPriority
}

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABEL[priority]}</Badge>
}
