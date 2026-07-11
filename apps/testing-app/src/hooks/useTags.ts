import { useQuery } from "@tanstack/react-query"

import { getTags } from "../api/tags.api"
import { tagKeys } from "../lib/queryKeys"

export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: getTags,
  })
}
