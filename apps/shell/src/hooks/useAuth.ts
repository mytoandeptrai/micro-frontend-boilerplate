import { useStore } from "@ops/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { fetchMe, loginApi, logoutApi } from "../api/auth"

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useStore.use.setUser()
  const setAuthenticated = useStore.use.setAuthenticated()

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      setUser(null)
      setAuthenticated(false)
      queryClient.removeQueries({ queryKey: ["auth"] })
      navigate("/login", { replace: true })
    },
  })
}
