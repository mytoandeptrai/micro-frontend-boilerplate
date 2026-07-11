import { Button } from "@ops/ui/components/button"
import { Checkbox } from "@ops/ui/components/checkbox"

import { useUpdateTaskStatus } from "../../hooks/useUpdateTaskStatus"
import { formatDate } from "../../lib/date"
import { useOpenTaskDetail } from "../../store/taskStore"
import type { Task } from "../../types/task"
import TaskDeleteDialog from "./TaskDeleteDialog"
import TaskFormModal from "./TaskFormModal"
import TaskPriorityBadge from "./TaskPriorityBadge"
import TaskStatusBadge from "./TaskStatusBadge"

interface TaskItemProps {
  task: Task
}

export default function TaskItem({ task }: TaskItemProps) {
  const openTaskDetail = useOpenTaskDetail()
  const updateStatus = useUpdateTaskStatus()
  const isCompleted = task.status === "completed"

  function handleToggleComplete() {
    updateStatus.mutate({ id: task.id, status: isCompleted ? "todo" : "completed" })
  }

  return (
    <li className="flex items-center gap-3 border-b border-border py-3">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggleComplete}
        aria-label={
          isCompleted ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`
        }
      />

      <button
        type="button"
        className="flex flex-1 flex-col items-start gap-1 text-left"
        onClick={() => openTaskDetail(task.id)}
      >
        <span className={isCompleted ? "text-sm text-muted-foreground line-through" : "text-sm"}>
          {task.title}
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
          {task.deadline && <span>Due {formatDate(task.deadline)}</span>}
        </span>
      </button>

      <TaskFormModal
        mode="edit"
        task={task}
        trigger={
          <Button type="button" variant="ghost" size="sm">
            Edit
          </Button>
        }
      />

      <TaskDeleteDialog
        task={task}
        trigger={
          <Button type="button" variant="ghost" size="sm">
            Delete
          </Button>
        }
      />
    </li>
  )
}
