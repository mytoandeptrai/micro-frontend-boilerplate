import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createTask } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"
import type { CreateTaskInput } from "../types/task"

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
