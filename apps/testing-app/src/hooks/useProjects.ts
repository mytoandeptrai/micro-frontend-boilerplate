import { useQuery } from "@tanstack/react-query"

import { getProjects } from "../api/projects.api"
import { projectKeys } from "../lib/queryKeys"

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: getProjects,
  })
}
