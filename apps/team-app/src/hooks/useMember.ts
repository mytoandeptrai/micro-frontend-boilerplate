import { useQuery } from "@tanstack/react-query";
import http from "@ops/shared-utils/http";
import type { BaseResponseType } from "@ops/shared-utils/types";
import type { Member } from "../types";

async function fetchMember(id: string): Promise<Member> {
  const result = await http.get<BaseResponseType<Member>>(`/api/v1/members/${id}`);
  return result.data;
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => fetchMember(id!),
    enabled: !!id,
  });
}
