import http from "@ops/shared-utils/http"
import type { BaseResponseType } from "@ops/shared-utils/types"
import { useQuery } from "@tanstack/react-query"

export interface StatsData {
  id: string
  totalMembers: number
  activeMembers: number
  adminCount: number
  memberCount: number
  viewerCount: number
  updatedAt: string
}

async function fetchStats(): Promise<StatsData> {
  const res = await http.get<BaseResponseType<StatsData>>("/api/v1/stats")
  return res.data
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 30_000,
  })
}
