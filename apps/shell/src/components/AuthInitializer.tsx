import { useStore } from "@ops/shared/store"
import { type ReactNode, useEffect } from "react"
import { useMe } from "../hooks/useAuth"

export default function AuthInitializer({ children }: { children: ReactNode }) {
  const setUser = useStore.use.setUser()
  const setAuthenticated = useStore.use.setAuthenticated()
  const setLoading = useStore.use.setLoading()

  const { data, isError, isPending } = useMe()

  useEffect(() => {
    setLoading(isPending)
    if (data !== undefined) {
      setUser(data)
      setAuthenticated(true)
    } else if (isError) {
      setUser(null)
      setAuthenticated(false)
    }
  }, [isPending, data, isError, setUser, setAuthenticated, setLoading])

  return <>{children}</>
}
