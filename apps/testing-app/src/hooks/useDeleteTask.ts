import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteTask } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
