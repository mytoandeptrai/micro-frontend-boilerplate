import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ops/ui/components/dialog"

import { useCreateTask } from "../../hooks/useCreateTask"
import { useUpdateTask } from "../../hooks/useUpdateTask"
import { mapFormValuesToCreateTaskInput, mapFormValuesToUpdateTaskInput } from "../../lib/mappers"
import type { Task } from "../../types/task"
import TaskForm, { type TaskFormValues } from "./TaskForm"

interface TaskFormModalProps {
  mode: "create" | "edit"
  task?: Task
  trigger: ReactNode
}

export default function TaskFormModal({ mode, task, trigger }: TaskFormModalProps) {
  const [open, setOpen] = useState(false)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const isSubmitting = mode === "create" ? createTask.isPending : updateTask.isPending
  const errorMessage =
    mode === "create"
      ? (createTask.error as Error | null)?.message
      : (updateTask.error as Error | null)?.message

  function handleSubmit(values: TaskFormValues) {
    if (mode === "create") {
      createTask.mutate(mapFormValuesToCreateTaskInput(values), {
        onSuccess: () => {
          toast.success("Task created")
          setOpen(false)
        },
      })
      return
    }

    if (!task) return
    updateTask.mutate(
      { id: task.id, input: mapFormValuesToUpdateTaskInput(values) },
      {
        onSuccess: () => {
          toast.success("Task updated")
          setOpen(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New task" : "Edit task"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new task to your list." : "Update the task details."}
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          defaultValues={
            task
              ? {
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  projectId: task.projectId ?? "",
                  tagIds: task.tagIds,
                  deadline: task.deadline ?? "",
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={mode === "create" ? "Create task" : "Save changes"}
        />

        {errorMessage && (
          <p role="alert" className="text-xs text-destructive">
            {errorMessage}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
