import type { Theme } from "@ops/shared"
import http from "@ops/shared-utils/http"
import type { BaseResponseType } from "@ops/shared-utils/types"

export interface SettingsResponse {
  theme: Theme
}

export async function fetchSettings(): Promise<SettingsResponse> {
  const res =
    await http.get<BaseResponseType<SettingsResponse>>("/api/v1/settings")
  return res.data
}
