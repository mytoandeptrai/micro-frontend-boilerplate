import type { Member } from "@ops/shared/types"
import http from "@ops/shared-utils/http"
import type { BaseResponseType } from "@ops/shared-utils/types"

export async function fetchMe(): Promise<Member> {
  const res = await http.get<BaseResponseType<Member>>("/api/v1/auth/me")
  return res.data
}

export async function loginApi(
  email: string,
  password: string,
): Promise<Member> {
  const res = await http.post<BaseResponseType<Member>>("/api/v1/auth/login", {
    email,
    password,
  })
  return res.data
}

export async function logoutApi(): Promise<void> {
  await http.post("/api/v1/auth/logout", {})
}
