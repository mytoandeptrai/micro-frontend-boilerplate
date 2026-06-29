import { useStore } from "@ops/shared/store"
import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

export default function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useStore.use.isAuthenticated()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
