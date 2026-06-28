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
export declare function useMembers(
  params?: MembersParams,
): import("@tanstack/react-query").UseQueryResult<
  NoInfer<{
    data: Member[]
    meta: import("@ops/shared-utils/types").PaginatedMeta
  }>,
  Error
>
