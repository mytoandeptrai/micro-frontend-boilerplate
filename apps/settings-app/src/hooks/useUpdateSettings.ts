import http from "@ops/shared-utils/http"
import type { BaseResponseType } from "@ops/shared-utils/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Settings, UpdateSettingsPayload } from "../types"

async function updateSettings(
  payload: UpdateSettingsPayload,
): Promise<Settings> {
  const result = await http.patch<BaseResponseType<Settings>>(
    "/api/v1/settings",
    payload,
  )
  return result.data
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data)
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast.success("Settings updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
