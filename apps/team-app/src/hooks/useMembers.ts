import { useQuery } from "@tanstack/react-query"
import http from "@ops/shared-utils/http"
import type { PaginatedResponseType } from "@ops/shared-utils/types"
import type { Member, MemberRole, MemberStatus } from "../types"

export interface MembersParams {
  page?: number
  limit?: number
  name?: string
  role?: MemberRole | null
  status?: MemberStatus | null
}

export type MembersMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

async function fetchMembers(params: MembersParams) {
  const result = await http.get<PaginatedResponseType<Member>>(
    "/api/v1/members",
    { params },
  )
  return result.data
}

export function useMembers(params: MembersParams = {}) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => fetchMembers(params),
  })
}
