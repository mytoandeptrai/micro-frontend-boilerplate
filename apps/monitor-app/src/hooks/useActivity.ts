import http from "@ops/shared-utils/http"
import type { PaginatedResponseType } from "@ops/shared-utils/types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export interface ActivityItem {
  id: string
  eventType: "CREATED" | "UPDATED" | "DELETED"
  actorId: string
  actorName: string
  targetId: string | null
  targetName: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type ActivityMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

async function fetchActivity(page: number, limit: number) {
  const res = await http.get<PaginatedResponseType<ActivityItem>>("/api/v1/activity", {
    params: { page, limit },
  })
  return res.data
}

export function useActivity(limit = 20) {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ["activity", page, limit],
    queryFn: () => fetchActivity(page, limit),
    staleTime: 30_000,
  })

  return { ...query, page, setPage }
}
