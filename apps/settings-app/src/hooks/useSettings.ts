import http from "@ops/shared-utils/http"
import type { BaseResponseType } from "@ops/shared-utils/types"
import { useQuery } from "@tanstack/react-query"
import type { Settings } from "../types"

async function fetchSettings(): Promise<Settings> {
  const result = await http.get<BaseResponseType<Settings>>("/api/v1/settings")
  return result.data
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  })
}
