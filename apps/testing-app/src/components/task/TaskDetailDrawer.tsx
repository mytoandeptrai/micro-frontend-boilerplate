import { useEffect } from "react"

import { Button } from "@ops/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@ops/ui/components/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ops/ui/components/tabs"

import { useProjects } from "../../hooks/useProjects"
import { useTags } from "../../hooks/useTags"
import { useTaskDetail } from "../../hooks/useTaskDetail"
import { useUpdateTaskStatus } from "../../hooks/useUpdateTaskStatus"
import { canTransitionStatus } from "../../lib/businessRules"
import { formatDate } from "../../lib/date"
import {
  useCloseTaskDetail,
  useIsDetailDrawerOpen,
  usePendingDeletions,
  useSelectedTaskId,
} from "../../store/taskStore"
import type { TaskStatus } from "../../types/task"
import TaskDeleteDialog from "./TaskDeleteDialog"
import TaskFormModal from "./TaskFormModal"
import TaskPriorityBadge from "./TaskPriorityBadge"
import TaskStatusBadge from "./TaskStatusBadge"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

export default function TaskDetailDrawer() {
  const isOpen = useIsDetailDrawerOpen()
  const closeTaskDetail = useCloseTaskDetail()
  const taskId = useSelectedTaskId()
  const pendingDeletions = usePendingDeletions()

  const { data: task, isLoading } = useTaskDetail(taskId)
  const { data: projects } = useProjects()
  const { data: tags } = useTags()
  const updateStatus = useUpdateTaskStatus()

  useEffect(() => {
    if (taskId && pendingDeletions.some((entry) => entry.taskId === taskId)) {
      closeTaskDetail()
    }
  }, [taskId, pendingDeletions, closeTaskDetail])

  const project = projects?.find((candidate) => candidate.id === task?.projectId)
  const taskTags = tags?.filter((tag) => task?.tagIds.includes(tag.id)) ?? []

  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && closeTaskDetail()}>
      <SheetContent className="flex flex-col gap-4 overflow-y-auto sm:max-w-md">
        {isLoading || !task ? (
          <p className="text-xs text-muted-foreground">Loading task…</p>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{task.title}</SheetTitle>
              <SheetDescription>Created {formatDate(task.createdAt, "long")}</SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                )}

                <div className="flex flex-col gap-1 text-xs">
                  <span>Project: {project?.name ?? "None"}</span>
                  <span>Deadline: {task.deadline ? formatDate(task.deadline) : "None"}</span>
                  {taskTags.length > 0 && (
                    <span>Tags: {taskTags.map((tag) => tag.name).join(", ")}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium">Status</span>
                  <fieldset className="m-0 flex gap-2 border-0 p-0" aria-label="Change status">
                    {STATUS_OPTIONS.map((option) => {
                      const disabled =
                        option.value === task.status ||
                        !canTransitionStatus(task.status, option.value)
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant={task.status === option.value ? "default" : "outline"}
                          disabled={disabled}
                          onClick={() =>
                            updateStatus.mutate({ id: task.id, status: option.value })
                          }
                        >
                          {option.label}
                        </Button>
                      )
                    })}
                  </fieldset>
                </div>

                <div className="flex gap-2">
                  <TaskFormModal
                    mode="edit"
                    task={task}
                    trigger={
                      <Button type="button" variant="outline" size="sm">
                        Edit task
                      </Button>
                    }
                  />
                  <TaskDeleteDialog
                    task={task}
                    trigger={
                      <Button type="button" variant="destructive" size="sm">
                        Delete task
                      </Button>
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="activity"
                className="flex flex-col gap-2 text-xs text-muted-foreground"
              >
                <span>Created {formatDate(task.createdAt, "long")}</span>
                <span>Last updated {formatDate(task.updatedAt, "long")}</span>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
