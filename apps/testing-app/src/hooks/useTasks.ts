import { useQuery } from "@tanstack/react-query"

import { getTasks } from "../api/tasks.api"
import { taskKeys } from "../lib/queryKeys"

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: getTasks,
  })
}
