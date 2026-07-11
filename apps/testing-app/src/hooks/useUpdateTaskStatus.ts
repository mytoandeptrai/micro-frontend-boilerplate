import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateTaskStatus } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"
import type { Task, TaskStatus } from "../types/task"

interface UpdateTaskStatusVariables {
  id: string
  status: TaskStatus
}

interface UpdateTaskStatusContext {
  previousTask: Task | undefined
  previousTasks: Task[] | undefined
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, UpdateTaskStatusVariables, UpdateTaskStatusContext>({
    mutationFn: ({ id, status }) => updateTaskStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id))
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists())

      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(id), { ...previousTask, status })
      }
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.lists(),
          previousTasks.map((task) => (task.id === id ? { ...task, status } : task)),
        )
      }

      return { previousTask, previousTasks }
    },

    onError: (_error, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask)
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
    },

    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
