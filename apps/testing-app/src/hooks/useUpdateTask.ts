import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateTask } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"
import type { Task, UpdateTaskInput } from "../types/task"

interface UpdateTaskVariables {
  id: string
  input: UpdateTaskInput
}

interface UpdateTaskContext {
  previousTask: Task | undefined
  previousTasks: Task[] | undefined
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, UpdateTaskVariables, UpdateTaskContext>({
    mutationFn: ({ id, input }) => updateTask(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id))
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists())

      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(id), { ...previousTask, ...input })
      }
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.lists(),
          previousTasks.map((task) => (task.id === id ? { ...task, ...input } : task)),
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
