import { useQuery } from "@tanstack/react-query"

import { getTask } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"

export function useTaskDetail(taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(taskId ?? ""),
    queryFn: () => {
      if (!taskId) throw new Error("useTaskDetail called without a taskId")
      return getTask(taskId)
    },
    enabled: taskId !== null,
  })
}
