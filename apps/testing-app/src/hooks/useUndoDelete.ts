import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { deleteTask } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"
import {
  useAddPendingDeletion,
  usePendingDeletions,
  useRemovePendingDeletion,
} from "../store/taskStore"
import type { Task } from "../types/task"

export const UNDO_WINDOW_MS = 5000

interface PendingSnapshot {
  task: Task
  index: number
}

// Module-level (not component-local) so requestDelete/undoDelete stay in sync
// no matter which component instance calls them — e.g. TaskItem requests the
// delete, UndoDeleteNotification (a different component) performs the undo.
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>()
const pendingSnapshots = new Map<string, PendingSnapshot>()

export function useUndoDelete() {
  const queryClient = useQueryClient()
  const pendingDeletions = usePendingDeletions()
  const addPendingDeletion = useAddPendingDeletion()
  const removePendingDeletion = useRemovePendingDeletion()

  const requestDelete = useCallback(
    (task: Task) => {
      const currentTasks = queryClient.getQueryData<Task[]>(taskKeys.lists()) ?? []
      const index = currentTasks.findIndex((existing) => existing.id === task.id)
      pendingSnapshots.set(task.id, { task, index: index === -1 ? 0 : index })

      queryClient.setQueryData<Task[]>(taskKeys.lists(), (previous) =>
        (previous ?? []).filter((existing) => existing.id !== task.id),
      )

      addPendingDeletion({ taskId: task.id, taskTitle: task.title })

      const timeoutId = setTimeout(async () => {
        pendingTimers.delete(task.id)
        pendingSnapshots.delete(task.id)
        removePendingDeletion(task.id)
        try {
          await deleteTask(task.id)
        } finally {
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        }
      }, UNDO_WINDOW_MS)

      pendingTimers.set(task.id, timeoutId)
    },
    [queryClient, addPendingDeletion, removePendingDeletion],
  )

  const undoDelete = useCallback(
    (taskId: string) => {
      const timeoutId = pendingTimers.get(taskId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        pendingTimers.delete(taskId)
      }

      const snapshot = pendingSnapshots.get(taskId)
      pendingSnapshots.delete(taskId)

      if (snapshot) {
        queryClient.setQueryData<Task[]>(taskKeys.lists(), (previous) => {
          const next = previous ? [...previous] : []
          const insertAt = Math.min(snapshot.index, next.length)
          next.splice(insertAt, 0, snapshot.task)
          return next
        })
      }

      removePendingDeletion(taskId)
    },
    [queryClient, removePendingDeletion],
  )

  return { pendingDeletions, requestDelete, undoDelete }
}
