import type { CreateMemberPayload, Member, UpdateMemberPayload } from "../types"
export declare function useCreateMember(): import("@tanstack/react-query").UseMutationResult<
  Member,
  Error,
  CreateMemberPayload,
  unknown
>
export declare function useUpdateMember(
  id: string,
): import("@tanstack/react-query").UseMutationResult<
  Member,
  Error,
  UpdateMemberPayload,
  unknown
>
export declare function useDeleteMember(): import("@tanstack/react-query").UseMutationResult<
  Member,
  Error,
  string,
  unknown
>
