import { useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@ops/shared-utils/http";
import type { BaseResponseType } from "@ops/shared-utils/types";
import { toast } from "sonner";
import type { CreateMemberPayload, Member, UpdateMemberPayload } from "../types";

async function createMember(payload: CreateMemberPayload): Promise<Member> {
  const result = await http.post<BaseResponseType<Member>>("/api/v1/members", payload);
  return result.data;
}

async function updateMember(id: string, payload: UpdateMemberPayload): Promise<Member> {
  const result = await http.put<BaseResponseType<Member>>(`/api/v1/members/${id}`, payload);
  return result.data;
}

async function deleteMember(id: string): Promise<Member> {
  const result = await http.delete<BaseResponseType<Member>>(`/api/v1/members/${id}`);
  return result.data;
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMemberPayload) => updateMember(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["members", id], data);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
