import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getCurrentUser, login, logout, register } from "../api/auth.api"
import { authKeys } from "../lib/queryKeys"
import type { LoginInput, RegisterInput } from "../types/task"

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getCurrentUser,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.session(), user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.session(), user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
